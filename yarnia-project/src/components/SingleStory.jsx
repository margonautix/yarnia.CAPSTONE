import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchSingleStory,
  updateStoryContent,
  bookmarkStory,
  deleteStory,
  fetchComments, // Assuming this API fetches comments
  postComment, // Assuming this API allows posting a comment
} from "../API"; // Adjust the API import path as necessary
import jwt_decode from "jwt-decode"; // To decode JWT
import DOMPurify from "dompurify"; // Import DOMPurify for sanitizing HTML


export default function SingleStory({user}) {
  const { storyId } = useParams(); // Get storyId from the URL
  const navigate = useNavigate(); // For navigating after delete or save
  const [currentUser, setCurrentUser] = useState(null); // State for current user info
  const [isEditing, setIsEditing] = useState(false); // Track editing state
  const [isCommentsOpen, setIsCommentsOpen] = useState(false); // State for comments dropdown
  const [story, setStory] = useState(null); // Store story details
  const [content, setContent] = useState(""); // Store content while editing
  const [error, setError] = useState(null); // To track errors
  const [comments, setComments] = useState([]); // Holds comments for the story
  const [newComment, setNewComment] = useState(""); // Store new comment input
  const [bookmarked, setBookmarked] = useState(false);

  // Fetch the story and comments from the server
  const fetchStoryAndComments = async (storyId) => {
    try {
      const storyResponse = await fetchSingleStory(storyId); // Fetch the story
      if (storyResponse) {
        setStory(storyResponse); // Set the story state
        setContent(storyResponse.content); // Set the content for editing

        // Fetch the comments related to the story
        const commentsResponse = await fetchComments(storyId); // Ensure this API call works
        if (commentsResponse) {
          setComments(commentsResponse); // Set the comments state
        }
      } else {
        setError("Story not found.");
      }
    } catch (error) {
      console.error("Failed to fetch the story and comments:", error);
      setError("Failed to fetch the story.");
    }
  };

  // Fetch story and user data when the component mounts or when storyId changes
  useEffect(() => {
    if (storyId) {
      fetchStoryAndComments(storyId);
    } else {
      setError("No story ID provided.");
    }

    // Decode JWT and set the current user
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwt_decode(token); // Decode the token to get user info
      setCurrentUser(decoded);
    }
  }, [storyId]);

  // Function to handle content update
  const handleSaveContent = async () => {
    try {
      const response = await updateStoryContent(storyId, content); // Send updated content to API
      if (response) {
        setIsEditing(false); // Exit editing mode after saving
        fetchStoryAndComments(storyId); // Refresh the story data
      }
    } catch (error) {
      console.error("Failed to update the story:", error);
      alert("Failed to update the story.");
    }
  };

  // Function to handle story deletion
  const handleDeleteStory = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this story?"
    );
    if (confirmDelete) {
      try {
        await deleteStory(storyId); // Call the deleteStory function
        alert("Story deleted successfully!");
        navigate("/"); // Navigate back to the home page after deletion
      } catch (error) {
        console.error("Failed to delete the story:", error);
        alert("Failed to delete the story.");
      }
    }
  };

  // Render each comment correctly with author and content
  const renderComments = () => {
    if (comments.length > 0) {
      return (
        <ul className="comments-list">
          {comments.map((comment) => (
            <li key={comment.commentId} className="comment-item">
              {/* Optional chaining to handle undefined username */}
              <strong>{comment.user?.username || "Unknown User"}</strong>:{" "}
              {comment.content || "No content available"}
            </li>
          ))}
        </ul>
      );
    } else {
      return <p>No comments yet.</p>;
    }
  };

  // Handle new comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment) return;

    try {
      await postComment(storyId, newComment); // Post the new comment to the API
      setNewComment(""); // Clear the comment input
      fetchStoryAndComments(storyId); // Refresh the comments
    } catch (error) {
      console.error("Failed to post comment:", error);
      setError("Failed to post comment.");
    }
  };

  // Handle bookmarking the story
  const handleBookmark = async () => {
    if (!currentUser) {
      setError("You must be logged in to bookmark stories.");
      console.log("hi");
      return;
    }
    const token = localStorage.getItem("token"); // Get the token
    try {
      console.log(token);
      console.log(user);
      await bookmarkStory(storyId,user.id, token); // Pass the token correctly
      console.log("anything")
      setBookmarked(true);
      console.log("bye")
    } catch (error) {
      setError("Error occurred while bookmarking the story.");
    }
  };

  // Toggle the comments dropdown
  const toggleComments = () => {
    setIsCommentsOpen(!isCommentsOpen); // Toggle the comments section
  };

  return (
    <div className="story-container">
      <main>
        <ul className="story-single">
          {/* Display story title */}
          <h2>{story?.title || "No Title"}</h2>
          <h4>Author: {story?.author?.username || "Unknown Author"}</h4>
          <h4>Description: {story?.summary || "No Description"}</h4>

          {/* Display or edit story content */}
          <div>
            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)} // Update content state
              />
            ) : (
              <div
                className="story-content"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(story?.content || "No Content"),
                }} // Use DOMPurify to sanitize and render the content as HTML
              />
            )}
          </div>
          {/* Edit and Save/Delete Buttons */}
          {(currentUser?.id === story?.authorId || currentUser?.isAdmin) && (
            <div className="button-group">
              {isEditing ? (
                <button onClick={handleSaveContent} className="save-button">
                  Save
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="edit-button"
                >
                  Edit
                </button>
              )}
              <button onClick={handleDeleteStory} className="cancel-button">
                Delete
              </button>
            </div>
          )}
              <button onClick={handleBookmark} disabled={bookmarked}>
                {bookmarked ? "Bookmarked" : "Bookmark"}
              </button>
          {/* Comments toggle and display */}
          <h2 onClick={toggleComments} className="toggle-comments-btn">
            {isCommentsOpen
              ? "Hide Comments"
              : `Show Comments (${comments.length})`}
          </h2>

          {isCommentsOpen && renderComments()}

          {/* New Comment Form */}
          {isCommentsOpen && currentUser && (
            <form onSubmit={handleSubmitComment}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                required
              />
              <button type="submit">Submit Comment</button>
            </form>
          )}

          {/* Display error if there is any */}
          {error && <p className="error">{error}</p>}
        </ul>
      </main>
    </div>
  );
}