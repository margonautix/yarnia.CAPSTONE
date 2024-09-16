import { useEffect, useState } from "react";
import React from "react";
import { fetchAllStories, fetchSingleStory } from "../api/index"; // Import both API functions

const Stories = ({ searchParams }) => {
  const [stories, setStories] = useState([]);
  const [singleStory, setSingleStory] = useState(null); // State to hold a single story's details
  const [error, setError] = useState(null); // Optional: error handling for single story fetch

  useEffect(() => {
    async function getAllStories() {
      try {
        const response = await fetchAllStories(); // Use API function from index.js
        if (response && Array.isArray(response)) {
          setStories(response); // Set the fetched stories
        } else {
          console.error("No stories found or response is undefined.");
        }
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    }
    getAllStories();
  }, []);

  const handleSeeSingleStory = async (storyId) => {
    try {
      const story = await fetchSingleStory(storyId); // Fetch the single story by ID
      setSingleStory(story); // Set the fetched story in state
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error fetching single story:", error);
      setError("Failed to load the story.");
    }
  };

  const storiesToDisplay = searchParams
    ? stories.filter((story) =>
        story.title.toLowerCase().includes(searchParams.toLowerCase())
      )
    : stories;

  return (
    <div>
      {storiesToDisplay.map((story) => (
        <div key={story.storyId || story.id} className="story-card">
          <h2>{story.title}</h2>
          <p>
            <strong>Summary:</strong> {story.summary || "No summary available."}
          </p>
          <p>
            <strong>Content Preview:</strong> {story.content?.slice(0, 50)}...
          </p>
          {story.author ? (
            <p>
              <strong>Author:</strong> {story.author.username}
            </p>
          ) : (
            <p>
              <strong>Author:</strong> Unknown
            </p>
          )}

          {/* "See Single Story" Button */}
          <button onClick={() => handleSeeSingleStory(story.storyId)}>
            See Single Story
          </button>
        </div>
      ))}

      {/* Display the single story details if available */}
      {singleStory && (
        <div className="single-story">
          <h2>{singleStory.title}</h2>
          <p>
            <strong>Author:</strong> {singleStory.author?.username || "Unknown"}
          </p>
          <p>{singleStory.content}</p>
        </div>
      )}

      {/* Display error if single story fetch fails */}
      {error && <p>{error}</p>}
    </div>
  );
};

export default Stories;
