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
} from "../API"; // Adjust the API import path as necessary
import jwt_decode from "jwt-decode";
import DOMPurify from "dompurify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function SingleStory({ user }) {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [story, setStory] = useState(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [bookmarked, setBookmarked] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 6;

  const fetchStoryAndComments = async (storyId) => {
    try {
      const storyResponse = await fetchSingleStory(storyId);
      if (storyResponse) {
        setStory(storyResponse);
        setContent(storyResponse.content);

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

  const handleSaveContent = async () => {
    try {
      const response = await updateStoryContent(storyId, content);
      if (response) {
        setIsEditing(false);
        fetchStoryAndComments(storyId);
      }
    } catch (error) {
      console.error("Failed to update the story:", error);
      alert("Failed to update the story.");
    }
  };

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

  const toggleComments = () => {
    setIsCommentsOpen(!isCommentsOpen);
  };

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

  // Pagination controls
  const totalPages = Math.ceil(comments.length / commentsPerPage);

  const paginateComments = () => {
    const startIndex = (currentPage - 1) * commentsPerPage;
    return comments.slice(startIndex, startIndex + commentsPerPage);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderComments = () => {
    const paginatedComments = paginateComments();
    if (paginatedComments.length > 0) {
      return (
        <ul className="comments-list">
          {paginatedComments.map((comment) => (
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
            ) : (
              "Unknown Author"
            )}
          </h4>
          <h4>Description: {story?.summary || "No Description"}</h4>
          <div>
            {isEditing ? (
              <ReactQuill value={content} onChange={setContent} theme="snow" />
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
            </div>
          )}
          <button
            className="button"
            onClick={handleBookmark}
            disabled={bookmarked}
          >
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </button>
          <h2 onClick={toggleComments} className="toggle-comments-btn">
            {isCommentsOpen
              ? "Hide Comments"
              : `Show Comments (${comments.length})`}
          </h2>

          {isCommentsOpen && renderComments()}

          {isCommentsOpen && totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="button"
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="button"
              >
                Next
              </button>
            </div>
          )}

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
