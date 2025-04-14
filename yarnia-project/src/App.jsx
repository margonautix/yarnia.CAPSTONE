import { Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Stories from "./components/Stories";
import Bookmarks from "./components/Bookmarks";
import NavBar from "./components/Navbar";
import Register from "./components/Register";
import SingleStory from "./components/SingleStory";
import Logout from "./components/Logout";
import AddStory from "./components/addStory";
import AdminCommentsFeed from "./components/AdminCommentsFeed";
import StoryDetails from "./components/StoryDetails";
import UserProfile from "./components/UserProfile";
import AdminUsers from "./components/AdminUsers";
import StoryComments from "./components/StoryComments";
import "react-quill/dist/quill.snow.css";
import jwt_decode from "jwt-decode";

function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedTheme = localStorage.getItem("theme");

    if (token) {
      try {
        const decodedUser = jwt_decode(token);

        if (decodedUser.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        } else {
          const userInfo = JSON.parse(localStorage.getItem("user"));
          setUser(userInfo);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    }

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.body.style.backgroundColor = "#1b4412";
      document.body.style.color = "#f1e5c7";
    } else {
      document.body.style.backgroundColor = "#f1e5c7";
      document.body.style.color = "#1b4412";
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${
        darkMode ? "bg-[#1b4412] text-[#f1e5c7]" : "bg-[#f1e5c7] text-[#1b4412]"
      }`}
    >
      <NavBar
        user={user}
        setUser={setUser}
        handleLogout={handleLogout}
        setDarkMode={setDarkMode}
        darkMode={darkMode}
      />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Stories />} />
          <Route path="/bookmarks" element={<Bookmarks user={user} darkMode={darkMode} />} />
          <Route path="/login" element={<Login setUser={setUser} darkMode={darkMode} />} />
          <Route path="/profile" element={<Profile user={user} setUser={setUser} darkMode={darkMode} />} />
          <Route path="/register" element={<Register setUser={setUser} darkMode={darkMode} />} />
          <Route path="/stories/:storyId" element={<SingleStory user={user} darkMode={darkMode} />} />
          <Route path="/stories/:storyId/comments" element={<StoryComments darkMode={darkMode} />} />
          <Route path="/logout" element={<Logout setUser={setUser} darkMode={darkMode} />} />
          <Route path="/add-story" element={<AddStory darkMode={darkMode} />} />
          <Route path="/stories" element={<StoryDetails darkMode={darkMode} />} />
          <Route path="/comments" element={<AdminCommentsFeed darkMode={darkMode} />} />
          <Route path="/users" element={<AdminUsers darkMode={darkMode} />} />
          <Route path="/users/:authorId" element={<UserProfile darkMode={darkMode} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;