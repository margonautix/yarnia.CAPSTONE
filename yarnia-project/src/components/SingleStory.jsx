import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchSingleStory } from "../API"; 

export default function SingleStory() {
  const { storyId } = useParams(); 
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null); // To track errors

  useEffect(() => {
    async function fetchStory(storyId) {
      try {
        console.log(`Fetching story with id: ${storyId}`);
        const response = await fetchSingleStory(storyId); // Fetch story using the id
        console.log("API response:", response); // Log the full response

        if (response) {
          setStory(response); // Set story if it exists
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

  if (error) return <div>{error}</div>; // Show error message if any

  if (!story) return <div>Loading...</div>; // Show loading state while fetching

  return (
    <div className="story-container">
      <main>
        <ul className="story-single">
          <h2>{story.title || "No Title"}</h2>
          <h4>Author: {story.author || "Unknown Author"}</h4>
          <h4>Description: {story.summary || "No Description"}</h4>
          <p>Content: {story.content || "No Content"}</p>
        </ul>
      </main>
    </div>
  );
}
