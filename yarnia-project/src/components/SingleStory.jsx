import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchSingleStory } from "../API"; // Assuming this is correctly imported

const SingleStory = () => {
  const { storyId } = useParams(); // Make sure this is correctly receiving the parameter
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);

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

  if (error) return <div>{error}</div>;
  if (!story) return <div>Loading...</div>;

  return (
    <div className="story-container">
      <h2>{story.title}</h2>
      <p>{story.content}</p>
    </div>
  );
};

export default SingleStory;
