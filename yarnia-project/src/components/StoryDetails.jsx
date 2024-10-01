import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchWithAuth } from "../API"; 
import DOMPurify from "dompurify";

const StoryDetails = () => {
  const { storyId } = useParams(); 
  const [story, setStory] = useState(null); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetchWithAuth(
          `http://localhost:3000/api/stories/${storyId}`
        );
        if (response.ok) {
          const data = await response.json();
          setStory(data); 
        } else {
          setError("Failed to load story.");
        }
      } catch (error) {
        setError("An error occurred while fetching the story.");
      }
    };

    fetchStory();
  }, [storyId]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!story) {
    return <p>Loading...</p>;
  }

  return (
    <div className="story-details-container">
      <h1 className="story-title">{story.title}</h1>
      {story.summary && (
        <p className="story-summary">
          <strong>Summary:</strong> {story.summary}
        </p>
      )}
      <div
        className="story-content"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(story.content) }} 
      ></div>
    </div>
  );
};

export default StoryDetails;
