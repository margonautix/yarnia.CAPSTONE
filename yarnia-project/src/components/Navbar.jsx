import { Link, useNavigate } from "react-router-dom";

import { useState } from "react";
import yarniaLogo from "./images/yarniaLogo.png";

const NavBar = ({ user, setUser }) => {
  const navigate = useNavigate();

  // Example categories
  const categories = [
    "Fiction",
    "Non-fiction",
    "Sci-Fi",
    "Fantasy",
    "Mystery",
    "Horror",
  ];

  // State to handle selected category
  const [selectedCategory, setSelectedCategory] = useState("");

  // Handle category change and navigate to the appropriate search page
  const handleCategoryChange = (event) => {
    const selected = event.target.value;
    setSelectedCategory(selected);
    if (selected) {
      navigate(`/search?category=${selected}`); // Assuming you have query parameters in your route
    }
  };

  // Handle logout functionality
  const handleLogout = (event) => {
    event.preventDefault(); // Prevent default link behavior
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null); // Clear the user state
    navigate("/login"); // Redirect to login page after logging out
  };

  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        {/* Conditionally render the Bookmarks link based on user login status */}
        {user && (
          <li>
            <Link to="/bookmarks">Bookmarks</Link>
          </li>
        )}
        {/* Conditionally render links based on user login status */}
        {user ? (
          <>
            <li>
              <Link to="/add-story">Add Story</Link> {/* Add Story Link */}
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <img src={yarniaLogo} alt="Yarnia" className="yarnia-logo-1" />
            {/* Admin-only link to comments feed */}
            {user.isAdmin && (
              <>
                <li className="admin-li">
                  <Link to="/comments">All Comments</Link>
                </li>
                {/* Admin-only link to All Users */}
                <li>
                  <Link to="/users">All Users</Link>
                </li>
              </>
            )}
            <li>
              <Link
                to="/logout"
                onClick={handleLogout}
                style={{ marginLeft: "auto" }}
              >
                Logout
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <img src={yarniaLogo} alt="Yarnia" className="yarnia-logo-2" />
            <li>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
