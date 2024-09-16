import React, { useEffect, useState } from "react";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // No need to manually fetch the token from localStorage,
        // as it will be sent automatically with the request due to the HTTP-only cookie.
        const response = await fetch("http://localhost:3000/api/auth/me", {
          method: "GET",
          credentials: "include", // Important to send the cookie with the request
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData); // Set the user data
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
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
