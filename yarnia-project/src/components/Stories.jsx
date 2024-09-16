import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { fetchAllStories } from "../api";

const Stories = ({ searchParams }) => {
  const [stories, setStories] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Use navigate from react-router-dom

  useEffect(() => {
    async function getAllStories() {
      try {
        const response = await fetchAllStories();
        setStories(response);
      } catch (error) {
        console.error("Error fetching stories:", error);
        setError("Failed to load stories.");
      }
    }
    getAllStories();
  }, []);

  const storiesToDisplay = searchParams
    ? stories.filter((story) =>
        story.title.toLowerCase().includes(searchParams.toLowerCase())
      )
    : stories;

  const handleSeeSingleStory = (storyId) => {
    // Make sure storyId is valid before navigating
    if (storyId) {
      navigate(fetchSingleStory);
    } else {
      console.error("Story ID is undefined");
    }
  };

  return (
    <div className="stories-container">
      {error && <p>{error}</p>}

      {storiesToDisplay.map((story) => (
        <div key={story.id} className="story-card">
          <h2>{story.title}</h2>
          {story.author ? (
            <p>
              <strong>Author:</strong> {story.author.username}
            </p>
          ) : (
            <p>
              <strong>Author:</strong> Unknown
            </p>
          )}
          <p>
            <strong>Summary:</strong> {story.summary || "No summary available."}
          </p>
          <p>
            <strong>Content Preview:</strong> {story.content?.slice(0, 50)}...
          </p>

          {/* "See Single Story" Button */}
          <button onClick={() => handleSeeSingleStory(story.id)}>
            See Single Story
          </button>
        </div>
      ))}
    </div>
  );
};

export default Stories;
