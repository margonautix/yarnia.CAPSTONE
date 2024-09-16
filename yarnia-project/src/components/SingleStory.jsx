import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchSingleStory } from "../api";

const SingleStory = () => {
  const { id } = useParams(); // Get story ID from URL parameters
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStory = async () => {
      try {
        const data = await fetchSingleStory(id);
        setStory(data);
      } catch (err) {
        setError("Failed to load story.");
      } finally {
        setLoading(false);
      }
    };

    getStory();
  }, [id]);

  if (loading) {
    return <p>Loading story...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="single-story">
      <h1>{story.title}</h1>
      <p>
        <strong>Author:</strong> {story.author?.username || "Unknown"}
      </p>
      <p>{story.content}</p>
    </div>
  );
};

export default SingleStory;
