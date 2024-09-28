import { useState, useEffect } from "react";
import { fetchComments, postComment, deleteComment } from "../API"; // Ensure the correct API functions are imported

const Comments = ({ storyId, refreshComments }) => {
  const [comments, setComments] = useState([]); // Store comments
  const [newComment, setNewComment] = useState(""); // Store new comment input
  const [error, setError] = useState(null); // Error handling
  const [loading, setLoading] = useState(false); // Loading state for API calls

  // Get the current logged-in user's ID from localStorage (or from context)
  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  // Fetch comments when the component mounts or when `storyId` changes
  useEffect(() => {
    const fetchStoryComments = async () => {
      setLoading(true); // Set loading state to true
      try {
        const commentsResponse = await fetchComments(storyId); // Fetch comments from the API
        setComments(commentsResponse); // Set the comments state
      } catch (error) {
        console.error("Failed to fetch comments:", error);
        setError("Failed to load comments.");
      } finally {
        setLoading(false); // Set loading state to false after the API call
      }
    };

    if (storyId) {
      fetchStoryComments();
    }
  }, [storyId, refreshComments]);

  // Handle new comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    try {
      await postComment(storyId, newComment); // Post the new comment
      setNewComment(""); // Clear the comment input
      refreshComments(); // Optionally refresh comments after posting
    } catch (error) {
      console.error("Failed to post comment:", error);
      setError("Failed to post comment.");
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    try {
      console.log("delete")
      await deleteComment(storyId, commentId); // Delete the comment using the API
      refreshComments(); // Refresh the comment list after deletion
    } catch (error) {
      console.error("Failed to delete comment:", error);
      setError("Failed to delete comment.");
    }
  };

  return (
    <div className="comments-section">
      <h3>Comments</h3>

      {/* Display loading spinner if comments are being fetched */}
      {loading && <p>Loading comments...</p>}

      {/* Display comments */}
      {comments.length > 0 ? (
        <ul className="comments-list">
          {comments.map((comment) => (
            <li key={comment.commentId}>
              <strong>{comment.user?.username || "Unknown User"}</strong>:{" "}
              <p>{comment.content}</p>
              {comment.userId === userId && (
                <button
                  onClick={() => handleDeleteComment(comment.commentId)}
                  className="delete-button"
                >
                  Delete
                </button>  
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}

      {/* Error message */}
      {error && <p className="error">{error}</p>}

      {/* Add new comment */}
      <form onSubmit={handleSubmitComment}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          required
        />
        <button type="submit">Submit Comment</button>
      </form>
    </div>
  );
};

export default Comments;
