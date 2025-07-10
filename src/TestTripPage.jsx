import React, { useEffect, useRef, useState } from "react";
import Popup from "reactjs-popup";
import { auth, db } from './firebase.config.js'; 
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from "./Navbar";
import { useParams } from 'react-router-dom';

import DataBlock from './DataBlock';


export default function TestTrip() {
  const { tripId } = useParams();
  console.log(tripId);
  const user = auth.currentUser;
  console.log(user.uid);

  const [tripData, setTripData] = useState(null);

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const tripRef = doc(db, "Trips", tripId);
        const tripSnap = await getDoc(tripRef);

        if (tripSnap.exists()) {
          const data = tripSnap.data();
          if (data.itinerary) {
            setTripData(data.itinerary);
          } else {
            console.error("No itinerary found in trip data");
          }
        } else {
          console.error("Trip not found!");
        }
      } catch (err) {
        console.error("Error fetching trip data:", err);
      }
    };

    fetchTripData();
  }, [tripId]);

  console.log(tripData)


  /*
  useEffect(() => {
        const fetchFriends = async () => {
            if (user) {
                try {
                    const userDoc = doc(db, "Users", user.uid);
                    const userRef = await getDoc(userDoc);

                    if (userRef.exists()) {
                        const userData = userRef.data();
                        const friendUIDs = userData.friends || [];
                        setFriends(friendUIDs);

                        const friendsDetails = await Promise.all(
                            friendUIDs.map(async (uid) => {
                                const friendDocRef = doc(db, "Users", uid);
                                const friendSnapshot = await getDoc(friendDocRef);
                                if (friendSnapshot.exists()) {
                                    const friendData = friendSnapshot.data();
                                    return { uid, username: friendData.username };
                                }
                                return null;
                            })
                        );
                        setFriendsData(friendsDetails.filter(Boolean));
                    }
                } catch (error) {
                    console.error("Error fetching friends:", error);
                }
            }
        };

        fetchFriends();
    }, [user]); */



  const mapRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  //const [friends, setFriends] = useState([]);
  //const [selectedFriends, setSelectedFriends] = useState([]);
  const [userDetails, setUserDetails] = useState(null); // Added userDetails state
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    numPeople: '',
    activityLevel: 3
  });
  const [foodInput, setFoodInput] = useState('');
  const [foodSuggestions, setFoodSuggestions] = useState([]);
  const [activityInput, setActivityInput] = useState('');
  const [activitySuggestions, setActivitySuggestions] = useState([]);
  const [maxFriendsWarning, setMaxFriendsWarning] = useState('');
  const tripItinerary = [
    <DataBlock data={tripData} />
];



  // Fetch user data from Firebase
  /*const fetchUserData = async () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "Users", user.uid));
          if (userDoc.exists()) {
            setUserDetails(userDoc.data());
          } else {
            console.error("User not found");
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
    });
  }; */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  // Fetch friends data
  /* const fetchFriends = async () => {
    if (userDetails) {
      try {
        const friendsData = userDetails.friends || [];
        setFriends(friendsData);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    }
  }; */

  /* useEffect(() => {
    fetchFriends();
  }, [userDetails]); */

  // Handle adding friends to trip
  /* const addFriendToTrip = (friend) => {
    if (selectedFriends.length >= 8) {
      setMaxFriendsWarning('Maximum of 8 friends allowed per trip');
      return;
    }
    if (!selectedFriends.includes(friend)) {
      setSelectedFriends((prev) => [...prev, friend]);
      setMaxFriendsWarning('');
    }
  }; */

  // Handle removing friends from trip
  /* const removeFriendFromTrip = (friendToRemove) => {
    setSelectedFriends(selectedFriends.filter(friend => friend !== friendToRemove));
  }; */


  const [friends, setFriends] = useState([]);
  const [friendsData, setFriendsData] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [tripUsers, setTripUsers] = useState([]);

  useEffect(() => {
    const fetchTripUsers = async () => {
      try {
        // Fetch the trip document
        const tripRef = doc(db, "Trips", tripId);
        const tripSnap = await getDoc(tripRef);

        if (tripSnap.exists()) {
          const tripData = tripSnap.data();
          const userUIDs = tripData.users || []; // Assume 'users' is an array of UIDs

          // Fetch usernames for each UID
          const usernamePromises = userUIDs.map(async (uid) => {
            const userRef = doc(db, "Users", uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              return userSnap.data().username || "Unknown User";
            } else {
              return "Unknown User";
            }
          });

          const resolvedUsernames = await Promise.all(usernamePromises);
          setTripUsers(resolvedUsernames);
        } else {
          console.error("Trip not found!");
        }
      } catch (err) {
        console.error("Error fetching trip users:", err);
      }
    };

    fetchTripUsers();
  }, [tripId]);



  // Google Maps API and initialization
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 35.6895, lng: 139.6917 }, // Tokyo center coordinates
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      const locations = [
        { lat: 35.6895, lng: 139.6917, title: "Tokyo City Center" },
        { lat: 35.6586, lng: 139.7454, title: "Tokyo Tower" },
        { lat: 35.6764, lng: 139.6993, title: "Shibuya Crossing" },
      ];

      locations.forEach((location) => {
        new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map,
          title: location.title,
        });
      });
    };
    document.head.appendChild(script);
  }, []);

  // Handle trip regeneration (opens a popup)
  const handleRegenerate = () => {
    setIsOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsOpen(false);
  };

  return (
    <>
      <Navbar />
      <div className="test-trip">
        <div className="trip-content">
          <div className="trip-itinerary">
            <h1>Your Generated Trip</h1>
            <DataBlock
              data={tripData}
            />

          </div>
          <div className="trip-controls">
            <div className="controls-content">

              {/* Add friends section */}
              <div className="friend-functionality">
                <label htmlFor="friendsDropdown">Add Friend to Trip</label>
                <select
                  id="friendsDropdown"
                  onChange={(e) => {
                    addFriendToTrip(e.target.value);
                    e.target.value = "";
                  }}
                  defaultValue=""
                  disabled={selectedFriends.length >= 8}
                >
                  <option value="" disabled hidden>
                    Select a friend
                  </option>
                  {friends.map((friend, index) => (
                    <option key={index} value={friend}>
                      {friend}
                    </option>
                  ))}
                </select>
                {maxFriendsWarning && (
                  <p className="warning-message" style={{ color: '#ff4646', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    {maxFriendsWarning}
                  </p>
                )}
                <ul>
                  {selectedFriends.map((friend, index) => (
                    <li key={index}>
                      {friend}
                      <button
                        id="removeAddedFriend"
                        type="button"
                        onClick={() => removeFriendFromTrip(friend)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              

              <div>
                <h2>Users in this Trip</h2>
                <ul>
                  {tripUsers.map((username, index) => (
                    <li key={index}>{username}</li>
                  ))}
                </ul>
              </div>




            </div>
          </div>

          <div className="trip-map">
            <div ref={mapRef} className="map-container" />
          </div>
        </div>
      </div>

      <Popup open={isOpen} closeOnDocumentClick onClose={() => setIsOpen(false)}>
        <div className="popup-content">
          <h2>Customize Your Trip</h2>

          {/* Form Section */}
          <form onSubmit={handleSubmit}>
            {/* Food Suggestions */}
            <div className="popup-form-group">
              <label htmlFor="foodSuggestions">Food Suggestions</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  id="foodSuggestions"
                  name="foodSuggestions"
                  value={foodInput || ''}
                  onChange={(e) => setFoodInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (foodSuggestions.length >= 10) {
                      alert('Maximum of 10 food suggestions allowed');
                      return;
                    }
                    if (foodInput.trim()) {
                      setFoodSuggestions([...foodSuggestions, foodInput.trim()]);
                      setFoodInput('');
                    }
                  }}
                  disabled={foodSuggestions.length >= 10}
                >
                  Add
                </button>
              </div>
              <ul>
                {foodSuggestions.map((item, index) => (
                  <li key={index} style={{ color: '#fff' }}>
                    {item}
                    <button
                      type="button"
                      style={{ marginLeft: '10px', color: '#646cff', background: 'none', border: 'none', cursor: 'pointer' }}
                      onClick={() => setFoodSuggestions(foodSuggestions.filter((_, i) => i !== index))}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Activity Suggestions */}
            <div className="popup-form-group">
              <label htmlFor="activitySuggestions">Activity Suggestions</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  id="activitySuggestions"
                  name="activitySuggestions"
                  value={activityInput || ''}
                  onChange={(e) => setActivityInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (activitySuggestions.length >= 20) {
                      alert('Maximum of 20 activity suggestions allowed');
                      return;
                    }
                    if (activityInput.trim()) {
                      setActivitySuggestions([...activitySuggestions, activityInput.trim()]);
                      setActivityInput('');
                    }
                  }}
                  disabled={activitySuggestions.length >= 20}
                >
                  Add
                </button>
              </div>
              <ul>
                {activitySuggestions.map((item, index) => (
                  <li key={index} style={{ color: '#fff' }}>
                    {item}
                    <button
                      type="button"
                      style={{ marginLeft: '10px', color: '#646cff', background: 'none', border: 'none', cursor: 'pointer' }}
                      onClick={() => setActivitySuggestions(activitySuggestions.filter((_, i) => i !== index))}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Activity Level Slider */}
            <div className="popup-form-group">
              <label htmlFor="activityLevel">Activity Level</label>
              <input
                type="range"
                id="activityLevel"
                name="activityLevel"
                min="1"
                max="5"
                step="1"
                value={formData.activityLevel}
                onChange={handleInputChange}
                style={{
                  background: `linear-gradient(to right, #646cff 0%, #646cff ${(formData.activityLevel - 1) * 25}%, #555 ${(formData.activityLevel - 1) * 25}%, #555 100%)`,
                }}
              />
              <div className="slider-labels">
                <span>Most rest time</span>
                <span>Most activities</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="popup-buttons">
              <button type="button" onClick={() => setIsOpen(false)}>
                Cancel
              </button>
              <button type="submit">Generate</button>
            </div>
          </form>
        </div>
      </Popup>
    </>
  );
}
