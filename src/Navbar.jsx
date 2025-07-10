import { useState, useEffect } from "react";
import { auth } from "./firebase.config";
import globeLogo from "./images/travel.png";

export default function Navbar() {
  const [activeTab, setActiveTab] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = () => {
      setActiveTab(window.location.pathname);
    };

    window.addEventListener("popstate", handleNavigation);
    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log("User logged out successfully");
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <a href="/homepage" className="navbar-home-link">
            <img src={globeLogo} alt="Logo" className="navbar-logo" />
            <h1>ItineraryAI</h1>
          </a>
        </div>

        <div className="navbar-center">
          <a
            href="/trips"
            className={`navbar-link ${activeTab === "/trips" ? "active" : ""}`}
            onMouseEnter={() => setActiveTab("/trips")}
            onMouseLeave={() => setActiveTab(window.location.pathname)}
          >
            My Trips
          </a>
          <a
            href="/friends"
            className={`navbar-link ${activeTab === "/friends" ? "active" : ""}`}
            onMouseEnter={() => setActiveTab("/friends")}
            onMouseLeave={() => setActiveTab(window.location.pathname)}
          >
            My Friends
          </a>
        </div>

        <div className="navbar-right">
          <button className="login-button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}
