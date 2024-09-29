import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBookmarkedStories, fetchAllStories } from "../API"; // Import fetchAllStories to get all available stories
import { fetchWithAuth } from "../API"; // Import the utility function to fetch with auth

const Profile = () => {
  const [user, setUser] = useState(null); // Store the user's profile data
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track if the user is authenticated
  const [isEditing, setIsEditing] = useState(false); // Track if we are in edit mode
  const [username, setUsername] = useState(""); // State for editing username
  const [bio, setBio] = useState(""); // State for editing bio
  const [stories, setStories] = useState([]); // State to store user's stories
  const [allStories, setAllStories] = useState([]); // State to store all available stories
  const [bookmarks, setBookmarks] = useState([]); // State to store user's bookmarks
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

        // Fetch the user's stories, bookmarks, and comments after fetching user data
        await fetchUserStories(userData.id);
        await fetchUserBookmarks(userData.id); // Fetch user's bookmarks
        await fetchUserComments(userData.id); // Fetch comments posted by the user
        await fetchAllAvailableStories(); // Fetch all available stories
      } else {
        console.error("Failed to fetch user data");
        setIsAuthenticated(false); // Not authenticated
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsAuthenticated(false); // Handle error as unauthenticated
      navigate("/login");
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

  // Fetch all available stories
  const fetchAllAvailableStories = async () => {
    try {
      const allStoriesData = await fetchAllStories(); // Call the fetchAllStories API function
      setAllStories(allStoriesData); // Set all available stories in state
    } catch (error) {
      console.error("Error fetching all available stories:", error);
      setError("An error occurred while fetching available stories.");
    }
  };

  // Fetch user's bookmarked stories
  const fetchUserBookmarks = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const bookmarkedStories = await fetchBookmarkedStories(userId, token);
      setBookmarks(bookmarkedStories); // Set bookmarks in state
    } catch (error) {
      console.error("Error fetching user bookmarks:", error);
      setError("An error occurred while fetching bookmarks.");
    }
  };

  // Fetch all comments made by the user
  const fetchUserComments = async (userId) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:3000/api/users/${userId}/comments`
      );
      if (response.ok) {
        const userComments = await response.json();
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

  if (loading) {
    return <div>Loading user data...</div>; // Show loading spinner or message
  }

  if (!isAuthenticated || !user) {
    return <div>Redirecting to login...</div>; // Redirect if user is not authenticated
  }

  return (
    <>
      <section id="whole-profile">
        <div className="profile">
          <div className="profile-container">
            {/* User Profile Section */}
            <h1>
              Welcome,{" "}
              {isEditing ? (
                <input
                  id="username"
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              ) : (
                user.username
              )}
              !
            </h1>

            {/* Stories Section */}
            <div className="profile-container">
              <h2>Your Stories</h2>
              {stories.length > 0 ? (
                <ul className="story-list">
                  {stories.map((story) => (
                    <div className="story-item" key={story.storyId}>
                      <li>
                        <div id="story-card">
                          <h3>{story.title}</h3>
                          <p>{story.summary || "No summary available"}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/stories/${story.storyId}`)}
                          className="button"
                        >
                          Read more
                        </button>
                      </li>
                    </div>
                  ))}
                </ul>
              ) : (
                <p>Nothing to find here...</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
