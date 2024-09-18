import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchSingleStory, updateStoryContent, fetchWithAuth } from "../API"; // Assuming fetchWithAuth is an API utility


const SingleStory = () => {
  const { storyId } = useParams(); // Make sure this is correctly receiving the parameter
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // Holds the authenticated user

  // Fetch authenticated user when the component mounts
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetchWithAuth(
          "http://localhost:3000/api/auth/me"
        );
        if (response.ok) {
          const userData = await response.json();
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

  useEffect(() => {
    const fetchStory = async (id) => {
      try {
        const response = await fetchSingleStory(id);
        if (response.ok) {
          const storyData = await response.json();
          setStory(storyData);
        } else {
          setError("Story not found.");
        }
      } catch (error) {
        setError("Error fetching the story.");
      }
    };

    if (storyId) {
      fetchStory(storyId); // Only call if storyId is defined
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
        setStory({ ...story, content }); // This will update the UI
        setIsEditing(false); // Exit editing mode
      } catch (error) {
        setError("Failed to update the story content.");
      }
    }
  };

  // Check if the authenticated user is the author or an admin
  const canEdit = () => {
    return user && (user.username === story?.author || user.role === "admin");
  };
  if (!story) return <div>Loading...</div>;

  return (
    <div className="story-container">
      <h2>{story.title}</h2>
      <p>{story.content}</p>
      <main>
        <ul className="story-single">
          <h2>{story.title || "No Title"}</h2>
          <h4>Author: {story.author || "Unknown Author"}</h4>
          <h4>Description: {story.summary || "No Description"}</h4>
          <p>
            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)} // Update content as you type
                rows="10" // Set initial height for the textarea
              />
            ) : (
              story.content || "No Content"
            )}
          </p>

          {/* Only show edit button if user is the author or admin */}
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
