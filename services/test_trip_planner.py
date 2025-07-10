from trip_planner import TripPlanner
import json


def test_basic_flow():
    planner = TripPlanner()

    location = {
        "lat": 1.28967,
        "lng": 103.85007
    }

    interests = [
        "popular places",
        "top attractions",
        "tourist attractions",
        "points of interest",
        "landmarks",
        "museums",
        "historical sites",
        "hip places"
    ]

    food = [
        "best local food",
    ]

    interests_food = interests + food

    trip_params = {
        'start_date': '2025-02-02',
        'end_date': '2025-02-11',
        'activity_level': 4,
        'wake_time': '09:00',
        'sleep_time': '02:00',
        'budget': 1000
    }

    print("Getting places data...")
    itinerary, full_data = planner.plan_trip(
        interests_food,
        location,
        trip_params
    )

    if itinerary:
        print("\nGenerated Itinerary:")
        print(json.dumps(itinerary, indent=2))
        print("\nFull Places Data:")
        print(json.dumps(full_data, indent=2))
    else:
        print("Failed to generate itinerary")


if __name__ == "__main__":
    test_basic_flow()
