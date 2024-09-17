import { Link, useNavigate } from "react-router-dom";

const NavBar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null); // Reset user state
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
        <li>
          <Link to="/bookmarks">Bookmarks</Link>
        </li>

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
