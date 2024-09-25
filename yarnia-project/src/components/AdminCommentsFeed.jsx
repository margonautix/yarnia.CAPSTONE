import { useEffect, useState } from "react";
import { fetchAllComments } from "../API"; // Adjust the path to your API file

export default function AdminCommentsFeed() {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const allComments = await fetchAllComments();
        console.log(allComments); // Log comments to verify structure
        setComments(allComments);
      } catch (err) {
        setError("Failed to fetch comments.");
      }
    };

    fetchComments();
  }, []);

  return (
    <div className="admin-comments-feed">
      <h2>All Comments</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <li key={comment.commentId}>
              <strong>{comment.user?.username || "Unknown User"}</strong>:{" "}
              {comment.content || "No content available"}
            </li>
          ))
        ) : (
          <p>No comments available.</p>
        )}
      </ul>
    </div>
  );
}
