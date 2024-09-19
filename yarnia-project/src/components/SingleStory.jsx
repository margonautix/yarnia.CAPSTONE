import { useState, useEffect } from "react";
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

    fetchUser();
  }, []);

  // Fetch story by ID
  useEffect(() => {
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

    if (storyId) {
      fetchStory(storyId);
    } else {
      setError("No story ID provided.");
    }
  }, [storyId]);

  // Function to handle saving changes
  const handleSave = async () => {
    if (story) {
      try {
        await updateStoryContent(storyId, content);
        setStory({ ...story, content });
        setIsEditing(false);
      } catch (error) {
        setError("Failed to update the story content.");
      }
    }
  };

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
  };

  if (error) return <div>{error}</div>; // Display errors
  if (!story) return <div>Loading...</div>; // Display loading

  return (
    <div className="story-container">
      <h2>{story.title}</h2>
      <p>{story.content}</p>
      <button onClick={handleBookmark} disabled={bookmarked}>
        {bookmarked ? "Bookmarked" : "Bookmark"}
      </button>
      <main>
        <ul className="story-single">
          <h2>{story.title || "No Title"}</h2>
          <h4>Author: {story.author || "Unknown Author"}</h4>
          <h4>Description: {story.summary || "No Description"}</h4>
          <p>
            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)} // Update content as you type
                rows="10"
              />
            ) : (
              story.content || "No Content"
            )}
          </p>
          {canEdit() && (isEditing ? (
            <button onClick={handleSave}>Save</button>
          ) : (
            <button onClick={() => setIsEditing(true)}>Edit</button>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default SingleStory;
