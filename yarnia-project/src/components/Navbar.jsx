import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NavBar = ({ user, setUser }) => {
  const navigate = useNavigate();

  // Check for user data in localStorage when the component mounts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser); // Set user state if the stored data is valid
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user"); // Clear invalid user data if parsing fails
      }
    }
  }, [setUser]); // Include setUser as a dependency

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
        <li>
          <Link to="/bookmarks">Bookmarks</Link>
        </li>

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
              <Link to="/logout" onClick={handleLogout}>
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
