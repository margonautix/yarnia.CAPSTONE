import React, { useEffect, useState } from "react";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');  // Retrieve the token from localStorage
    
      const response = await fetch('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,  // Pass the token in the Authorization header
        },
        credentials: 'include',  // Ensure credentials are included in the request
      });
    
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);  // Set the user data in your state
      } else {
        console.error('Failed to fetch user data');
      }
    };

    fetchUserData();
  }, []); // Runs once when the component mounts

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      <p>Email: {user.email}</p>
      <p>Bio: {user.bio}</p>
      {/* Display any other user information you want */}
    </div>
  );
};

export default Profile;
