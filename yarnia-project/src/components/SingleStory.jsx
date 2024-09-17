import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchSingleStory, updateStoryContent } from "../API";

export default function SingleStory() {
  const [isEditing, setIsEditing] = useState(false);
  const { storyId } = useParams();
  const [story, setStory] = useState(null); // Holds the entire story
  const [content, setContent] = useState(""); // Holds the content being edited
  const [error, setError] = useState(null);

  // Fetch the story when the component mounts
  useEffect(() => {
    async function fetchStory(storyId) {
      try {
        const response = await fetchSingleStory(storyId);
        if (response) {
          setStory(response); // Set the story
          setContent(response.content); // Set the content for editing
        } else {
          setError("Story not found.");
        }
      } catch (error) {
        setError("Failed to fetch the story.");
      }
    }

    if (storyId) {
      fetchStory(storyId);
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

  if (error) return <div>{error}</div>;
  if (!story) return <div>Loading...</div>;

  return (
    <div className="story-container">
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
