import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./components/Login"; // Import the login component
import { AuthProvider } from "./Context/AuthContext"; // Authentication context provider
import Stories from "./components/Stories";
import SingleStory from "./components/SingleStory";
import Navbar from "./components/Navbar"; // Import the Navbar component
import "./app.css";

const App = () => {
  return (
    <AuthProvider>
      {/* Add Navbar here */}
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Stories />} />
        <Route path="/story/:id" element={<SingleStory />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
