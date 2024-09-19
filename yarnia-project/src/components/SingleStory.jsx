import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchSingleStory,
  updateStoryContent,
  deleteStory,
  fetchCommentsForStory,
  fetchWithAuth,
  bookmarkStory
} from "../API";

const SingleStory = () => {
  const { storyId } = useParams();
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [content, setContent] = useState("");
  const [comments, setComments] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetchWithAuth(`http://localhost:3000/api/auth/me`);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setError("Failed to authenticate user.");
        }
      } catch {
        setError("Failed to fetch authenticated user.");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchStory = async (id) => {
      try {
        const storyData = await fetchSingleStory(id);
        if (storyData) {
          setStory(storyData);
          setContent(storyData.content);
          
          const commentsResponse = await fetchCommentsForStory(id);
          setComments(commentsResponse);
        } else {
          setError("Story not found.");
        }
      } catch {
        setError("Error fetching the story.");
      }
    };

    if (storyId) {
      fetchStory(storyId);
    } else {
      setError("No story ID provided.");
    }
  }, [storyId]);

  const handleSave = async () => {
    if (story) {
      try {
        await updateStoryContent(storyId, content);
        setStory({ ...story, content });
        setIsEditing(false);
      } catch {
        setError("Failed to update the story content.");
      }
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      setError("You must be logged in to bookmark stories.");
      return;
    }
  
    const token = localStorage.getItem("token");
    try {
      await bookmarkStory(storyId, token);
      setBookmarked(true);
    } catch {
      setError("Error occurred while bookmarking the story.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStory(storyId);
      navigate("/profile");
    } catch {
      setError("Failed to delete the story.");
    }
  };

  const toggleComments = () => {
    setIsCommentsOpen(!isCommentsOpen);
  };

  if (error) return <div>{error}</div>;
  if (!story) return <div>Loading...</div>;

  return (
    <div className="story-container">
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
          {isEditing ? (
            <button onClick={handleSave}>Save</button>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
            </>
          )}
          <h2 onClick={toggleComments} style={{ cursor: "pointer", color: "blue" }}>
            {isCommentsOpen ? "Hide Comments" : `Show Comments (${comments.length})`}
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
        </ul>
      </main>
    </div>
  );
};

export default SingleStory;
