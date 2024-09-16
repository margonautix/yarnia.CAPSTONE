import React, { useContext, useState } from "react";
import { AuthProvider } from "../Context/AuthContext";

const SingleStory = ({ story }) => {
  const { user } = useContext(AuthProvider);
  const [comment, setComment] = useState("");

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (user) {
      const response = await fetch(`/api/stories/${story.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ userId: user.id, content: comment }),
      });
      const data = await response.json();
      console.log("Comment added:", data);
    } else {
      alert("Please log in to comment");
    }
  };

  return (
    <div>
      <h1>{story.title}</h1>
      <p>{story.content}</p>
      {user ? (
        <form onSubmit={handleCommentSubmit}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button type="submit">Post Comment</button>
        </form>
      ) : (
        <p>You need to be logged in to comment</p>
      )}
    </div>
  );
};

export default SingleStory;
