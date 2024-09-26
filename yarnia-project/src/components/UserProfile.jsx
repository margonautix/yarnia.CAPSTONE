import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchUserProfileById } from "../API";

export default function UserProfile() {
  const { authorId } = useParams(); // Get the user ID from the URL
  console.log("Author ID:", authorId); // Log to verify

  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchUserProfileById(authorId);
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
          <p>Bio: {user.bio}</p>
          {/* Add any additional fields you want to display */}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
