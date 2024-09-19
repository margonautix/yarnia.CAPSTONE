import { useState } from "react";

const Comments = ({ storyId }) => {
  const [comment, setComment] = useState("");
  const user = JSON.parse(localStorage.getItem("user")); // Get user info from localStorage

  const handleComment = async () => {
    if (!user) {
      alert("You must be logged in to comment.");
      return;
    }

    const response = await fetch(`/api/stories/${storyId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`, // Use token from localStorage
      },
      body: JSON.stringify({ text: comment }),
    });

    if (response.ok) {
      alert("Comment added!");
      setComment(""); // Clear the comment field
    }
  };

  return (
    <div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
      <button onClick={handleComment}>Post Comment</button>
    </div>
  );
};

export default Comments;
