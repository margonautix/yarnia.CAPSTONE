import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../API"; // Import the utility function to fetch with auth

const Profile = () => {
  const [user, setUser] = useState(null); // Store the user's profile data
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track if the user is authenticated
  const [isEditing, setIsEditing] = useState(false); // Track if we are in edit mode
  const [username, setUsername] = useState(""); // State for editing username
  const [bio, setBio] = useState(""); // State for editing bio
  const [stories, setStories] = useState([]); // State to store user's stories
  const [comments, setComments] = useState([]); // State to store user's comments
  const [error, setError] = useState(null); // Error state
  const [saveError, setSaveError] = useState(null); // Error state for saving profile
  const [loading, setLoading] = useState(true); // Loading state for user data
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

        // Fetch the user's stories and comments after fetching user data
        await fetchUserStories(userData.id);
        await fetchUserComments(userData.id); // Fetch comments posted by the user
      } else {
        console.error("Failed to fetch user data");
        setIsAuthenticated(false); // Not authenticated
        navigate("/login"); // Optionally redirect to login
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsAuthenticated(false); // Handle error as unauthenticated
      navigate("/login"); // Optionally redirect to login
    } finally {
      setLoading(false); // Stop loading once user data is fetched
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
      }
    } catch (error) {
      console.error("Error fetching user stories:", error);
      setError("An error occurred while fetching stories.");
    }
  };

  // Fetch all comments made by the user
  const fetchUserComments = async (userId) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:3000/api/users/${userId}/comments`
      ); // Assuming this API endpoint returns all comments by the user
      if (response.ok) {
        const userComments = await response.json();
        console.log("Fetched comments:", userComments); // Add console log for debugging
        setComments(userComments); // Set comments in state
      }
    } catch (error) {
      console.error("Error fetching user comments:", error);
      setError("An error occurred while fetching comments.");
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
        setSaveError(null); // Reset any previous save error
      } else {
        setSaveError("Failed to update profile");
      }
    } catch (error) {
      setSaveError("Error while updating profile.", error);
    }
  };

  // Handle navigation to the single story view
  const handleReadMore = (storyId) => {
    navigate(`/stories/${storyId}`); // Navigate to the SingleStory component using storyId
  };

  if (loading) {
    return <div>Loading user data...</div>; // Show loading spinner or message
  }

  if (!isAuthenticated || !user) {
    return <div>Redirecting to login...</div>; // Redirect if user is not authenticated
  }

  return <></>;
};

export default Profile;
