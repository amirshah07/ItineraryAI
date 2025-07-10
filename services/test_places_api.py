from googlePlaces import PlacesAPI
import json

def test_search():
    api = PlacesAPI()
    location = {"lat": 40.7128, "lng": -74.0060}
    
    # Test a single query first
    results = api.get_all_results("restaurants", location)
    print("\nTest Results:", json.dumps(results, indent=2))


if __name__ == "__main__":
    test_search()