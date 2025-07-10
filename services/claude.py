import anthropic
import json
import os
from dotenv import load_dotenv
from datetime import datetime


class ClaudeAPI:
    def __init__(self):
        load_dotenv()
        self.client = anthropic.Anthropic(
            api_key=os.getenv('VITE_CLAUDE_SONNET_API_KEY')
        )
        self.model = "claude-3-sonnet-20240229"

    def generate_itinerary(self, places_data, trip_params):
        try:
            prompt = self._create_itinerary_prompt(places_data, trip_params)

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            with open(f"claude_prompt_{timestamp}.txt", 'w', encoding='utf-8') as f:
                f.write(prompt)

            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                temperature=0.7,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            if hasattr(response, 'content'):
                content = response.content[0].text
                with open(f"claude_full_response_{timestamp}.txt", 'w', encoding='utf-8') as f:
                    f.write(content)
            else:
                content = str(response)

            return self._parse_itinerary_response(content)

        except Exception as e:
            print(f"Claude API Error: {e}")
            print(f"Response type: {type(response)}")
            return None

    def _create_itinerary_prompt(self, places_data, trip_params):
        # compressed_data = {}
        # for category, data in places_data.items():
        #     compressed_data[category] = {
        #         'places': [{
        #             'id': p['id'],
        #             'n': p['name'],
        #             'a': p['address'],
        #             'loc': p['location'],
        #             'r': p['rating'],
        #             'd': p.get('description', ''),
        #             'h': [h.replace('\u202f', ' ').replace('\u2009', ' ').replace('\u2013', '-')
        #                   for h in p.get('hours', [])],
        #             'p': p.get('price_level', '')
        #         } for p in data['places']]
        #     }

        prompt = (
            f"""Create a detailed trip itinerary with the following requirements:

Trip Dates: {trip_params['start_date']} to {trip_params['end_date']}
Activity Level: {trip_params['activity_level']}/5
Daily Schedule: {trip_params['wake_time']} to {trip_params['sleep_time']}
Budget: {trip_params['budget']}

Available Places:
{json.dumps(places_data, separators=(',', ':'))}

Please create a structured itinerary that:
1. Groups activities by day
2. Includes timing for each activity
3. Attempt to fit things within the budget specified
4. Considers activity intensity e.g. i doubt people want to boulder every day of the trip, allow them to experience other things, and proper spacing i.e if activity level 1 then fewer activities per day, if 5 then more
5. Ensure you fill up all the dates in the range specified
6. Accounts for travel time between locations
7. Only include specific locations / activities, i.e. for breaks / travel just leave blank & no need to generate for example:
    do not generate things like:
        "name": "Break",
        "start_time": "11:00", 
        "duration": "1 hour",
        "type": "break"
8. If running out of tokens, reduce activities but complete the JSON!!! ALWAYS COMPLETE THE JSON (IMPORTANT)
9. Try to always include the most iconic places of the city if possible

Format the response as a JSON object with the following structure:
{{
    "days": [
        {{
            "date": "YYYY-MM-DD",
            "activities": [
                {{
                    "id": "unique location id",
                    "name": "Activity name",
                    "start": "HH:MM",
                    "duration": "X hours",
                    "type": "activity/restaurant/cafe"
                }}
            ]
        }}
    ]
}}""")
        return prompt

    def _parse_itinerary_response(self, response):
        try:
            if isinstance(response, list):
                response = response[0]

            if hasattr(response, 'content'):
                content = response.content
            else:
                content = str(response)

            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1

            if start_idx == -1 or end_idx == 0:
                raise ValueError("No valid JSON object found in response")

            json_str = content[start_idx:end_idx]

            try:
                itinerary = json.loads(json_str)
            except json.JSONDecodeError as e:
                print(f"JSON Decode Error: {e}")
                print(f"Problematic JSON string: {json_str[:200]}...")
                raise

            if 'days' not in itinerary:
                raise ValueError("Invalid itinerary structure")

            return itinerary

        except Exception as e:
            print(f"Response Parsing Error: {e}")
            print(f"Response type: {type(response)}")
            return None
