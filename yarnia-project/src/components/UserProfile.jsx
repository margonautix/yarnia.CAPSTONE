import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchUserProfile } from "../API"; // Add a function to fetch user data from the backend

export default function UserProfile() {
  const { authorId } = useParams(); // Get the user ID from the URL
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchUserProfile(authorId); // Fetch the user data
        if (userData) {
          setUser(userData); // Set the user state
        } else {
          setError("User not found.");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setError("Failed to fetch user data.");
      }
    };

    fetchUserData();
  }, [authorId]);

  if (error) return <p>{error}</p>;

  return (
    <div>
      {user ? (
        <div>
          <h1>{user.username}</h1>
          <p>Email: {user.email}</p>
          <p>Bio: {user.bio}</p>
          {/* Add any additional fields you want to display */}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
