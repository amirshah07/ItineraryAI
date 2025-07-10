import { useState, useEffect } from 'react';
import GeneratedTrip from './GeneratedTrip.jsx';
import { auth, db } from './firebase.config.js';
import { doc, updateDoc, getDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from "./Navbar";
import axios from 'axios';

export default function Main() {
    const user = auth.currentUser;
    const currentUserUid = user.uid;

    const [formData, setFormData] = useState({
        destination: '',
        startDate: '',
        endDate: '',
        budget: '',
        numPeople: '',
        activityLevel: 3,
        latitude: null,
        longitude: null
    });


    const [friends, setFriends] = useState([]);
    const [friendsData, setFriendsData] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [jsonData, setJsonData] = useState(null);

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
    }, [user]);

    const resetForm = () => {
        setFormData({
            destination: '',
            startDate: '',
            endDate: '',
            budget: '',
            numPeople: '',
            activityLevel: 3,
        });
        setSelectedFriends([]);
    };

    useEffect(() => {
        const loadGooglePlacesScript = () => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = initializeAutocomplete;
            script.onerror = (error) => console.error('Google Maps API failed to load:', error);
            document.head.appendChild(script);
        };

        const initializeAutocomplete = () => {
            if (window.google && window.google.maps) {
                const input = document.getElementById('destination');
                const autocomplete = new window.google.maps.places.Autocomplete(input, {
                    types: ['(cities)'],
                    fields: ['formatted_address', 'name', 'geometry'],
                });

                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (place.geometry) {
                        const { lat, lng } = place.geometry.location;
                        setFormData(prev => ({
                            ...prev,
                            destination: place.formatted_address || place.name,
                            latitude: lat(),
                            longitude: lng()
                        }));
                    }
                });

                // Set up event listener for blur event to reset the field
                input.addEventListener('blur', () => {
                    if (!autocomplete.getPlace()) {
                        setFormData(prev => ({
                            ...prev,
                            destination: ''
                        }));
                    }
                });

                // Function to update container size
                const updateContainerSize = () => {
                    const inputRect = input.getBoundingClientRect();
                    document.documentElement.style.setProperty('--input-width', `${inputRect.width}px`);
                    document.documentElement.style.setProperty('--input-left', `${inputRect.left}px`);
                };

                updateContainerSize();
                window.addEventListener('resize', updateContainerSize);
                const observer = new ResizeObserver(updateContainerSize);
                observer.observe(input);

                return () => {
                    window.removeEventListener('resize', updateContainerSize);
                    observer.disconnect();
                };
            } else {
                console.error("Google Maps API not loaded properly.");
            }
        };

        loadGooglePlacesScript();

        return () => {
            const script = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
            if (script) {
                document.head.removeChild(script);
            }
        };
    }, []);

    const validateDates = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffInMs = end - start;
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        return diffInDays <= 10;
    };

    const addFriendToTrip = (uid) => {
        if (!selectedFriends.includes(uid)) {
            setSelectedFriends((prev) => [...prev, uid]);
        }
    };

    const removeFriendFromTrip = (uid) => {
        setSelectedFriends(selectedFriends.filter((friend) => friend !== uid));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'endDate' && formData.startDate) {
            if (!validateDates(formData.startDate, value)) {
                alert('Trip duration cannot exceed 10 days');
                return;
            }
        }

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        const startDate = new Date(formData.startDate);
        const currentDate = new Date();
        if (startDate < currentDate) {
            alert('Start date cannot be in the past');
            return;
        }

        if (formData.numPeople <= 0) {
            alert('Number of people must be a positive number');
            return;
        }
        if (formData.budget <= 0) {
            alert('Budget must be a positive number');
            return;
        }

        if (!validateDates(formData.startDate, formData.endDate)) {
            alert('Trip duration cannot exceed 10 days');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            alert("Start date cannot be later than the end date.");
            return;
        }
    
        try {
            const tripPlannerData = {
                location: {
                    lat: formData.latitude,
                    lng: formData.longitude
                },
                interests: ["tourist attractions"],
                food: ["best local food"],
                trip_params: {
                    start_date: formData.startDate,
                    end_date: formData.endDate,
                    activity_level: parseInt(formData.activityLevel),
                    budget: parseInt(formData.budget)
                }
            }

            const response = await fetch('http://localhost:5000/api/generate-trip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tripPlannerData)
            });
            const { itinerary } = await response.json();

            const tripData = {
                destination: formData.destination,
                startDate: Timestamp.fromDate(new Date(formData.startDate)),
                endDate: Timestamp.fromDate(new Date(formData.endDate)),
                latitude: formData.latitude,
                longitude: formData.longitude,
                users: [user.uid, ...selectedFriends],
                itinerary: itinerary,
                budget: parseInt(formData.budget),
                numPeople: parseInt(formData.numPeople),
                activityLevel: parseInt(formData.activityLevel)
            };

            const tripRef = await addDoc(collection(db, "Trips"), tripData);

            // After the trip is created, update each user's document to include the trip ID
            const tripId = tripRef.id;
            await Promise.all(
                tripData.users.map(async (uid) => {
                    const userDocRef = doc(db, "Users", uid);
                    const userSnapshot = await getDoc(userDocRef);
    
                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.data();
                        const userTrips = userData.trips || [];

                        // Add the trip ID to the user's trips array if it isn't already added
                        if (!userTrips.includes(tripId)) {
                            await updateDoc(userDocRef, {
                                trips: [...userTrips, tripId],
                            });
                        }
                    }
                })
            );

            alert(`Trip created successfully!`);
            resetForm();
        } catch (error) {
            console.error("Error creating trip:", error);
            alert("Failed to create trip. Please try again.");
        }
      };

    return (
        <>
            <Navbar />
            <main>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="destination">Which city are you going to?</label>
                        <input
                            type="text"
                            id="destination"
                            name="destination"
                            value={formData.destination}
                            onChange={handleChange}
                            placeholder="e.g. Tokyo"
                            required
                            autoComplete="off"
                        />
                    </div>
                    <div>
                        <label htmlFor="dates">Dates & Time (Start - End)</label>
                        <input
                            type="datetime-local"
                            id="startDate"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="datetime-local"
                            id="endDate"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            min={formData.startDate}
                            max={formData.startDate ? new Date(new Date(formData.startDate).getTime() + (10 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 16) : undefined}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="budget">What is your budget?</label>
                        <input
                            type="number"
                            id="budget"
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            placeholder="e.g. 2500 (amount will be assumed to be in SGD)"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="numPeople">How many people will be going?</label>
                        <input
                            type="number"
                            id="numPeople"
                            name="numPeople"
                            value={formData.numPeople}
                            onChange={handleChange}
                            placeholder="Enter number of people"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="activityLevel">Activity Level</label>
                        <input
                            type="range"
                            id="activityLevel"
                            name="activityLevel"
                            min="1"
                            max="5"
                            step="1"
                            value={formData.activityLevel}
                            onChange={handleChange}
                            style={{
                                background: `linear-gradient(to right, #646cff 0%, #646cff ${(formData.activityLevel - 1) * 25}%, #555 ${(formData.activityLevel - 1) * 25}%, #555 100%)`
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Most rest time</span>
                            <span>Most activities</span>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="friendsDropdown">Add Friend to Trip</label>
                        <select
                            id="friendsDropdown"
                            onChange={(e) => {
                                const uid = e.target.value;
                                if (uid) {
                                    addFriendToTrip(uid);
                                    e.target.value = "";
                                }
                            }}
                            defaultValue=""
                        >
                            <option value="" disabled hidden>
                                Select a friend
                            </option>
                            {friendsData.map((friend) => (
                                <option key={friend.uid} value={friend.uid}>
                                    {friend.username}
                                </option>
                            ))}
                        </select>
                        <ul>
                            {selectedFriends.map((uid) => {
                                const friend = friendsData.find((f) => f.uid === uid);
                                return (
                                    <li key={uid}>
                                        {friend?.username || "Unknown User"}
                                        <button onClick={() => removeFriendFromTrip(uid)}>x</button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div>
                        <button type="submit">Create Trip</button>
                    </div>
                </form>
            </main>
        </>
    );
}
