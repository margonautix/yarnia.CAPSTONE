import { useEffect, useState } from "react";
import { fetchAllComments, deleteComment } from "../API"; // Adjust the path to your API file

export default function AdminCommentsFeed() {
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const itemsPerPage = 80; // Number of comments per page

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
  };

  // Calculate the current comments to display based on pagination
  const indexOfLastComment = currentPage * itemsPerPage;
  const indexOfFirstComment = indexOfLastComment - itemsPerPage;
  const currentComments = filteredComments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredComments.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

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
      <div className="pagination">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={number === currentPage ? "active-page" : ""}
          >
            {number}
          </button>
        ))}
      </div>
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
