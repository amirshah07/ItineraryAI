import React, { useState, useEffect } from 'react';
import { db } from './firebase.config.js'; 
import { arrayUnion, arrayRemove, updateDoc, getDoc, doc } from 'firebase/firestore';

export default function FriendRequests({ currentUserUid, fetchUsername }) {
  const [friendRequests, setFriendRequests] = useState([]);
  const [usernames, setUsernames] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);


  /* Fetch current user's friendRequests from Firestore */
  const fetchFriendRequests = async () => {
    const userDoc = await getDoc(doc(db, "Users", currentUserUid));
    const friendRequestsArray = userDoc.data()?.friendRequests || [];
    setFriendRequests(friendRequestsArray);

    // Now fetch usernames of users in friendRequests array
    const fetchUsernames = async () => {
      const usernamesArray = [];
      for (let uid of friendRequestsArray) {
        const username = await fetchUsername(uid);
        usernamesArray.push({ uid, username: username });
      }
      console.log(usernamesArray);
      setUsernames(usernamesArray);
    };
    fetchUsernames();
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  /* Decline request */
  const handleDeclineRequest = async (uidToDelete) => {
    try {
      // Update friendRequests array to remove declined uid
      const userDocRef = doc(db, "Users", currentUserUid);
      await updateDoc(userDocRef, {
        friendRequests: arrayRemove(uidToDelete)
      });

      // Remove the request from the local state
      setFriendRequests((prevRequests) => prevRequests.filter((uid) => uid !== uidToDelete));
      setUsernames((prevUsernames) => prevUsernames.filter((username) => username.uid !== uidToDelete));
    } catch (error) {
      console.error("Error deleting friend request: ", error);
    }
  };

  /* Accept request */
  const handleAcceptRequest = async (uidToAccept) => {
    try {
      // Add requester to friendRequests of current_user
      const userDocRef = doc(db, "Users", currentUserUid);
      await updateDoc(userDocRef, {
        friends: arrayUnion(uidToAccept),  // Add the sender's UID to current user's friends
        friendRequests: arrayRemove(uidToAccept)  // Remove the friend request
      });

      // Add current_user to friendRequests of requester
      const senderDocRef = doc(db, "Users", uidToAccept);
      await updateDoc(senderDocRef, {
        friends: arrayUnion(currentUserUid),  // Add the current user's UID to the sender's friends
      });

      // Remove request from the local state
      setFriendRequests((prevRequests) => prevRequests.filter((uid) => uid !== uidToAccept));
      setUsernames((prevUsernames) => prevUsernames.filter((username) => username.uid !== uidToAccept));

    } catch (error) {
      console.error("Error accepting friend request: ", error);
    }
  };

  return (
    <div className="friend-requests-wrapper">
      <button
        className="dropdown-btn"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        Friend Requests ({usernames.length})
      </button>
      {dropdownOpen && (
        <div className="dropdown-menu">
          {usernames.length === 0 ? (
            <p>No friend requests</p>
          ) : (
            usernames.map((name) => (
              <div key={name.uid} className="dropdown-item">
                <span>{name.username}</span>
                <button
                    className="accept-btn"
                    onClick={() => handleAcceptRequest(name.uid)}
                  >
                    Accept
                  </button>
                  <button
                    className="decline-btn"
                    onClick={() => handleDeclineRequest(name.uid)}
                  >
                    Decline
                  </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

