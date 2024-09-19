import { useState, useEffect } from "react";
<<<<<<< HEAD
import { useNavigate, useParams } from "react-router-dom";
import { fetchSingleStory, updateStoryContent, fetchWithAuth, bookmarkStory } from "../API"; // Ensure all imports are correct

const SingleStory = () => {
  const { storyId } = useParams(); // Get storyId from URL params
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // Holds the authenticated user
  const [isEditing, setIsEditing] = useState(false); // Track if we are in edit mode
  const [bookmarked, setBookmarked] = useState(false);
  const [content, setContent] = useState(""); // Content for editing

  const navigate = useNavigate();

  // Fetch authenticated user when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetchWithAuth(`http://localhost:3000/api/auth/me`);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData); // Set the authenticated user
        } else {
          setError("Failed to authenticate user.");
        }
      } catch (error) {
        setError("Failed to fetch authenticated user.");
      }
    };
=======
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchSingleStory,
  updateStoryContent,
  deleteStory,
  fetchCommentsForStory,
} from "../API"; // Adjust the API import path as necessary

export default function SingleStory() {
  const [isEditing, setIsEditing] = useState(false); // Track editing state
  const [isCommentsOpen, setIsCommentsOpen] = useState(false); // State for comments dropdown
  const { storyId } = useParams(); // Get the storyId from the URL
  const [story, setStory] = useState(null); // Store story details
  const [content, setContent] = useState(""); // Store content while editing
  const [error, setError] = useState(null); // To track errors
  const [comments, setComments] = useState([]); // Holds comments for the story
  const navigate = useNavigate(); // For navigation after deletion or saving

  // Fetch the story from the server
  const fetchStory = async (storyId) => {
    try {
      const response = await fetchSingleStory(storyId); // Fetch story using the id
      if (response) {
        setStory(response); // Set story if it exists
        setContent(response.content); // Set initial content for editing

        // Fetch comments for the story
        const commentsResponse = await fetchCommentsForStory(storyId);
        setComments(commentsResponse); // Set the comments
      } else {
        setError("Story not found.");
      }
    } catch (error) {
      console.error("Failed to fetch the story:", error);
      setError("Failed to fetch the story.");
    }
  };
>>>>>>> origin

  // Fetch story when the component mounts or the storyId changes
  useEffect(() => {
<<<<<<< HEAD
    const fetchStory = async (id) => {
      try {
        const storyData = await fetchSingleStory(id);
        if (storyData) {
          setStory(storyData);
          setContent(storyData.content); // Set content for editing
        } else {
          setError("Story not found.");
        }
      } catch (error) {
        setError("Error fetching the story.");
      }
    };

=======
>>>>>>> origin
    if (storyId) {
      fetchStory(storyId);
    } else {
      setError("No story ID provided.");
    }
  }, [storyId]);

  // Handle saving the updated story content
  const handleSave = async () => {
    if (story) {
      try {
<<<<<<< HEAD
        await updateStoryContent(storyId, content);
        setStory({ ...story, content });
        setIsEditing(false);
      } catch (error) {
=======
        await updateStoryContent(storyId, content); // Update story content
        setStory({ ...story, content });
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to update the story content:", error);
>>>>>>> origin
        setError("Failed to update the story content.");
      }
    }
  };

<<<<<<< HEAD
  // Function to handle bookmarking
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
  

  // Check if the authenticated user is the author or an admin
  const canEdit = () => {
    return user && (user.username === story?.author || user.role === "admin");
=======
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
>>>>>>> origin
  };

  // Toggle the comments dropdown
  const toggleComments = () => {
    setIsCommentsOpen(!isCommentsOpen); // Toggle comments dropdown
  };

  if (error) return <div>{error}</div>;

  if (!story) return <div>Loading...</div>;

  return (
    <div className="story-container">
<<<<<<< HEAD
      <h2>{story.title}</h2>
      <p>{story.content}</p>
      <button onClick={handleBookmark} disabled={bookmarked}>
        {bookmarked ? "Bookmarked" : "Bookmark"}
      </button>
=======
>>>>>>> origin
      <main>
        <ul className="story-single">
          <h2>{story.title || "No Title"}</h2>
          <h4>Author: {story.author || "Unknown Author"}</h4>
          <h4>Description: {story.summary || "No Description"}</h4>
          <p>
            Content:{" "}
            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            ) : (
              story.content || "No Content"
            )}
          </p>
<<<<<<< HEAD
          {canEdit() && (isEditing ? (
            <button onClick={handleSave}>Save</button>
          ) : (
            <button onClick={() => setIsEditing(true)}>Edit</button>
          ))}
=======

          {isEditing ? (
            <button onClick={handleSave}>Save</button>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
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
          {isCommentsOpen && (
            <div>
              {comments.length > 0 ? (
                <ul>
                  {comments.map((comment) => (
                    <li key={comment.id}>
                      <strong>{comment.author}</strong>: {comment.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No comments yet.</p>
              )}
            </div>
          )}
>>>>>>> origin
        </ul>
      </main>
    </div>
  );
}
