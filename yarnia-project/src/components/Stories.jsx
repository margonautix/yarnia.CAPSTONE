import { useEffect, useState } from "react";
import React from "react";
import { fetchAllStories, fetchSingleStory } from "../api"; // Import both API functions

const Stories = ({ searchParams }) => {
  const [stories, setStories] = useState([]);
  const [singleStory, setSingleStory] = useState(null); // State to hold a single story's details
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getAllStories() {
      try {
        const response = await fetchAllStories();
        setStories(response);
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    }
    getAllStories();
  }, []);

  const handleSeeSingleStory = async (storyId) => {
    try {
      const story = await fetchSingleStory(storyId);
      setSingleStory(story);
      setError(null);
    } catch (error) {
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
        <div key={story.id} className="story-card">
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
          <button onClick={() => handleSeeSingleStory(story.id)}>
            See Single Story
          </button>
        </div>
      ))}

      {singleStory && (
        <div className="single-story">
          <h2>{singleStory.title}</h2>
          <p>
            <strong>Author:</strong> {singleStory.author?.username || "Unknown"}
          </p>
          <p>{singleStory.content}</p>
        </div>
      )}
      {error && <p>{error}</p>}
    </div>
  );
};

export default Stories;
