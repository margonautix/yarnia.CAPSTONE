import { Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Stories from "./Components/Stories";
import NavBar from "./components/Navbar";
import Register from "./components/Register";
import SingleStory from "./components/SingleStory";
import Logout from "./components/Logout";
import "./App.css";

function App() {
  // Lift user state to the App component
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user info from localStorage when the component loads
    const userInfo = JSON.parse(localStorage.getItem("user"));
    setUser(userInfo);
  }, []);

  return (
    <div>
      <NavBar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Stories />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/stories/:storyId" element={<SingleStory />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </div>
  );
}

export default App;
