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
import StoryDetails from "./components/StoryDetails";
import "react-quill/dist/quill.snow.css";
import "./App.css";

function App() {
  // Lift user state to the App component
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user info from localStorage when the component loads
    const userInfo = JSON.parse(localStorage.getItem("user"));
    setUser(userInfo);
  }, []);
  // Handle logout
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
        <Route path="bookmarks" element={<Bookmarks />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/stories/:storyId" element={<SingleStory />} />
        <Route path="/logout" element={<Logout setUser={setUser} />} />
        <Route path="/add-story" element={<AddStory />} />
        <Route path="/stories" element={<StoryDetails />} />
      </Routes>
    </div>
  );
}

export default App;
