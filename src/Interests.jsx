import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase.config.js";
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import Navbar from "./Navbar.jsx";


export default function Interests() {
  const [interest, setInterest] = useState('');
  const [interestsList, setInterestsList] = useState([]);
  const user = auth.currentUser; 
  const currentUserUid = user.uid;
  //console.log(user.uid);
  
  /* Display interests from interests[] */
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "Users", currentUserUid), (doc) => {
      if (doc.exists()) {
        setInterestsList(doc.data().interests || []); // Get the interests array or initialize to an empty array
      }
    });
    return () => unsubscribe();
  }, [user]);

  function titleCase(s) {
    return s.toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
} // for editing input

  const handleAddInterest = async () => {
    // prevent empty input
    if (interest.trim() === '') {
      alert('Please enter a valid interest.'); 
      return;
    }

    // max one word input
    if (/\s/.test(interest)) {
      alert("Interest must be one word.");
      return;
    }

    // cap at 5 interests
    if (interestsList.length >= 5) {
        alert('You can only add up to 5 interests.'); 
        return;
    }

    const userRef = doc(db, "Users", currentUserUid);
    try {
      await updateDoc(userRef, {
        interests: arrayUnion(titleCase(interest.trim())), // Add interest in lowercase
      });
      setInterest(""); // Clear input field
    } catch (error) {
      console.error("Error adding interest:", error);
    }
  };

  const handleRemoveInterest = async (index) => {
    setInterestsList(interestsList.filter((interest, i) => i !== index));
  };

  return (
    <>
    <Navbar/>
      <div className="interest-form-wrapper">
        <h2>Input Your Interests</h2>
        <div className="form-group">
          <input
            type="text"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            placeholder="Enter an interest"
            required
          />
          <button type="submit" onClick={handleAddInterest}>Add</button>
        </div>
        <ul className="interests-list">
          {interestsList.map((item, index) => (
            <li key={index}>
              {item}
              <button
                className="remove-btn"
                onClick={() => handleRemoveInterest(index)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
