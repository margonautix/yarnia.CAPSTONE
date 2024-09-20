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

  // Handle saving the updated story content
  const handleSave = async () => {
    if (story) {
      try {
        await updateStoryContent(storyId, content); // Update story content
        setStory({ ...story, content });
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to update the story content:", error);
        setError("Failed to update the story content.");
      }
    }
  };

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

  // Toggle comments visibility
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
