import { useEffect, useState } from "react";
import { fetchAllComments, deleteComment } from "../API";
import { Link } from "react-router-dom";
import DefaultAvatar from "./images/anonav.jpg";

export default function AdminCommentsFeed() {
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 100;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const allComments = await fetchAllComments();
        setComments(allComments);
        setFilteredComments(allComments);
      } catch (err) {
        setError("Failed to fetch comments.");
      }
    };
    fetchComments();
  }, []);

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(null, commentId);
      setComments((prev) => prev.filter((c) => c.commentId !== commentId));
      setFilteredComments((prev) => prev.filter((c) => c.commentId !== commentId));
    } catch (error) {
      setError("Failed to delete the comment.");
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredComments(
      query === ""
        ? comments
        : comments.filter(
            (comment) =>
              comment.user?.username?.toLowerCase().includes(query) ||
              comment.content?.toLowerCase().includes(query)
          )
    );
    setCurrentPage(1);
  };

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = filteredComments.slice(indexOfFirstComment, indexOfLastComment);
  const totalPages = Math.ceil(filteredComments.length / commentsPerPage);

  const getPaginationRange = () => {
    const range = [];
    const lastPage = totalPages;

    const prev = currentPage - 1;
    const next = currentPage + 1;

    range.push(1);

    if (prev > 2) {
      range.push("...");
    }

    for (let i = Math.max(2, prev); i <= Math.min(next, lastPage - 1); i++) {
      range.push(i);
    }

    if (next < lastPage - 1) {
      range.push("...");
    }

    if (lastPage > 1) {
      range.push(lastPage);
    }

    return range;
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface dark:bg-surface-dark text-primary dark:text-primary-dark px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Admin: All Comments</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Search comments..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full max-w-md px-4 py-2 rounded-md border border-border dark:border-border-dark bg-input dark:bg-input-dark text-input-text dark:text-input-text-dark mb-6"
        />

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 flex-nowrap overflow-x-auto mb-6 text-sm font-medium">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="mr-4"

            >
              《
            </button>

            {getPaginationRange().map((page, index) =>
              page === "..." ? (
                <span key={index} className="px-3 text-secondary dark:text-secondary-dark">
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-full transition-all ${
                    currentPage === page
                      ? "bg-layer dark:bg-layer-dark text-secondary dark:text-secondary-dark"
                      : "bg-mantis text-black font-semibold dark:text-white"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-4"

            >
              》
            </button>
          </div>
        )}

        <ul className="space-y-4">
          {currentComments.length > 0 ? (
            currentComments.map((comment) => (
              <li
                key={comment.commentId}
                className="bg-card dark:bg-card-dark p-4 rounded-md shadow border border-border dark:border-border-dark"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={
                      comment.user?.avatar
                        ? comment.user.avatar.startsWith("http")
                          ? comment.user.avatar
                          : `http://localhost:3000${comment.user.avatar.startsWith("/") ? "" : "/"}${comment.user.avatar}`
                        : DefaultAvatar
                    }
                    alt={`${comment.user?.username}'s avatar`}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <Link
                      to={`/users/${comment.user?.userId || comment.user?.id}`}
                      className="text-sm font-semibold text-link dark:text-link-dark hover:underline"
                    >
                      {comment.user?.username || "Unknown User"}
                    </Link>
                    <p className="mt-1 text-sm">{comment.content || "No content available."}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(comment.commentId)}
                    className="ml-4 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p className="text-secondary dark:text-secondary-dark">No comments available.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
