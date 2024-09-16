import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchSingleStory } from "../api"; // Adjust this path to wherever your fetch function lives

const SingleStory = () => {
  const { id } = useParams(); // Story ID from URL
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStory = async () => {
      try {
        const data = await fetchSingleStory(id);
        setStory(data); // Assuming data includes story, comments, etc.
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch story:", error);
        setLoading(false);
      }
    };
    if (id) {
      getStory();
    }
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!story) {
    return <p>Story not found.</p>;
  }

  return (
    <div>
      <h1>{story.title}</h1>
      <p>{story.content}</p>
      <p>
        <strong>Summary:</strong> {story.summary}
      </p>

      {/* Display comments if they exist */}
      {story.comments && story.comments.length > 0 ? (
        <div>
          <h3>Comments:</h3>
          <ul>
            {story.comments.map((comment) => (
              <li key={comment.id}>
                <p>{comment.content}</p>
                <small>
                  By user {comment.userId} on{" "}
                  {new Date(comment.createdAt).toLocaleDateString()}
                </small>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
};

export default SingleStory;
