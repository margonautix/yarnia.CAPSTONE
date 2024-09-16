import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext"; // Assuming you have a context for user authentication

const NavBar = () => {
  const { user } = useContext(UserContext); // Retrieve user information
  const navigate = useNavigate();

  const handleViewComments = () => {
    if (user && user.role === "admin") {
      navigate("/comments"); // Only navigate if the user is an admin
    } else {
      alert("You don't have permission to view this page.");
    }
  };

  return (
    <nav className="navbar">
      <ul>
        {/* Links for all users */}
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/stories">Stories</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        {/* Admin-only button */}
        {user && user.role === "admin" && (
          <li>
            <button onClick={handleViewComments}>View All Comments</button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
