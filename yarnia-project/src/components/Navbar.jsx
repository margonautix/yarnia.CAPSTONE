import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import yarniaLogo from "./images/yarniaLogo.png";

const NavBar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  // Check localStorage for the user's theme preference on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark");
    }
  }, []);

  // Handle category change and navigate to the appropriate search page
  const handleCategoryChange = (event) => {
    const selected = event.target.value;
    navigate(`/search?category=${selected}`);
  };

  // Handle logout functionality
  const handleLogout = (event) => {
    event.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    if (darkMode) {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <nav className="navbar">
      <ul>
        {" "}
        <li>
          <button
            onClick={handleDarkModeToggle}
            className="dark-mode-toggle"
          ></button>
        </li>
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
