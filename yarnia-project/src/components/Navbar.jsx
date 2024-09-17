import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();

  // State to track the logged-in user
  const [user, setUser] = useState(null);

  // Check for user data in localStorage when the component mounts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user"); // Clear invalid user data if parsing fails
      }
    }
  }, []); // Empty dependency array means this runs once when the component mounts

  // Handle logout functionality
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Also remove token if you're storing it
    setUser(null); // Clear the user state
    navigate("/login");
  };

  const handleViewComments = () => {
    navigate("/comments");
  };

  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>

        {/* Show Bookmarks link if user is logged in */}
        {user && (
          <li>
            <Link to="/bookmarks">Bookmarks</Link>
          </li>
        )}

        {/* Show the "Profile" tab only if the user is logged in */}
        {user ? (
          <>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            {/* Conditionally show "View All Comments" for admin users */}
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
          </>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
