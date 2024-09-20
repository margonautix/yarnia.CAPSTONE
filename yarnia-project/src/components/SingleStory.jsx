import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchSingleStory,
  updateStoryContent,
  fetchWithAuth,
  bookmarkStory,
  fetchCommentsForStory,
} from "../API"; // Adjust the API import path as necessary
import jwt_decode from "jwt-decode"; // To decode JWT
import Comments from "./Comments"; // Import the Comments component

export default function SingleStory() {
  const [isEditing, setIsEditing] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const { storyId } = useParams();
  const [story, setStory] = useState(null);
  const [content, setContent] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);

  // Fetch the user data
  const fetchUser = async () => {
    try {
      const userData = await fetchWithAuth(); // Fetch user data
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setError("Failed to fetch user data.");
    }
  };

  // Fetch the story from the server
  const fetchStory = async (storyId) => {
    try {
      const response = await fetchSingleStory(storyId);
      if (response) {
        setStory(response);
        setContent(response.content);

        const commentsResponse = await fetchCommentsForStory(storyId);
        setComments(commentsResponse);
      } else {
        setError("Story not found.");
      }
    } catch (error) {
      console.error("Failed to fetch the story:", error);
      setError("Failed to fetch the story.");
    }
  };

  // Fetch story and user when the component mounts
  useEffect(() => {
    fetchUser(); // Fetch user data
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

  const handleSave = async () => {
    if (story) {
      try {
        await updateStoryContent(storyId, content);
        setStory({ ...story, content });
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to update the story content:", error);
        setError("Failed to update the story content.");
        console.log(hi);
      }
    }
  };

  const handleBookmark = async () => {
    console.log("User state:", user); // Check user state
    if (!user) {
      setError("You must be logged in to bookmark stories.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await bookmarkStory(storyId, token);
      setBookmarked(true);
    } catch (error) {
      setError("Error occurred while bookmarking the story.");
    }
  };

  const handleDelete = async () => {
    // Assume deleteStory is implemented correctly
    try {
      const result = await deleteStory(storyId);
      if (result) {
        navigate("/profile");
      }
    } catch (error) {
      console.error("Failed to delete the story:", error);
      setError("Failed to delete the story.");
    }
  };

  const toggleComments = () => {
    setIsCommentsOpen(!isCommentsOpen);
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
            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)} // Update content state
              />
            ) : (
              story?.content || "No Content"
            )}
          </p>
          {/* Edit and Save/Delete Buttons */}
          {currentUser?.id === story?.authorId && (
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
          {isCommentsOpen && (
            <Comments
              storyId={storyId}
              refreshComments={() => fetchStory(storyId)}
            />
          )}
        </ul>
      </main>
    </div>
  );
}
