import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const handleViewComments = () => {
    navigate("/comments");
  };

  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/bookmarks">Bookmarks</Link>
        </li>

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
            {user.isAdmin && (
              <li>
                <button onClick={handleViewComments}>View All Comments</button>
              </li>
            )}
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
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
