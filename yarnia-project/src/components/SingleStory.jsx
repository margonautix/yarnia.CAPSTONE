import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  fetchSingleStory,
  updateStoryContent,
  bookmarkStory,
  deleteStory, 
  fetchComments,
  postComment,
  checkBookmarkStatus,
  deleteComment, 
} from "../API"; 
import jwt_decode from "jwt-decode"; 
import DOMPurify from "dompurify"; 
import ReactQuill from "react-quill"; 
import "react-quill/dist/quill.snow.css"; 

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
      const storyResponse = await fetchSingleStory(storyId); 
      if (storyResponse) {
        setStory(storyResponse); // Set the story state
        setContent(storyResponse.content); // Set the content for editing
        setTitle(storyResponse.title); // Set the title for editing
        setSummary(storyResponse.summary); // Set the summary for editing

        // Fetch the comments related to the story
        const commentsResponse = await fetchComments(storyId); 
        if (commentsResponse) {
          setComments(commentsResponse); 
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
      if (!token || !currentUser) return; 

      const { id } = jwt_decode(token); 
      const response = await checkBookmarkStatus(id, storyId);
      if (response.bookmarked) {
        setBookmarked(true); 
      }
    } catch (error) {
      console.error("Failed to check bookmark status:", error);
    }
  };

  useEffect(() => {
    if (storyId) {
      fetchStoryAndComments(storyId);
    } else {
      setError("No story ID provided.");
    }

    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwt_decode(token);
      setCurrentUser(decoded);
    }
  }, [storyId]);

  useEffect(() => {
    fetchBookmarkStatus(); 
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
        setIsEditing(false); 
        fetchStoryAndComments(storyId); 
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
        await deleteStory(storyId); 
        alert("Story deleted successfully!");
        navigate("/"); 
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
    if (!confirmDelete) return; 

    try {
      await deleteComment(storyId, commentId); 

      setComments((prevComments) =>
        prevComments.filter((comment) => comment.commentId !== commentId)
      );

      alert("Comment deleted successfully!"); 
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
    const token = localStorage.getItem("token"); 
    try {
      await bookmarkStory(storyId, currentUser.id, token); 
      setBookmarked(true); 
    } catch (error) {
      setError("Error occurred while bookmarking the story.");
    }
  };

  // Toggle the comments dropdown
  const toggleComments = () => {
    setIsCommentsOpen(!isCommentsOpen); 
  };

  // Handle new comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment) return;

    try {
      await postComment(storyId, newComment); 
      setNewComment(""); 
      fetchStoryAndComments(storyId); 
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

                    <Link to="/profile">{comment.user.username}</Link>
                  ) : (

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

          <h2>{story?.title || "No Title"}</h2>
          <h4>
            Author:{" "}
            {story?.author?.username ? (
              <Link to={`/users/${story.authorId}`}>
                {story.author.username}
              </Link>
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
