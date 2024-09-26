import { Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Stories from "./Components/Stories";
import Bookmarks from "./components/Bookmarks";
import NavBar from "./components/Navbar";
import Register from "./components/Register";
import SingleStory from "./components/SingleStory";
import Logout from "./components/Logout";
import AddStory from "./components/addStory";
import AdminCommentsFeed from "./components/AdminCommentsFeed";
import StoryDetails from "./components/StoryDetails";
import UserProfile from "./components/UserProfile";
import "react-quill/dist/quill.snow.css";
import "./App.css";
import jwt_decode from "jwt-decode";
import Comments from "./components/Comments";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user info and token from localStorage when the component loads
    const token = localStorage.getItem("token");

    if (token) {
      try {
        // Decode the token to get user info
        const decodedUser = jwt_decode(token);

        // Check if the token is expired
        if (decodedUser.exp * 1000 < Date.now()) {
          console.log("Token expired");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          return;
        }

        // Set the user state based on the stored user information
        const userInfo = JSON.parse(localStorage.getItem("user"));
        setUser(userInfo);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div>
      <NavBar user={user} setUser={setUser} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Stories />} />
        <Route path="/bookmarks" element={<Bookmarks user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/stories/:storyId" element={<SingleStory user={user} />} />
        <Route path="/logout" element={<Logout setUser={setUser} />} />
        <Route path="/add-story" element={<AddStory />} />
        <Route path="/stories" element={<StoryDetails />} />
        <Route path="/comment" element={<Comments />} />
        <Route path="/comments" element={<AdminCommentsFeed />} />
        <Route path="/users/:authorId" element={<UserProfile />} />
      </Routes>
    </div>
  );
}

export default App;
