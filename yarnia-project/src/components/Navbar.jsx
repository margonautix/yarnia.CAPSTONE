import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

const NavBar = () => {
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
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        <li>
          <Link to="/bookmarks">Bookmarks</Link>
        </li>
        {/* Admin-only button */}
        <li>
          <button onClick={handleViewComments}>View All Comments</button>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
