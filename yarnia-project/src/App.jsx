import { Route, Routes } from "react-router-dom";
import Profile from "./components/Profile"; // Example component for a profile page
import Login from "./components/Login"; // Example component for a login page
import Stories from "./Components/Stories"; // Stories component
import "./App.css";
import Register from "./components/Register";
import SingleStory from "./components/SingleStory";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Stories />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/register" element={<Register />} />
      <Route path="/stories/:storyId" element={<SingleStory />} />
    </Routes>
  );
}

export default App;
