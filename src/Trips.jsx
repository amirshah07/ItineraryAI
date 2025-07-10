import { useState, useEffect } from 'react';
import { auth, db } from './firebase.config.js';
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import Navbar from "./Navbar.jsx";
import { useParams } from 'react-router-dom';



export default function Trips() {
    const [userDetails, setUserDetails] = useState(null);
    const [userTrips, setUserTrips] = useState([]);

    const user = auth.currentUser;
    const currentUserUid = user.uid;
    const navigate = useNavigate();

    //console.log(user);
    const fetchUserTrips = async () => {
      try {
        const userRef = doc(db, "Users", currentUserUid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          console.error("User not found");
          return;
        }

        const tripIds = userDoc.data().trips;
        //console.log(tripIds);

        // If user not added to any trips
        if (tripIds.length === 0) {
          console.log("No trips found");
          return;
        }

        const trips = [];
        for (const tripId of tripIds) {
          const tripRef = doc(db, "Trips", tripId);
          const tripDoc = await getDoc(tripRef);

          if (tripDoc.exists()) {
            trips.push({ id: tripDoc.id, ...tripDoc.data() });
          } else {
            console.warn(`Trip with ID ${tripId} not found`);
          }
        }

        //console.log(trips);
        setUserTrips(trips);
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    }
    
    useEffect(() => {
        fetchUserTrips();
    }, []);

    const handleItemClick = (tripId) => {
      console.log(`Trip ${tripId} clicked!`);
      navigate(`/trips/${tripId}`); // Redirect to the trip's details page using its ID
    }


    
    

      return (
        <div>
          <Navbar />
          <div className='trips-page'>
            <h2>Upcoming Trips</h2>
            {userTrips.length > 0 ? (
              <ul>
                {userTrips.map((trip) => (
                  <li key={trip.id} onClick={() => handleItemClick(trip.id)}>
                    <h3>{trip.destination}</h3>
                    <p><strong>Start Date:</strong> {trip.startDate.toDate().toLocaleString(undefined, { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                })}</p>
                    <p><strong>End Date:</strong> {trip.endDate.toDate().toLocaleString(undefined, { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                })}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-trips">
                <Navbar />
                <p>No upcoming trips planned</p>
                <p className="text-sm text-gray-400">Time to start planning your next adventure!</p>
              </div>
            )}
          </div>
        </div>
      );
}
