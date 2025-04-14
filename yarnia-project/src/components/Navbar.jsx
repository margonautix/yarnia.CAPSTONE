import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const NavBar = ({ user, setUser, darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleLogout = (e) => {
    e.preventDefault();
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
        ${darkMode ? "bg-worn_oak text-birch_parchment border-dark_olive" : "bg-library_leather text-ink_brown border-worn_page"}`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleDarkModeToggle}
            className="text-xl hover:text-bright_moss transition"
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          <Link to="/" className="text-lg font-semibold hover:text-bright_moss">
            Home
          </Link>
          {user && (
            <Link to="/bookmarks" className="hidden sm:inline-block text-base hover:text-bright_moss">
              Bookmarks
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="sm:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* Right side menu */}
        <ul className={`flex-col sm:flex-row sm:flex items-center space-y-2 sm:space-y-0 sm:space-x-5 text-sm ${menuOpen ? "flex absolute top-16 right-6 bg-library_leather dark:bg-worn_oak p-4 rounded shadow-md z-50" : "hidden sm:flex"}`}>
          {user ? (
            <>
              <li>
                <Link to="/add-story" className="hover:text-bright_moss">
                  Add Story
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-bright_moss">
                  Profile
                </Link>
              </li>
              {user.isAdmin && (
                <>
                  <li>
                    <Link to="/comments" className="hover:text-bright_moss">
                      All Comments
                    </Link>
                  </li>
                  <li>
                    <Link to="/users" className="hover:text-bright_moss">
                      All Users
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link
                  to="/logout"
                  onClick={handleLogout}
                  className="hover:underline text-dusty_fern"
                >
                  Logout
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="hover:text-bright_moss">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-bright_moss">
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
