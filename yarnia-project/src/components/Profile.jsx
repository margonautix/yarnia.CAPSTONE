import React, { useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page if not authenticated
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]); // Run the effect when `user` or `navigate` changes

  if (!user) return null; // Prevent rendering until the redirection

  return (
    <div>
      <h1>Profile</h1>
      <p>Username: {user.username}</p>
      <p>Email: {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Profile;
