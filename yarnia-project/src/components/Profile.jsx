import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      // Redirect to login if not authenticated
      navigate("/login");
    } else {
      setProfile(user);
    }
  }, [navigate]);

  if (!profile) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Welcome, {profile.username}</h1>
      <p>Email: {profile.email}</p>
    </div>
  );
};

export default Profile;
