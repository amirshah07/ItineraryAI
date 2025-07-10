import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "./firebase.config";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Loading from './Loading.jsx'


export default function ProtectedRoute({children}) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    useEffect(() => {
        // Check if user logged in
        const checkUser = onAuthStateChanged(auth, async (user) => {
                if (!user) {
                    setAuthorized(false);
                    setLoading(false);
                    console.log("User not logged in")
                    return;
                }

                try {
                    // Check if user exists in firestore
                    const userDoc =  await getDoc(doc(db, "Users", user.uid));
                    console.log(userDoc);
                    if (userDoc.exists()) {
                        setAuthorized(true);
                        console.log("User exists");
                    } else {
                        console.error("User not found");
                        setAuthorized(false);
                    }
                } catch (error) {
                    console.error("Error fetching user:", error);
                    setAuthorized(false);
                }finally {
                    setLoading(false);
                }
        });
        
        return () => checkUser();
    }, []);

    if (loading) {
        // Show loading screen until Promise resolved
        return (<Loading/>);
    }

    if (!authorized) {
        return <Navigate to="/" />;
    }

    return children;
}