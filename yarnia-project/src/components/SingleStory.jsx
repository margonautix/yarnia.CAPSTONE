import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchSingleStory } from "../api";

const SingleStory = () => {
  const { storyId } = useParams(); // Get the storyId from the URL parameters
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getStory() {
      try {
        const fetchedStory = await fetchSingleStory(storyId);
        setStory(fetchedStory);
      } catch (error) {
        console.error("Error fetching the story:", error);
        setError("Failed to load the story.");
      } finally {
        setLoading(false);
      }
    }

    if (storyId) {
      getStory();
    }
  }, [storyId]);

  if (loading) return <p>Loading story...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="single-story">
      {story ? (
        <>
          <h1>{story.title}</h1>
          <p>{story.content}</p>
          <p>
            <strong>Author:</strong> {story.author?.username || "Unknown"}
          </p>
        </>
      ) : (
        <p>No story found</p>
      )}
    </div>
  );
};

export default SingleStory;
