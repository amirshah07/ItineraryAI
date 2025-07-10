import React, { useState } from "react"; 
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase.config";
import { collection, query, where, getDoc, getDocs, setDoc, doc } from "firebase/firestore";
import googleLogo from "./images/google.png";
import globeLogo from "./images/travel.png";


export default function SignInwithGoogle() {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 

  const auth = getAuth();
  //console.log(auth.currentUser);

  function handleEmailChange(event) {
    setEmail(event.target.value); 
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value); 
  }

  // sign up with email and password
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      console.log(user);
      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          friends: [],
          friendRequests: []

        });
        alert("Email registered successfully");
        window.location.href = '/';
      }
      } catch (error) {
        console.log(`Error: ${error.message}`);
        alert(`Error: ${error.message}`);
      }
  };

  const googleRegister = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log(user.uid);

      // Check if gmail exists
      const userDocRef = await getDoc(doc(db, "Users", user.uid));
      if (userDocRef.exists()) {
        // Sign the user out
        await auth.signOut();
        alert(`Account with ${user.email} already exists!`);
        window.location.href = "/register";
      }

      // Add new user to firestore
      await setDoc(doc(db, "Users", user.uid), {
        email: user.email,
        friends: [],
        friendRequests: []
      });
      alert(`Email registered successfully`);
      window.location.href = "/"
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }

  return (
    <main>
      <form onSubmit={handleSubmit}>
      <div
        className="login-heading"
        style={{
          display: "flex",
          flexDirection: "column", // Stack items vertically
          alignItems: "flex-start", // Align items to the left
          gap: "25px", // Add spacing between items
          marginBottom: "0px", // Reduce space below the heading
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row", // Align the logo and ItineraryAI horizontally
            alignItems: "center", // Center vertically
            gap: "10px", // Space between logo and text
          }}
        >
          <img
            src={globeLogo}
            alt="Logo"
            style={{ width: "42px", height: "42px" }} // Adjust logo size
          />
          <h1 style={{ margin: 0,  fontWeight:740  }}>ItineraryAI</h1>
        </div>
        <h2 style={{ margin: 0, fontWeight:650 }}>Email Sign Up</h2>
      </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <input
            type="text"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={email} // Controlled input
            onChange={handleEmailChange} // Handle input change
            style={{
              flex: "3.3", // Make the input field longer
            }}
          />
          <input
            type="text"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={password} // Controlled input
            onChange={handlePasswordChange} // Handle input change
            style={{
              flex: "3.3", // Make the input field longer
            }}
          />
          <button
            type="submit"
            style={{
              flex: "1", // Make the button shorter
              padding: "11px 10px",
              backgroundColor: "#646cff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            Create Account
          </button>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "15px 0",
          }}
        >
          <hr style={{ width: "40%", border: "1px solid #ddd" }} />
          <span style={{ margin: "0 10px", color: "#aaa" }}>OR</span>
          <hr style={{ width: "40%", border: "1px solid #ddd" }} />
        </div>
        <h2 style={{ margin: 8, fontWeight:650 }}>Google Sign Up</h2>
        <img
          src={googleLogo}
          width={"60%"}
          style={{ cursor: "pointer" }}
          onClick={googleRegister}
        />
        <p>
        Already registered? <a href="/">Login</a>
        </p>
      </form>
    </main>
  );
}
