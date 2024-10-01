import { Link, useNavigate } from "react-router-dom";
import catGif from "./images/Yarnia.gif";
import { useState } from "react";
import yarniaLogo from "./images/yarniaLogo.png"

const NavBar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const categories = [
    "Fiction",
    "Non-fiction",
    "Sci-Fi",
    "Fantasy",
    "Mystery",
    "Horror",
  ];

  const [selectedCategory, setSelectedCategory] = useState("");

  // Handle category change and navigate to the appropriate search page
  const handleCategoryChange = (event) => {
    const selected = event.target.value;
    setSelectedCategory(selected);
    if (selected) {
      navigate(`/search?category=${selected}`); 
    }
  };

  // Handle logout functionality
  const handleLogout = (event) => {
    event.preventDefault(); 
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null); 
    navigate("/login");

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
              <Link to="/add-story">Add Story</Link> 
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <img src={yarniaLogo} alt ="Yarnia" className="yarnia-logo-1" />
            {/* Admin-only link to comments feed */}
            {user.isAdmin && (
              <>
                <li>
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
            <img src={yarniaLogo} alt ="Yarnia" className="yarnia-logo-2" />
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
