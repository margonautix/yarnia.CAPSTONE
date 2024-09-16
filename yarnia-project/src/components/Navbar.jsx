import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const NavBar = () => {
  const { user } = useAuth(); // Assuming user contains user details, including admin status
  const navigate = useNavigate();

  const handleViewComments = () => {
    navigate("/comments");
  };

  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        {/* Bookmarks link should only be visible to logged-in users */}
        {user && (
          <li>
            <Link to="/bookmarks">Bookmarks</Link>
          </li>
        )}
        {user ? (
          <>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            {/* Admin-only button */}
            {user.isAdmin && (
              <li>
                <button onClick={handleViewComments}>View All Comments</button>
              </li>
            )}
          </>
        ) : (
          <>
            {/* For unregistered or logged-out users */}
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
            {/* Optional guest message */}
            <li>
              <p>Welcome, Guest! Please login to interact with stories.</p>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
