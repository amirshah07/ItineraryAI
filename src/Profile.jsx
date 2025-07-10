import React, { useState } from "react"; 
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase.config";
import { updateDoc, doc, query, where, collection, getDocs } from "firebase/firestore";
import googleLogo from "./images/google.png";
import globeLogo from "./images/travel.png";


export default function Profile() {
  const user = auth.currentUser;
  const [username, setUsername] = useState(""); 
  const [gender, setGender] = useState(""); 

  function handleUsernameChange(event) {
    setUsername(event.target.value);
  }

  function handleGenderChange(event) {
    setGender(event.target.value);
  }

  const validateUserame = () => {
    // Validate input
    const regex = /^[a-z0-9]{0,25}$/;

    if (regex.test(username)) {
      checkUsernameAvailability();
    } else {
      // If input invalid
      alert("Username must:\n • consist of only lowercase letters and numbers \n• not include spacing\n• have maximum of 25 characters");
      window.location.href = '/profile';
    }
  }

  const checkUsernameAvailability = async () => {
    try {
      // Query check if  username already exists in Firestore
      const q = query(collection(db, "Users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("Username taken");
        window.location.href = '/profile';
      } else {
        const userRef = doc(db, "Users", user.uid);
        // Update field in user info
        await updateDoc(userRef, {
          username: username,
          gender: gender,
        });
        
        console.log(gender);
        console.log("Username added to User");
        window.location.href = "/homepage";
      }
    } catch (err) {
      console.error("Error checking username:", err);
      setError("There was an error checking the username. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    validateUserame();
  };

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <div className="login-heading">
          <img src={globeLogo} alt="Logo"/>
          <h1>ItineraryAI</h1>
        </div>
        <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start", // Align everything to the left
    gap: "10px",
    marginBottom: "10px",
  }}
>
  <input
    type="text"
    id="username"
    name="username"
    placeholder="Enter your username (max. 25 characters)"
    value={username} // Controlled input
    onChange={handleUsernameChange} // Handle input change
    style={{
      width: "100%", // Full width for better alignment
    }}
    required
  />
  <p
    style={{
      marginBottom: "10px",
      fontWeight: "bold",
      fontSize: "16px",
    }}
  >
    Select Gender:
  </p>
  <div
    style={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: "20px", // Space between options
      marginBottom: "20px", // Add margin at the bottom
      justifyContent: "flex-start", // Align to the left
    }}
  >
    {/* Male Radio Button */}
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px", // Space between custom button and label text
        fontSize: "14px",
        cursor: "pointer", // Pointer for better UX
        marginBottom: "0", // Ensure labels align evenly
      }}
    >
      <input
        type="radio"
        name="gender"
        value="male"
        checked={gender === "male"}
        onChange={handleGenderChange}
        required
        style={{
          display: "none", // Hide the default radio button
        }}
      />
      <span
        style={{
          width: "20px",
          height: "20px",
          border: "2px solid #646cff", // Border color
          borderRadius: "50%", // Make it circular
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {gender === "male" && (
          <span
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#646cff", // Fill color when selected
              borderRadius: "50%",
            }}
          ></span>
        )}
      </span>
      Male
    </label>

    {/* Female Radio Button */}
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "14px",
        cursor: "pointer",
      }}
    >
      <input
        type="radio"
        name="gender"
        value="female"
        checked={gender === "female"}
        onChange={handleGenderChange}
        style={{
          display: "none", // Hide the default radio button
        }}
      />
      <span
        style={{
          width: "20px",
          height: "20px",
          border: "2px solid #646cff",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {gender === "female" && (
          <span
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#646cff", // Fill color when selected
              borderRadius: "50%",
            }}
          ></span>
        )}
      </span>
      Female
    </label>
  </div>

  <button
    type="submit"
    style={{
      padding: "11px 10px",
      backgroundColor: "#646cff",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      textAlign: "center",
    }}
  >
    Submit
  </button>
</div>


      </form>
    </main>
  );
}
