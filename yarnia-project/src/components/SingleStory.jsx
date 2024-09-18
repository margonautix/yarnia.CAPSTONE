import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchSingleStory, updateStoryContent, fetchWithAuth } from "../API"; // Assuming fetchWithAuth is an API utility

const SingleStory = () => {
  const { storyId } = useParams(); // Get storyId from URL params
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // Holds the authenticated user
  const [isEditing, setIsEditing] = useState(false); // Track if we are in edit mode
  const [content, setContent] = useState(""); // Content for editing

  // Fetch authenticated user when the component mounts
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetchWithAuth(
          "http://localhost:3000/api/auth/me"
        );
        if (response.ok) {
          const userData = await response.json();
          console.log("Fetched user data:", userData); // Log user data for debugging
          setUser(userData); // Set the authenticated user
        } else {
          setError("Failed to authenticate user.");
        }
      } catch (error) {
        setError("Failed to fetch authenticated user.");
      }
    }

    fetchUser();
  }, []);

  // Fetch story by ID
  useEffect(() => {
    const fetchStory = async (id) => {
      try {
        const storyData = await fetchSingleStory(id); // Assume it returns JSON
        if (storyData) {
          console.log("Fetched story data:", storyData); // Log story data for debugging
          setStory(storyData); // Set the fetched story
          setContent(storyData.content); // Set content for editing
        } else {
          setError("Story not found.");
        }
      } catch (error) {
        setError("Error fetching the story.");
      }
    };

    if (storyId) {
      fetchStory(storyId); // Fetch the story if ID is available
    } else {
      setError("No story ID provided.");
    }
  }, [storyId]);

  // Function to handle saving changes
  const handleSave = async () => {
    if (story) {
      try {
        // Update the story content on the backend
        await updateStoryContent(storyId, content);

        // Update the local state with the new content
        setStory({ ...story, content }); // Update the UI
        setIsEditing(false); // Exit editing mode
      } catch (error) {
        setError("Failed to update the story content.");
      }
    }
  };

  // Check if the authenticated user is the author or an admin
  const canEdit = () => {
    if (!user || !story) return false; // Ensure user and story are loaded

    // Check if user is the author or an admin
    const isAuthor = user.username === story.author?.username; // Assuming story.author is an object with a username
    const isAdmin = user.role === "admin";

    console.log("Checking edit permissions:", {
      user,
      story,
      isAuthor,
      isAdmin,
    }); // Log permission check

    return isAuthor || isAdmin;
  };

  if (error) return <div>{error}</div>; // Display errors
  if (!story) return <div>Loading...</div>; // Display loading

  return (
    <div className="story-container">
      <h2>{story.title}</h2>
      <h4>Author: {story.author?.username || "Unknown Author"}</h4>{" "}
      <p>{story.summary}</p>
      <main>
        <ul className="story-single">
          {" "}
          {/* Adjusted to access author username correctly */}
          <p>
            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)} // Update content as you type
                rows="10"
              />
            ) : (
              story.content || "No Content"
            )}
          </p>
          {canEdit() &&
            (isEditing ? (
              <button onClick={handleSave}>Save</button>
            ) : (
              <button onClick={() => setIsEditing(true)}>Edit</button>
            ))}
        </ul>
      </main>
    </div>
  );
};

export default SingleStory;
