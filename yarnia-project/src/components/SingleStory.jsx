import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  fetchSingleStory,
  updateStoryContent,
  bookmarkStory,
  deleteStory, // Ensure this import is correct
  fetchComments,
  postComment,
  checkBookmarkStatus,
  deleteComment, // Import your new API function
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
  const [title, setTitle] = useState(""); // Store title while editing
  const [summary, setSummary] = useState(""); // Store summary while editing

  // Fetch the story and comments from the server
  const fetchStoryAndComments = async (storyId) => {
    try {
      const storyResponse = await fetchSingleStory(storyId); // Fetch the story
      if (storyResponse) {
        setStory(storyResponse); // Set the story state
        setContent(storyResponse.content); // Set the content for editing
        setTitle(storyResponse.title); // Set the title for editing
        setSummary(storyResponse.summary); // Set the summary for editing

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
      // Send updated title, summary, and content to the API
      const response = await updateStoryContent(storyId, {
        title,
        summary,
        content,
      });
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

  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this comment?"
    );
    if (!confirmDelete) return; // If the user cancels, exit the function

    try {
      await deleteComment(storyId, commentId); // Call the API to delete the comment

      // Update the comments state by removing the deleted comment
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.commentId !== commentId)
      );

      alert("Comment deleted successfully!"); // Optional: You can remove this alert if you'd prefer no prompt
    } catch (error) {
      console.error("Failed to delete the comment:", error);
      setError("Failed to delete the comment.");
    }
  };

  // Handle bookmarking the story
  const handleBookmark = async () => {
    if (!currentUser) {
      setError("You must be logged in to bookmark stories.");
      return;
    }
    const token = localStorage.getItem("token"); // Get the token
    try {
      await bookmarkStory(storyId, currentUser.id, token); // Pass the token correctly
      setBookmarked(true); // Update bookmark status
    } catch (error) {
      setError("Error occurred while bookmarking the story.");
    }
  };

  // Toggle the comments dropdown
  const toggleComments = () => {
    setIsCommentsOpen(!isCommentsOpen); // Toggle the comments section
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

  const renderComments = () => {
    if (comments.length > 0) {
      return (
        <ul className="comments-list">
          {comments.map((comment) => (
            <li key={comment.commentId} className="comment-item">
              <strong>
                {comment.user?.username ? (
                  currentUser?.id === comment.userId ? (
                    // Link to the current user's profile
                    <Link to="/profile">{comment.user.username}</Link>
                  ) : (
                    // Link to other users' profiles
                    <Link to={`/users/${comment.userId}`}>
                      {comment.user.username}
                    </Link>
                  )
                ) : (
                  "Unknown User"
                )}
              </strong>
              : {comment.content || "No content available"}
              {/* Show delete button for user, admin, or story author */}
              {(currentUser?.id === comment.userId ||
                currentUser?.isAdmin ||
                currentUser?.id === story?.authorId) && (
                <button
                  onClick={() => handleDeleteComment(comment.commentId)}
                  className="button"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      );
    } else {
      return <p>No comments yet.</p>;
    }
  };

  return (
    <div className="story-container">
      <main>
        <ul className="story-single">
          {/* Display or edit story title */}
          <div>
            {isEditing ? (
              <input
                type="text"
                value={title} // Controlled input for title
                onChange={(e) => setTitle(e.target.value)} // Update title state
                placeholder="Enter story title"
              />
            ) : (
              <h2>{story?.title || "No Title"}</h2> // Display the title when not editing
            )}
          </div>

          {/* Display or edit story summary */}
          <div>
            {isEditing ? (
              <textarea
                value={summary} // Controlled textarea for summary
                onChange={(e) => setSummary(e.target.value)} // Update summary state
                placeholder="Enter story summary"
              />
            ) : (
              <h4>Description: {story?.summary || "No Description"}</h4> // Display the summary when not editing
            )}
          </div>

          {/* Existing content editing section */}
          <div>
            {isEditing ? (
              <ReactQuill
                value={content} // Controlled editor for content
                onChange={setContent} // Update content state
                modules={{
                  toolbar: [
                    [{ header: "1" }, { header: "2" }, { font: [] }],
                    [{ size: [] }],
                    ["bold", "italic", "underline", "strike", "blockquote"],
                    [
                      { list: "ordered" },
                      { list: "bullet" },
                      { indent: "-1" },
                      { indent: "+1" },
                    ],
                    [{ align: "justify" }],
                    ["clean"],
                  ],
                }}
                formats={[
                  "header",
                  "font",
                  "size",
                  "bold",
                  "italic",
                  "underline",
                  "strike",
                  "blockquote",
                  "list",
                  "bullet",
                  "indent",
                  "align",
                ]}
              />
            ) : (
              <div
                className="story-content"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(story?.content || "No Content"),
                }}
              />
            )}
          </div>
          {/* Edit and Save/Delete Buttons */}
          {(currentUser?.id === story?.authorId || currentUser?.isAdmin) && (
            <div className="button-group">
              {isEditing ? (
                <button onClick={handleSaveContent} className="button">
                  Save
                </button>
              ) : (
                <button onClick={() => setIsEditing(true)} className="button">
                  Edit
                </button>
              )}
              <button onClick={handleDeleteStory} className="button">
                Delete
              </button>
              <button
                className="button"
                onClick={handleBookmark}
                disabled={bookmarked}
              >
                {bookmarked ? "Bookmarked" : "Bookmark"}
              </button>
            </div>
          )}

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
              <button type="submit" className="button">
                Submit Comment
              </button>
            </form>
          )}
          {error && <p className="error">{error}</p>}
        </ul>
      </main>
    </div>
  );
}
