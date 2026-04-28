import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "../styles/home.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // ✅ Retrieve user from localStorage on page load
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser)); // Parse JSON and set user state
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("isLoggedIn"); // Clear user data from storage
    localStorage.removeItem("user"); // Clear user data from storage
    setUser(null); // Reset user state
  };

  return (
    <nav className="nav">
      <Link to="/" className="nav-links">
        <div className="nav-links" style={{ fontWeight: "700" }}>
          ROOM EASE
        </div>
      </Link>
      <div className="nav-events">
        <Link to="/ramkrishna/meets" className="nav-links">
          <div>Events & Meets</div>
        </Link>
        <Link to="/ramkrishna/reviews" className="nav-links">
          <div>Reviews</div>
        </Link>

        <Link
          to="/ramkrishna/lodging/rooms"
          className="nav-links"
          style={{
            backgroundColor: "#c69963",
            padding: "8px 16px",
            color: "#141c24ff",
          }}
        >
          <div>Book Now</div>
        </Link>

        {/* User Login/Profile Dropdown */}
        <div className="nav-links login-container">
          <div
            className="nav-links"
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span class="material-symbols-outlined">account_circle</span>
            {user ? (
              <span
                className="user-name"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                {user.GuestFName}
              </span>
            ) : (
              <Link
                to="/ramkrishna/verify/login"
                className="nav-links"
                style={{ cursor: "pointer" }}
              >
                Login
              </Link>
            )}
          </div>

          {/* Dropdown menu */}
          {showDropdown && (
            <div
              className="dropdown-menu"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              {user ? (
                <>
                  <Link
                    to="/ramkrishna/lodging/yourbookings"
                    className="dropdown-item"
                  >
                    Your Bookings
                  </Link>
                  <button onClick={logout} className="dropdown-item logout-btn">
                    Logout
                  </button>
                </>
              ) : (
                ""
              )}
            </div>
          )}
        </div>

        {/* <Link to="/ramkrishna/verify/login" className="nav-links">
          <div style={{ display: "flex", gap: "8px" }}>
            <span class="material-symbols-outlined">account_circle</span> Login
          </div>
        </Link> */}
      </div>
    </nav>
  );
};

export default Navbar;
