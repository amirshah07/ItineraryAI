import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase.config"; // Import your Firestore config
import { arrayRemove, doc, getDoc, updateDoc } from "firebase/firestore";
import Navbar from "./Navbar";
import AddFriend from "./AddFriend";
import FriendRequest from "./FriendRequest"

export default function Friends() {
  const [friendsList, setFriendsList] = useState([]);

  const user = auth.currentUser;
  const currentUserUid = user.uid;
  //console.log(currentUserUid);

  // Retrieve username from user.uid function
  const fetchUsername = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "Users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.username; // Assuming the field is called 'username'
      } else {
        console.error(`User with UID: ${uid} does not exist.`);
        return null;
      }
    } catch (error) {
      console.error("Error fetching username:", error);
      return null;
    }
  };

  // Retrive friend list from Firestore
  const fetchFriends = async () => {
    try {
      // Fetch the user's document from Firestore
      const userDoc = await getDoc(doc(db, "Users", user.uid));

      // Retrieve the friends array
      const userData = userDoc.data();
      const friendsList = userData.friends || []; // Default to an empty array if friends is undefined
      
      // Fetch user.usernames for each user.uid
      const friendsData = await Promise.all(
        friendsList.map(async (uid) => {
          const username = await fetchUsername(uid);
          //console.log({ uid, username: username });
          return { uid, username: username };
        })
      );
      //console.log(friendsData);
      setFriendsList(friendsData.filter((friend) => friend !== null));
      //console.log(friendsList);
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  }

  useEffect(() => fetchFriends, []);

  // Remove friend from firestore
  const handleRemoveFriend = async (uidToDelete, username) => {
    const confirmRemoval = window.confirm(
      `Are you sure you want to remove ${username}?`
    );
    if (confirmRemoval) {
      // Delete from firestore
      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, {
        friends: arrayRemove(uidToDelete),
      });

      const user1Ref = doc(db, "Users", uidToDelete);
      await updateDoc(user1Ref, {
        friends: arrayRemove(user.uid),
      });

      // Update friendsList local state
      setFriendsList((prevFriends) => prevFriends.filter((friend) => friend.uid !== uidToDelete));
      alert(`${username} has been removed from friend list`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="friends-page-wrapper">
        <h2>Find Your Friends</h2>

        {/* Friend Request dropdown */}
        <FriendRequest currentUserUid={currentUserUid} fetchUsername={fetchUsername} />

        {/* Add friend form */}
        <AddFriend currentUserUid={currentUserUid} />

          {/* Friend List */}
        <ul className="friends-list">
          {friendsList.map((friend) => (
            <li key={friend.uid}>
              {friend.username}
              <button
                className="remove-btn"
                onClick={() => handleRemoveFriend(friend.uid, friend.username)}
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
