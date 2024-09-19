import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchSingleStory, updateStoryContent } from "../API"; // Assuming these API calls are defined

export default function SingleStory() {
  // const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false); // Track editing state
  const { storyId } = useParams(); // Get the storyId from the URL
  const [story, setStory] = useState(null); // Store story details
  const [content, setContent] = useState(""); // Store content while editing
  const [error, setError] = useState(null); // To track errors

  useEffect(() => {
    async function fetchStory(storyId) {
      try {
        console.log(`Fetching story with id: ${storyId}`);
        const response = await fetchSingleStory(storyId); // Fetch story using the id
        console.log("API response:", response); // Log the full response

        if (response) {
          setStory(response); // Set story if it exists
          setContent(response.content); // Set initial content
        } else {
          setError("Story not found.");
        }
      } catch (error) {
        console.error("Failed to fetch the story:", error);
        setError("Failed to fetch the story."); // Set error state
      }
    }

    if (storyId) {
      fetchStory(storyId); // Fetch the story only if the storyId is present
    } else {
      setError("No story ID provided.");
    }
  }, [storyId]); // Re-fetch the story when the storyId changes

  const handleSave = async () => {
    if (story) {
      try {
        // Optionally, send updated content to the server
        await updateStoryContent(storyId, content); // Assuming this API call updates the story on the server

        // Update the story locally
        setStory({ ...story, content });
        setIsEditing(false); // Exit editing mode
      } catch (error) {
        console.error("Failed to update the story content:", error);
        setError("Failed to update the story content.");
      }
    }
  };

  if (error) return <div>{error}</div>; // Show error message if any

  if (!story) return <div>Loading...</div>; // Show loading state while fetching

  return (
    <div className="story-container">
      <main>
        <ul className="story-single">
          <h2>{story.title || "No Title"}</h2>
          <h4>Author: {story.author || "Unknown Author"}</h4>
          <h4>Description: {story.summary || "No Description"}</h4>
          <p>
            Content:{" "}
            {isEditing ? (
              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            ) : (
              story.content || "No Content"
            )}
          </p>
          {isEditing ? (
            <button onClick={handleSave}>Save</button>
          ) : (
            <button onClick={() => setIsEditing(true)}>Edit</button>
          )}
        </ul>
      </main>
    </div>
  );
}
