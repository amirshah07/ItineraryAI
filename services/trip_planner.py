from googlePlaces import PlacesAPI
from claude import ClaudeAPI
from datetime import datetime
import json


class TripPlanner:
    def __init__(self):
        self.places_api = PlacesAPI()
        self.claude_api = ClaudeAPI()

    def plan_trip(self, interests_list, location, trip_params):
        try:
            extended_queries = ["tourist attractions", "best local food"]

            all_places_data = {}
            full_places_data = {}
            
            for interest in interests_list:
                if any(query in interest.lower() for query in extended_queries) and (len(interests_list) < 2):
                    min_results = 15
                elif any(query in interest.lower() for query in extended_queries) and (len(interests_list) >= 2):
                    min_results = 10
                else:
                    min_results = 3

                results = self.places_api.get_all_results(
                    interest,
                    location,
                    min_results=min_results
                )

                if isinstance(results, dict) and 'claude_data' in results:
                    all_places_data[interest] = results['claude_data']
                    full_places_data[interest] = results['places']
                else:
                    print(f"Invalid results format for {interest}")
                    continue

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            with open(f"places_data_{timestamp}.json", 'w') as f:
                json.dump(full_places_data, f, indent=2)

            itinerary = self.claude_api.generate_itinerary(
                all_places_data,
                trip_params
            )

            if itinerary:
                with open(f"claude_response_{timestamp}.json", 'w') as f:
                    json.dump(itinerary, f, indent=2)
                return itinerary, full_places_data
            else:
                return None, None

        except Exception as e:
            print(f"Trip Planning Error: {e}")
            return None, None
