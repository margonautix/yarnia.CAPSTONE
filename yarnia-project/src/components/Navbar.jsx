import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import yarniaLogo from "./images/yarniaLogo.png";

const NavBar = ({ user, setUser, darkMode, setDarkMode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark-mode");
      document.body.style.backgroundColor = "#1b4412";
      document.body.style.color = "#f1e5c7";
    } else {
      document.documentElement.classList.remove("dark-mode");
      document.body.style.backgroundColor = "#f1e5c7";
      document.body.style.color = "#1b4412";
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
      root.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
      document.body.style.backgroundColor = "#f1e5c7";
      document.body.style.color = "#1b4412";
    } else {
      root.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
      document.body.style.backgroundColor = "#1b4412";
      document.body.style.color = "#f1e5c7";
    }
    setDarkMode(!darkMode);
  };

  return (
    <nav
      className={`${darkMode ? "bg-[#3c892a] text-[#f1e5c7]" : "bg-[#c7a859] text-white"} px-6 py-4 shadow-md transition-colors duration-300 border-b border-[#71d15b]`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleDarkModeToggle}
            className="text-xl hover:text-[#1b4412] transition"
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          <Link to="/" className="text-lg font-semibold hover:text-[#1b4412]">
            Home
          </Link>
          {user && (
            <Link to="/bookmarks" className="text-base hover:text-[#1b4412]">
              Bookmarks
            </Link>
          )}
        </div>

        <ul className="flex items-center space-x-5 text-sm">
          {user ? (
            <>
              <li>
                <Link to="/add-story" className="hover:text-[#1b4412]">
                  Add Story
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#1b4412]">
                  Profile
                </Link>
              </li>
              {user.isAdmin && (
                <>
                  <li>
                    <Link to="/comments" className="hover:text-[#1b4412]">
                      All Comments
                    </Link>
                  </li>
                  <li>
                    <Link to="/users" className="hover:text-[#1b4412]">
                      All Users
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link
                  to="/logout"
                  onClick={handleLogout}
                  className="hover:underline text-[#1b4412]"
                >
                  Logout
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="hover:text-[#1b4412]">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#1b4412]">
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
