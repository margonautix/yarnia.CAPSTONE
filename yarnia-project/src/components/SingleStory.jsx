import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  fetchSingleStory,
  updateStoryContent,
  bookmarkStory,
  deleteStory, // Ensure this import is correct
  fetchComments,
  postComment,
  checkBookmarkStatus, // Import your new API function
} from "../API"; // Adjust the API import path as necessary
import jwt_decode from "jwt-decode"; // To decode JWT
import DOMPurify from "dompurify"; // Import DOMPurify for sanitizing HTML
import ReactQuill from "react-quill"; // Import ReactQuill
import "react-quill/dist/quill.snow.css"; // Import the CSS for the editor

export default function SingleStory({ user }) {
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
  const [bookmarked, setBookmarked] = useState(false); // Track bookmark status

  const fetchStoryAndComments = async (storyId) => {
    try {
      const storyResponse = await fetchSingleStory(storyId); // Fetch the story
      if (storyResponse) {
        setStory(storyResponse); // Set the story state
        setContent(storyResponse.content); // Set the content for editing

        // Fetch the comments related to the story
        const commentsResponse = await fetchComments(storyId); // Ensure this API call works
        console.log(commentsResponse); // Log to check if comments are fetched
        if (commentsResponse) {
          setComments(commentsResponse); // Set the comments state
        } else {
          setComments([]); // Set to empty if no comments are found
        }
      } else {
        setError("Story not found.");
      }
    } catch (error) {
      console.error("Failed to fetch the story and comments:", error);
      setError("Failed to fetch the story.");
    }
  };

  // Fetch bookmark status for the user and story
  const fetchBookmarkStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !currentUser) return; // If no token or user is not logged in, skip

      const { id } = jwt_decode(token); // Decode token to get user ID
      const response = await checkBookmarkStatus(id, storyId); // Check if the user has bookmarked this story
      if (response.bookmarked) {
        setBookmarked(true); // Update bookmark status
      }
    } catch (error) {
      console.error("Failed to check bookmark status:", error);
    }
  };

  // Fetch story, user data, and bookmark status when the component mounts or when storyId changes
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

  useEffect(() => {
    fetchBookmarkStatus(); // Check bookmark status
  }, [currentUser]);

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

  // Handle submitting a new comment in SingleStory
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("You must be logged in to comment.");
      return;
    }

    try {
      // Post the new comment
      await postComment(storyId, currentUser.id, newComment);

      // Fetch updated comments
      const updatedComments = await fetchComments(storyId);
      setComments(updatedComments); // Update the comments state
      setNewComment(""); // Clear the input field
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  // Render the comments and comment form
  const renderComments = () => (
    <div className="comments-section">
      {comments.length > 0 ? (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>
              <strong>{comment.userId?.username || "Anonymous"}:</strong>
              <p>{comment.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}

      {currentUser && (
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
    </div>
  );

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
      await bookmarkStory(storyId, user.id, token); // Pass the token correctly
      console.log("anything");
      setBookmarked(true);
      console.log("bye");
    } catch (error) {
      setError("Error occurred while bookmarking the story.");
    }
  };

  const toggleComments = () => {
    setIsCommentsOpen(!isCommentsOpen);
    console.log("Comments are", isCommentsOpen ? "closed" : "open");
  };

  return (
    <div className="story-container">
      <main>
        <ul className="story-single">
          {/* Display story title */}
          <h2>{story?.title || "No Title"}</h2>
          <h4>
            Author:{" "}
            {story?.author?.username ? (
              <Link to={`/profile/${story.authorId}`}>
                {story.author.username}
              </Link>
            ) : (
              "Unknown Author"
            )}
          </h4>
          <h4>Description: {story?.summary || "No Description"}</h4>

          {/* Display or edit story content */}
          <div>
            {isEditing ? (
              <ReactQuill
                value={content}
                onChange={setContent} // Update content state
                theme="snow" // Quill theme
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
