import { useState } from "react";

const Comments = ({ storyId, refreshComments }) => {
  const [comment, setComment] = useState(""); // Track the comment text
  const user = JSON.parse(localStorage.getItem("user")); // Get user from localStorage

  const handleComment = async () => {
    if (!user) {
      alert("You must be logged in to comment.");
      return;
    }

    try {
      const response = await fetch(`/api/stories/${storyId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`, // Use token for authentication
        },
        body: JSON.stringify({ content: comment }), // Send the content in the body
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.message}`);
        return;
      }

      // Comment was posted successfully
      alert("Comment added!");
      setComment(""); // Clear the input field
      refreshComments(); // Refresh comments after posting
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post the comment. Please try again.");
    }
  };

  return (
    <div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your comment here..."
      />
      <button onClick={handleComment}>Post Comment</button>
    </div>
  );
};

export default Comments;
