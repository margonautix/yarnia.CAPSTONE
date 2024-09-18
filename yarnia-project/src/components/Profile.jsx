import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../API"; // Import the utility function to fetch with auth

const Profile = () => {
  const [user, setUser] = useState(null); // Store the user's profile data
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track if the user is authenticated
  const [isEditing, setIsEditing] = useState(false); // Track if we are in edit mode
  const [username, setUsername] = useState(""); // State for editing username
  const [bio, setBio] = useState(""); // State for editing bio
  const [stories, setStories] = useState([]); // State to store user's stories
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate(); // Initialize navigate

  // Fetch user data and their stories when the component mounts
  const fetchUserData = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:3000/api/auth/me");

      if (response.ok) {
        const userData = await response.json();
        setUser(userData); // Set user data in state
        setUsername(userData.username); // Initialize editing fields
        setBio(userData.bio);
        setIsAuthenticated(true); // User is authenticated

        // Fetch the user's stories after fetching user data
        await fetchUserStories(userData.id);
      } else {
        console.error("Failed to fetch user data");
        setIsAuthenticated(false); // Not authenticated
        navigate("/login"); // Optionally redirect to login
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsAuthenticated(false); // Handle error as unauthenticated
      navigate("/login"); // Optionally redirect to login
    }
  };

  // Fetch stories written by the user
  const fetchUserStories = async (userId) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:3000/api/users/${userId}/stories`
      );
      if (response.ok) {
        const userStories = await response.json();
        setStories(userStories); // Set stories in state
      } else {
        console.error("Failed to fetch user stories");
        setError("Failed to load stories.");
      }
    } catch (error) {
      console.error("Error fetching user stories:", error);
      setError("An error occurred while fetching stories.");
    }
  };

  useEffect(() => {
    fetchUserData(); // Fetch user data once when the component mounts
  }, []);

  // Handle save action for editing profile
  const handleSave = async () => {
    try {
      const response = await fetchWithAuth(
        "http://localhost:3000/api/users/me",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is sent
          },
          body: JSON.stringify({ username, bio }), // Include updated username and bio
        }
      );

      if (response.ok) {
        await fetchUserData(); // Fetch updated data again after saving
        setIsEditing(false); // Exit edit mode after saving
      } else {
        console.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error while updating profile:", error);
    }
  };

  if (!isAuthenticated) {
    return <div>Loading user data or redirecting...</div>; // Show loading or redirect
  }

  if (!user) {
    return <div>Loading...</div>; // Fallback if user data isn't loaded
  }

  return (
    <div className="profile-container">
      <h1>
        Welcome,{" "}
        {isEditing ? (
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username:
            </label>
            <input
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        ) : (
          user.username
        )}
        !
      </h1>
      <p>Email: {user.email}</p>
      <p>
        Bio:{" "}
        {isEditing ? (
          <div className="form-group">
            <label htmlFor="bio" className="form-label">
              Bio:
            </label>
            <textarea
              id="bio"
              className="form-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        ) : (
          user.bio
        )}
      </p>

      {isEditing ? (
        <div className="button-group">
          <button className="button save-button" onClick={handleSave}>
            Save
          </button>
          <button
            className="button cancel-button"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          className="button edit-button"
          onClick={() => setIsEditing(true)}
        >
          Edit Profile
        </button>
      )}

      <h2>Your Stories</h2>
      {error && <p className="error-message">{error}</p>}
      {stories.length > 0 ? (
        <ul className="story-list">
          {stories.map((story) => (
            <li key={story.id} className="story-item">
              <h3>{story.title}</h3>
              <p>{story.summary || "No summary available"}</p>
              <a href={`/stories/${story.id}`} className="story-link">
                Read more
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't written any stories yet.</p>
      )}
    </div>
  );
};

export default Profile;
