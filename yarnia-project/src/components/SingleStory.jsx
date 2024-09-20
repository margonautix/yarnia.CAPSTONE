import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchSingleStory,
  updateStoryContent,
  fetchWithAuth,
  bookmarkStory,
  // deleteStory,
  fetchCommentsForStory,
} from "../API"; // Adjust the API import path as necessary
import jwt_decode from "jwt-decode"; // To decode JWT
import Comments from "./Comments"; // Import the Comments component

export default function SingleStory() {
<<<<<<< HEAD
  const { storyId } = useParams(); // Get storyId from the URL
  const navigate = useNavigate(); // For navigating after delete or save
  const [story, setStory] = useState(null); // State to hold story details
  const [content, setContent] = useState(""); // State to hold content for editing
  const [comments, setComments] = useState([]); // State to hold comments
  const [isEditing, setIsEditing] = useState(false); // Track if story is being edited
  const [isCommentsOpen, setIsCommentsOpen] = useState(false); // Track if comments section is open
  const [error, setError] = useState(null); // Track any errors
  const [currentUser, setCurrentUser] = useState(null); // State for current user info
=======
  const [isEditing, setIsEditing] = useState(false); // Track editing state
  const [isCommentsOpen, setIsCommentsOpen] = useState(false); // State for comments dropdown
  const { storyId } = useParams(); // Get the storyId from the URL
  const [story, setStory] = useState(null); // Store story details
  const [content, setContent] = useState(""); // Store content while editing
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null); // To track errors
  const [comments, setComments] = useState([]); // Holds comments for the story
  const navigate = useNavigate(); // For navigation after deletion or saving
  const [bookmarked, setBookmarked] = useState(false);
>>>>>>> df9b9ff04e7d1bfe25b978f8c6a9f1529e23993f

  // Fetch the story and comments from the server
  const fetchStory = async (storyId) => {
    try {
      const storyResponse = await fetchSingleStory(storyId); // Fetch the story
      if (storyResponse) {
        setStory(storyResponse); // Set the story state
        setContent(storyResponse.content); // Set the content for editing

        // Fetch the comments related to the story
        const commentsResponse = await fetchCommentsForStory(storyId);
        if (commentsResponse) {
          setComments(commentsResponse); // Set the comments state
        }
      } else {
        setError("Story not found.");
      }
    } catch (error) {
      console.error("Failed to fetch the story:", error);
      setError("Failed to fetch the story.");
    }
  };

  // Fetch story and user data when the component mounts or when storyId changes
  useEffect(() => {
    if (storyId) {
      fetchStory(storyId);
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

  // Render each comment correctly with author and content
  const renderComments = () => {
    if (comments.length > 0) {
      return (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>
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

<<<<<<< HEAD
  // Toggle comments visibility
=======
  const handleBookmark = async () => {
    if (!user) {
      setError("You must be logged in to bookmark stories.");
      return;
    }

    const token = localStorage.getItem("token"); // Get the token
    try {
      await bookmarkStory(storyId, token); // Pass the token correctly
      setBookmarked(true);
    } catch (error) {
      setError("Error occurred while bookmarking the story.");
    }
  };

  const handleDelete = async () => {
    try {
      console.log("Attempting to delete story with ID:", storyId);

      // Call the deleteStory API
      const result = await deleteStory(storyId);

      if (result) {
        console.log("Story deleted successfully");
        navigate("/profile"); // Navigate to profile after deletion
      }
    } catch (error) {
      console.error("Failed to delete the story:", error);
      setError("Failed to delete the story.");
    }
  };

  // Toggle the comments dropdown
>>>>>>> df9b9ff04e7d1bfe25b978f8c6a9f1529e23993f
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
          <p>
            Content:{" "}
            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)} // Update content state
              />
            ) : (
              story?.content || "No Content"
            )}
          </p>

<<<<<<< HEAD
          {/* Comments toggle and display */}
=======
          {isEditing ? (
            <button onClick={handleSave}>Save</button>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
              <button onClick={handleBookmark} disabled={bookmarked}>
                {bookmarked ? "Bookmarked" : "Bookmark"}
              </button>
            </>
          )}

          {/* Dropdown for comments */}
>>>>>>> df9b9ff04e7d1bfe25b978f8c6a9f1529e23993f
          <h2
            onClick={toggleComments}
            style={{ cursor: "pointer", color: "blue" }}
          >
            {isCommentsOpen
              ? "Hide Comments"
              : `Show Comments (${comments.length})`}
          </h2>

          {isCommentsOpen && renderComments()}

          {/* Add new comment functionality */}
          <Comments
            storyId={storyId}
            refreshComments={() => fetchStory(storyId)}
          />
        </ul>
      </main>
    </div>
  );
}
