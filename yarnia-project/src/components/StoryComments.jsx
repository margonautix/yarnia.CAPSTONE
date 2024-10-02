import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchStoryComments } from "../API"; // Assuming you have this function defined in your API module.

const StoryComments = () => {
  const { storyId } = useParams(); // Get storyId from URL params
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 10;

  useEffect(() => {
    const getComments = async () => {
      try {
        const response = await fetchStoryComments(storyId); // Fetch comments from the API
        setComments(response);
      } catch (err) {
        setError("Failed to load comments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getComments();
  }, [storyId]);

  // Calculate the number of pages
  const totalPages = Math.ceil(comments.length / commentsPerPage);

  // Get comments for the current page
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPaginationControls = () => (
    <div className="pagination-controls">
      {currentPage > 1 && (
        <button onClick={() => handlePageChange(currentPage - 1)}>
          Previous
        </button>
      )}
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index + 1}
          onClick={() => handlePageChange(index + 1)}
          className={currentPage === index + 1 ? "active" : ""}
        >
          {index + 1}
        </button>
      ))}
      {currentPage < totalPages && (
        <button onClick={() => handlePageChange(currentPage + 1)}>Next</button>
      )}
    </div>
  );

  if (loading) {
    return <p>Loading comments...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (comments.length === 0) {
    return <p>No comments available for this story.</p>;
  }

  return (
    <div className="comments-section">
      <h2>Comments</h2>
      {renderPaginationControls()}
      <ul className="comments-list">
        {currentComments.map((comment) => (
          <li key={comment.commentId} className="comment-item">
            <div className="comment-content">
              <strong>{comment.user?.username || "Anonymous"}:</strong>
              <p>{comment.content}</p>
              <small>
                Posted on: {new Date(comment.createdAt).toLocaleDateString()}
              </small>
            </div>
          </li>
        ))}
      </ul>
      {renderPaginationControls()}
    </div>
  );
};

export default StoryComments;
