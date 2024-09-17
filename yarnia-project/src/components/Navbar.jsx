import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();

  // State to track the logged-in user
  const [user, setUser] = useState(null);

  // Check for user data in localStorage when the component mounts
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);  // Empty dependency array means this runs once when the component mounts

  // Handle logout functionality
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");  // Also remove token if you're storing it
    setUser(null);  // Clear the user state
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

        {/* Show different options depending on whether the user is logged in */}
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
