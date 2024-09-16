import React, { useState, useEffect } from "react";
import { fetchAllComments } from "../api/index";

const CommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getComments = async () => {
      try {
        const data = await fetchAllComments();
        setComments(data);
      } catch (err) {
        setError("Failed to load comments");
      } finally {
        setLoading(false);
      }
    };

    getComments();
  }, []);

  if (loading) {
    return <p>Loading comments...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>All Comments</h2>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            <p>
              <strong>{comment.author}</strong>: {comment.content}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentsPage;
