import { Link, useNavigate } from "react-router-dom";
import catGif from "./images/Yarnia.gif";

const NavBar = ({ user, setUser }) => {
  const navigate = useNavigate();

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
      <img src={catGif} alt="Harlee" className="navbar-gif" />
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
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <Link to="/add-story">Add Story</Link> {/* Add Story Link */}
            </li>
            {/* Keep Logout as a link but add onClick to handle logout */}
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