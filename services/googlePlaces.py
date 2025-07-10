import requests
import os
from dotenv import load_dotenv
import json
from datetime import datetime
import time

load_dotenv()


class PlacesAPI:
    def __init__(self):
        self.api_key = os.getenv('VITE_GOOGLE_PLACES_API_KEY')
        self.signing_secret = os.getenv('VITE_GOOGLE_URL_SIGNING_SECRET')
        self.base_url = "https://places.googleapis.com/v1"
        self.headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': self.api_key,
            'X-Goog-FieldMask': ','.join([
                'places.displayName',
                'places.formattedAddress',
                'places.rating',
                'places.location',
                'places.editorialSummary',
                'places.googleMapsUri',
                'places.regularOpeningHours',
                'places.currentOpeningHours',
                'places.priceLevel',
                'places.websiteUri',
                'places.types',
                'places.id',
                'places.photos',
                'places.userRatingCount'
            ])
        }

    def text_search(self, query: str, location: dict):
        try:
            url = f"{self.base_url}/places:searchText"
            data = {
                'textQuery': query,
                'locationBias': {
                    "circle": {
                        "center": {
                            "latitude": location['lat'],
                            "longitude": location['lng']
                        },
                        "radius": 25000.0
                    }
                },
                'maxResultCount': 15
            }

            response = requests.post(url, headers=self.headers, json=data)

            if response.status_code != 200:
                print(f"API Error: {response.status_code}")
                print(f"Response: {response.text}")
                return None

            return response.json()

        except Exception as e:
            print(f"Text Search Error: {e}")
            return None

    def get_all_results(self, query: str, location: dict, min_results=3):
        try:
            self.headers['X-Goog-FieldMask'] = ','.join([
                'places.displayName',
                'places.formattedAddress',
                'places.location',
                'places.rating',
                'places.editorialSummary',
                'places.regularOpeningHours.weekdayDescriptions',
                'places.priceLevel',
                'places.types',
                'places.id',
                'places.userRatingCount',
                'places.googleMapsUri'
            ])

            response = self.text_search(query, location)

            if response and 'places' in response:
                sorted_places = sorted(
                    response['places'],
                    key=lambda x: (
                        x.get('rating', 0) * 0.3 + 
                        (x.get('userRatingCount', 0) / 10000) * 0.7
                    ),
                    reverse=True
                )

                compressed_places = []
                claude_places = []
                
                for place in sorted_places[:min_results]:
                    compressed_place = {
                        'id': place.get('id', ''),
                        'name': place.get('displayName', {}).get('text', ''),
                        'address': place.get('formattedAddress', ''),
                        'location': place.get('location', {}),
                        'rating': place.get('rating', 0),
                        'description': place.get('editorialSummary', {}).get('text', ''),
                        'hours': [h.replace('\u202f', ' ').replace('\u2009', ' ').replace('\u2013', '-')
                            for h in place.get('regularOpeningHours', {}).get('weekdayDescriptions', [])],
                        'price_level': place.get('priceLevel', ''),
                        'types': place.get('types', []),
                        'maps_url': place.get('googleMapsUri', '')
                    }
                    compressed_places.append(compressed_place)
                    
                    claude_place = {
                        'id': place.get('id', ''),
                        'n': place.get('displayName', {}).get('text', ''),
                        'a': place.get('formattedAddress', ''),
                        'loc': place.get('location', {}),
                        'r': place.get('rating', 0),
                        'd': place.get('editorialSummary', {}).get('text', ''),
                        'h': [h.replace('\u202f', ' ').replace('\u2009', ' ').replace('\u2013', '-')
                            for h in place.get('regularOpeningHours', {}).get('weekdayDescriptions', [])],
                        'p': place.get('price_level', '')
                    }
                    claude_places.append(claude_place)

                return {
                    'places': compressed_places,
                    'claude_data': {'places': claude_places}
                }

            return {'places': [], 'claude_data': {'places': []}}

        except Exception as e:
            print(f"Search Error for {query}: {e}")
            return {
                'places': [],
                'claude_data': {'places': []}
            }

    def nearby_search(self, location: dict, type: str = None):
        try:
            url = f"{self.base_url}/places:searchNearby"
            data = {
                'locationRestriction': {
                    'circle': {
                        'center': location,
                        'radius': '20000'
                    }
                }
            }
            if type:
                data['includedTypes'] = [type]
            return requests.post(url, headers=self.headers, json=data).json()
        except Exception as e:
            print(f"Nearby Search Error: {e}")
            return None

    def get_place_details(self, place_id: str):
        try:
            url = f"{self.base_url}/places/{place_id}"
            return requests.get(url, headers=self.headers).json()
        except Exception as e:
            print(f"Place Details Error: {e}")
            return None

    def save_search_results(self, results, filename=None):
        """Save search results to a formatted file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"places_search_{timestamp}.txt"

        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write("=== Google Places Search Results ===\n\n")

                if 'places' in results:
                    for i, place in enumerate(results['places'], 1):
                        f.write(f"Place #{i}\n")
                        f.write(
                            f"Name: {place.get('displayName', {}).get('text', 'N/A')}\n")
                        f.write(f"Address: {place.get(
                            'formattedAddress', 'N/A')}\n")
                        f.write(f"Rating: {place.get('rating', 'N/A')}\n")

                        # Description
                        if 'editorialSummary' in place:
                            f.write(f"Description: {
                                    place['editorialSummary'].get('text', 'N/A')}\n")

                        # Google Maps Link
                        f.write(f"Google Maps Link: {
                                place.get('googleMapsUri', 'N/A')}\n")

                        # Price Level
                        if 'priceLevel' in place:
                            f.write(f"Price Level: {place['priceLevel']}\n")

                        # Opening Hours
                        if 'regularOpeningHours' in place:
                            f.write("Opening Hours:\n")
                            for hours in place['regularOpeningHours'].get('weekdayDescriptions', []):
                                f.write(f"  {hours}\n")

                        # Current/Special Hours
                        if 'currentOpeningHours' in place:
                            f.write("Current Opening Hours:\n")
                            for hours in place['currentOpeningHours'].get('weekdayDescriptions', []):
                                f.write(f"  {hours}\n")

                        # Special Hours (holidays etc)
                        if 'secondaryOpeningHours' in place:
                            f.write("Special Hours:\n")
                            for period in place['secondaryOpeningHours']:
                                f.write(f"  {period}\n")

                        # Website
                        if 'websiteUri' in place:
                            f.write(f"Website: {place['websiteUri']}\n")

                        f.write("\n" + "="*50 + "\n\n")

                return filename
        except Exception as e:
            print(f"Error saving results: {e}")
            return None

    def save_json_results(self, results, filename=None):
        """Save raw results in JSON format"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"places_data_{timestamp}.json"

        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            return filename
        except Exception as e:
            print(f"Error saving JSON: {e}")
            return None
