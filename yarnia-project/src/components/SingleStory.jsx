import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  fetchSingleStory,
  updateStoryContent,
  fetchWithAuth,
  fetchCommentsForStory,
} from "../API"; // Adjust the API import path as necessary

export default function SingleStory() {
  const [isEditing, setIsEditing] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const { storyId } = useParams();
  const [story, setStory] = useState(null);
  const [content, setContent] = useState("");
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetchWithAuth("http://localhost:3000/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setError("Failed to authenticate user.");
        }
      } catch {
        setError("Failed to fetch authenticated user.");
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchStory(storyId) {
      setLoading(true);
      try {
        const response = await fetchSingleStory(storyId);
        if (response) {
          setStory(response);
          setContent(response.content);

          // Fetch comments for the story
          const commentsResponse = await fetchCommentsForStory(storyId);
          console.log("Fetched comments:", commentsResponse); // Log to check structure
          setComments(commentsResponse);
        } else {
          setError("Story not found.");
        }
      } catch {
        setError("Failed to fetch the story or comments.");
      } finally {
        setLoading(false);
      }
    }

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

  const canEdit = useMemo(() => {
    return user && (user.username === story.author.username || user.isAdmin);
  }, [user, story]);

  const toggleComments = (e) => {
    e.stopPropagation(); // Prevent any parent click events
    setIsCommentsOpen((prev) => !prev);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!story) return <div>No story found.</div>;

  return (
    <div className="story-container">
      <main>
        <ul className="story-single">
          <h2>{story.title || "No Title"}</h2>
          <h4>Author: {story.author.username || "Unknown Author"}</h4>
          <h4>Description: {story.summary || "No Description"}</h4>
          <p>
            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="10"
              />
            ) : (
              story.content || "No Content"
            )}
          </p>

          {canEdit && (
            isEditing ? (
              <button onClick={handleSave}>Save</button>
            ) : (
              <button onClick={() => setIsEditing(true)}>Edit</button>
            )
          )}
          
          <h2 onClick={toggleComments} style={{ cursor: 'pointer', color: 'blue' }}>
            {isCommentsOpen ? 'Hide Comments' : `Show Comments (${comments.length})`}
          </h2>
          {isCommentsOpen && (
            <div className="commentsection">
              {comments.length > 0 ? (
                <ul>
                  {comments.map((comment) => (
                    <li key={comment.commentId}>
                      <strong>{comment.user.username || "Unknown Author"}</strong>: {comment.content || "No Comment Text"}
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
}

