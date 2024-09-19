import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchSingleStory, updateStoryContent } from "../API"; // Assuming these API calls are defined

export default function SingleStory() {
  const [isEditing, setIsEditing] = useState(false); // Track editing state
  const { storyId } = useParams(); // Get the storyId from the URL
  const [story, setStory] = useState(null); // Store story details
  const [content, setContent] = useState(""); // Store content while editing
  const [error, setError] = useState(null); // To track errors

  // Fetch the story from the server
  const fetchStory = async (storyId) => {
    try {
      const response = await fetchSingleStory(storyId); // Fetch story using the id
      if (response) {
        setStory(response); // Set story if it exists
        setContent(response.content); // Set initial content for editing
      } else {
        setError("Story not found.");
      }
    } catch (error) {
      console.error("Failed to fetch the story:", error);
      setError("Failed to fetch the story.");
    }
  };

  // Fetch story when the component mounts or the storyId changes
  useEffect(() => {
    if (storyId) {
      fetchStory(storyId);
    } else {
      setError("No story ID provided.");
    }
  }, [storyId]);

  // Handle saving the updated story content
  const handleSave = async () => {
    if (story) {
      try {
        // Send updated content to the server
        await updateStoryContent(storyId, content); // Assuming this API call updates the story on the server

        // Update the story locally to reflect the change immediately
        setStory({ ...story, content });

        // Exit editing mode
        setIsEditing(false);
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
              <textarea
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
