import React, { useState } from "react";
import { db } from "./firebase.config"; // Replace with your Firebase config path
import { getDocs, query, where, collection, updateDoc, arrayUnion, doc } from "firebase/firestore";

export default function SendFriendRequest({ currentUserUid }) {
  const [username, setUsername] = useState("");
  //console.log(currentUserUid);
  

  const handleAddFriend = async (e) => {
    e.preventDefault();
    //console.log(username);
    

    if (!username.trim()) {
      //alert("Please enter a valid username.");
      return;
    }

    try {
      // Query Firestore for the user with the given username
      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      // if no user with username exists
      if (querySnapshot.empty) {
        alert("No user found with that username.");
        return;
      }

      // Get the user2 document
      const user2Doc = querySnapshot.docs[0];
      const user2Id = user2Doc.id;

      // Add the current user's Uid to user2's friendRequests array
      await updateDoc(doc(db, "Users", user2Id), {
        friendRequests: arrayUnion(currentUserUid),
      });

      alert("Friend request sent successfully!");
      setUsername("");
    } catch (error) {
      console.log("Error sending friend request:", error);
    }
  };

  return (
    <div className="form-group">
        <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter a friend's username"
            />
        <button onClick={handleAddFriend}>Add friend</button>
    </div>
  );
};

