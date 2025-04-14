import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import yarniaLogo from "./images/yarniaLogo.png";

const NavBar = ({ user, setUser, darkMode, setDarkMode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleLogout = (event) => {
    event.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const handleDarkModeToggle = () => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  return (
    <nav
      className={`transition-colors duration-300 px-6 py-4 shadow-md border-b 
        ${darkMode ? "bg-dark_moss_green text-pearl border-forest_green" : "bg-satin_sheen_gold text-pakistan_green border-sage"}`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleDarkModeToggle}
            className="text-xl hover:text-kelly_green transition"
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          <Link to="/" className="text-lg font-semibold hover:text-kelly_green">
            Home
          </Link>
          {user && (
            <Link to="/bookmarks" className="text-base hover:text-kelly_green">
              Bookmarks
            </Link>
          )}
        </div>

        <ul className="flex items-center space-x-5 text-sm">
          {user ? (
            <>
              <li>
                <Link to="/add-story" className="hover:text-kelly_green">
                  Add Story
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-kelly_green">
                  Profile
                </Link>
              </li>
              {user.isAdmin && (
                <>
                  <li>
                    <Link to="/comments" className="hover:text-kelly_green">
                      All Comments
                    </Link>
                  </li>
                  <li>
                    <Link to="/users" className="hover:text-kelly_green">
                      All Users
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link
                  to="/logout"
                  onClick={handleLogout}
                  className="hover:underline text-kelly_green"
                >
                  Logout
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="hover:text-kelly_green">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-kelly_green">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
