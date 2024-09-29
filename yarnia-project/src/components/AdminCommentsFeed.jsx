import { useEffect, useState } from "react";
import { fetchAllComments, deleteComment } from "../API"; // Adjust the path to your API file

export default function AdminCommentsFeed() {
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 100;

  // Fetch all comments when the component mounts
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const allComments = await fetchAllComments();
        console.log(allComments); // Log comments to verify structure
        setComments(allComments);
        setFilteredComments(allComments);
      } catch (err) {
        setError("Failed to fetch comments.");
      }
    };

    fetchComments();
  }, []);

  // Handle delete action for comments
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(null, commentId); // `null` for storyId, only passing commentId
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.commentId !== commentId)
      );
      setFilteredComments((prevComments) =>
        prevComments.filter((comment) => comment.commentId !== commentId)
      );
    } catch (error) {
      console.error("Failed to delete the comment:", error);
      setError("Failed to delete the comment.");
    }
  };

  // Handle search bar input changes
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredComments(comments);
    } else {
      setFilteredComments(
        comments.filter(
          (comment) =>
            comment.user?.username?.toLowerCase().includes(query) ||
            comment.content?.toLowerCase().includes(query)
        )
      );
    }
    setCurrentPage(1); // Reset to the first page whenever the search changes
  };

  // Pagination logic
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = filteredComments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );
  const totalPages = Math.ceil(filteredComments.length / commentsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="admin-comments-container">
      <h2>All Comments</h2>
      {error && <p className="error">{error}</p>}
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search comments..."
        value={searchQuery}
        onChange={handleSearch}
        className="search-bar"
      />
      <br />
      <br />
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;

            // Determine whether to show the page button
            if (
              pageNumber === currentPage ||
              (pageNumber >= currentPage - 2 &&
                pageNumber <= currentPage + 2) ||
              pageNumber === 1 || // Optionally, show the first page
              pageNumber === totalPages // Optionally, show the last page
            ) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`pagination-button ${
                    currentPage === pageNumber ? "active-page" : ""
                  }`}
                >
                  {pageNumber}
                </button>
              );
            }

            return null;
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
      <ul className="comments-list">
        {currentComments.length > 0 ? (
          currentComments.map((comment) => (
            <li key={comment.commentId} className="comment-item">
              <div className="comment-content">
                {/* Placeholder Avatar with Initials */}
                <div className="comment-avatar">
                  {comment.user?.username
                    ? comment.user.username.charAt(0).toUpperCase()
                    : "U"}
                </div>
                {/* Comment Details Section */}
                <div className="comment-details">
                  <span className="comment-username">
                    {comment.user?.username || "Unknown User"}
                  </span>
                  <p className="comment-text">
                    {comment.content || "No content available"}
                  </p>
                </div>
              </div>
              {/* Delete Button */}
              <button
                onClick={() => handleDeleteComment(comment.commentId)}
                className="delete-button"
              >
                Delete
              </button>
            </li>
          ))
        ) : (
          <p>No comments available.</p>
        )}
      </ul>
    </div>
  );
}
