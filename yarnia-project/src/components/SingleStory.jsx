import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchSingleStory } from "../api"; // Assuming this fetches a single story from the API

const SingleStory = () => {
  const { id } = useParams(); // Extract the ID from the URL
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStory = async () => {
      try {
        const data = await fetchSingleStory(id);
        setStory(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching story:", error);
        setLoading(false);
      }
    };
    getStory();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!story) {
    return <div>Story not found</div>;
  }

  return (
    <div>
      <h1>{story.title}</h1>
      <p>{story.content}</p>
      <p>
        <strong>Author:</strong> {story.author.username}
      </p>
      <p>
        <strong>Published:</strong>{" "}
        {new Date(story.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default SingleStory;
