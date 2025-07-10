import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { auth } from './firebase.config';
import { onAuthStateChanged } from "firebase/auth";
import Homepage from './Homepage';
import Interests from './Interests';
import Friends from './Friends';
import Trips from './Trips';
import SignInwithGoogle from './SignInWithGoogle';
import Register from './Register';
import Profile from './Profile';
import ProtectedRoute from './ProtectedRoute';
import ErrorPage from './ErrorPage'; 
import TestTripPage from './TestTripPage'; 

function App() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        console.log("Firebase auth object:", auth);

        try {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                console.log("Auth state changed:", user);
                if (user) {
                    console.log("User signed in:", user.uid);
                } else {
                    console.log("No user signed in");
                }
            });

            return () => unsubscribe();
        } catch (error) {
            console.error("Firebase auth error:", error);
        }
    }, []);

    const protectedRoutes = [
        { path: "/interests", element: <Interests /> },
        { path: "/homepage", element: <Homepage /> },
        { path: "/friends", element: <Friends /> },
        { path: "/trips", element: <Trips /> },
        { path: "/profile", element: <Profile /> },
        { path: "trips/:tripId", element: <TestTripPage /> },
        //{ path: "/trips/:tripId", element: <TestTripPage /> } // temporary to test trip page
    ];

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<SignInwithGoogle />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                {protectedRoutes.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={<ProtectedRoute>{route.element}</ProtectedRoute>}
                    />
                ))}

                {/* Catch-all for undefined routes */}
                <Route path="*" element={<ErrorPage />} />
            </Routes>
        </Router>
    );
}

export default App;
