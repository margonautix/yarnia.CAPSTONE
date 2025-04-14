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
import DOMPurify from "dompurify"; // Import DOMPurify for sanitizing HTML
import ReactQuill from "react-quill"; // Import ReactQuill
import "react-quill/dist/quill.snow.css"; // Import the CSS for the editor

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
      const storyResponse = await fetchSingleStory(storyId); // Fetch the story
      if (storyResponse) {
        setStory(storyResponse); // Set the story state
        setContent(storyResponse.content); // Set the content for editing
        setTitle(storyResponse.title); // Set the title for editing
        setSummary(storyResponse.summary); // Set the summary for editing

        // Fetch the comments related to the story
        const commentsResponse = await fetchComments(storyId);
        if (commentsResponse) {
          setComments(commentsResponse); // Set the comments state
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
      if (!token || !currentUser) return; // If no token or user is not logged in, skip

      const { id } = jwt_decode(token); // Decode token to get user ID
      const response = await checkBookmarkStatus(id, storyId); // Check if the user has bookmarked this story
      if (response.bookmarked) {
        setBookmarked(true); // Update bookmark status
      }
    } catch (error) {
      console.error("Failed to check bookmark status:", error);
    }
  };

  // Fetch story, user data, and bookmark status when the component mounts or when storyId changes
  useEffect(() => {
    if (storyId) {
      fetchStoryAndComments(storyId);
    } else {
      setError("No story ID provided.");
    }

    // Decode JWT and set the current user
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwt_decode(token); // Decode the token to get user info
      setCurrentUser(decoded);
    }
  }, [storyId]);

  useEffect(() => {
    fetchBookmarkStatus(); // Check bookmark status
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
        setIsEditing(false); // Exit editing mode after saving
        fetchStoryAndComments(storyId); // Refresh the story data
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
        await deleteStory(storyId); // Call the deleteStory function
        alert("Story deleted successfully!");
        navigate("/"); // Navigate back to the home page after deletion
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
    if (!confirmDelete) return; // If the user cancels, exit the function

    try {
      await deleteComment(storyId, commentId); // Call the API to delete the comment

      // Update the comments state by removing the deleted comment
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
    const token = localStorage.getItem("token"); // Get the token
    try {
      await bookmarkStory(storyId, currentUser.id, token); // Pass the token
      setBookmarked(true); // Update bookmark status
    } catch (error) {
      setError("Error occurred while bookmarking the story.");
    }
  };

  // Toggle the comments dropdown
  const toggleComments = () => {
    setIsCommentsOpen(!isCommentsOpen);

    // Handle new comment submission
    const handleSubmitComment = async (e) => {
      e.preventDefault();
      if (!newComment) return;

      try {
        await postComment(storyId, newComment); // Post the new comment to the API
        setNewComment(""); // Clear the comment input
        fetchStoryAndComments(storyId); // Refresh the comments
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
                      // Link to the current user's profile
                      <Link to="/profile">{comment.user.username}</Link>
                    ) : (
                      // Link to other users' profiles
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
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden sticky top-2 z-40 px-4">
          <div className="relative w-full">
            <div className="lg:hidden flex justify-end sticky top-2 z-40">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-xl p-2 rounded-full bg-dusty_fern text-birch_parchment hover:bg-fresh_sage transition"
                aria-label="Toggle genre filter"
              >
                📓
              </button>
            </div>
    
            {showSidebar && (
              <div className="absolute left-0 mt-2 w-full
                bg-worn_page text-ink_brown
                dark:bg-dark_olive dark:text-birch_parchment
                md:bg-library_leather md:text-ink_brown 
                md:dark:bg-worn_oak md:dark:text-birch_parchment
                p-4 rounded shadow z-50 max-h-[70vh] overflow-y-auto"
              >
                <h2 className="font-semibold text-lg mb-2 text-antique_gold dark:text-warm_brass">Genres</h2>
                <ul className="space-y-1">
                  <li
                    onClick={() => handleCategorySelect("")}
                    className={`cursor-pointer hover:text-fresh_sage ${
                      selectedCategory === "" ? "font-bold text-dusty_rose" : ""
                    }`}
                  >
                    All
                  </li>
                  {genres.map((genre, index) => (
                    <li
                      key={index}
                      onClick={() => handleCategorySelect(genre)}
                      className={`cursor-pointer hover:text-fresh_sage ${
                        selectedCategory === genre ? "font-bold text-dusty_rose" : ""
                      }`}
                    >
                      {genre}
                    </li>
                  ))}
                </ul>
                <input
                  type="text"
                  placeholder="Search by title or author"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-4 w-full px-3 py-2 rounded bg-linen_moss dark:bg-deep_grove text-ink_brown dark:text-birch_parchment placeholder:text-ink_brown dark:placeholder:text-dry_grass"
                />
              </div>
            )}
          </div>
        </div>
    
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block sticky top-6 self-start w-64 bg-worn_page dark:bg-dark_olive text-ink_brown dark:text-birch_parchment p-4 rounded shadow max-h-[90vh] overflow-y-auto">
          <h2 className="font-semibold text-lg mb-2 text-antique_gold dark:text-warm_brass">Genres</h2>
          <ul className="space-y-1">
            <li
              onClick={() => handleCategorySelect("")}
              className={`cursor-pointer hover:text-fresh_sage ${
                selectedCategory === "" ? "font-bold text-dusty_rose" : ""
              }`}
            >
              All
            </li>
            {genres.map((genre, index) => (
              <li
                key={index}
                onClick={() => handleCategorySelect(genre)}
                className={`cursor-pointer hover:text-fresh_sage ${
                  selectedCategory === genre ? "font-bold text-dusty_rose" : ""
                }`}
              >
                {genre}
              </li>
            ))}
          </ul>
          <input
            type="text"
            placeholder="Search by title or author"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-4 w-full px-3 py-2 rounded bg-linen_moss dark:bg-deep_grove text-ink_brown dark:text-birch_parchment placeholder:text-ink_brown dark:placeholder:text-dry_grass"
          />
        </aside>
    
        {/* Story Feed */}
        <section className="flex-1 space-y-6">
          {showModal && selectedStory && (
            <div className="fixed inset-0 bg-night_bark bg-opacity-70 flex justify-center items-center z-50">
              <div className="bg-linen_moss dark:bg-dark_olive text-ink_brown dark:text-birch_parchment p-6 rounded-lg shadow-xl max-w-2xl w-full">
                <button onClick={closeModal} className="text-right block ml-auto mb-4 text-xl hover:text-antique_gold">✕</button>
                <h2 className="text-2xl font-bold mb-4 text-ink_brown dark:text-warm_brass tracking-wide border-b-2 border-worn_oak dark:border-antique_gold pb-1 w-fit">
                  {selectedStory.title}
                </h2>
                <p className="text-sm mb-1">Author: {selectedStory.author?.username || "Unknown Author"}</p>
                <p className="text-sm mb-1">Published: {new Date(selectedStory.createdAt).toLocaleDateString()}</p>
                <p className="text-sm mb-3">Genre: {selectedStory.genre}</p>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedStory.content.slice(0, 500) }} />
                <button
                  className="mt-4 bg-dusty_fern hover:bg-fresh_sage text-white px-4 py-2 rounded shadow"
                  onClick={() => navigate(`/stories/${selectedStory.storyId}`)}
                >
                  View Story
                </button>
              </div>
            </div>
          )}
    
          {currentStories.length > 0 ? (
            currentStories.map((story) => (
              <div key={story.storyId} className="bg-worn_page dark:bg-worn_oak p-6 rounded shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-ink_brown dark:text-warm_brass tracking-wide border-b-2 border-worn_oak dark:border-antique_gold pb-1 w-fit">
                      {story.title}
                    </h2>
                    <p className="text-sm text-muted_indigo dark:text-dry_grass">
                      by {story.author?.username || "Unknown Author"} · {new Date(story.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-sm text-ink_brown dark:text-birch_parchment"><strong>Genre:</strong> {story.genre}</p>
                    <p className="mt-1 text-sm text-ink_brown dark:text-birch_parchment"><strong>Summary:</strong> {story.summary}</p>
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-xs text-dry_grass text-center">🔖 {story._count?.bookmarks || 0}</span>
                    <Link to={`/stories/${story.storyId}/comments`} className="text-xs text-dry_grass text-center hover:text-fresh_sage">
                      💬 {story._count?.comments || 0}
                    </Link>
                  </div>
                </div>
                <button
                  onClick={() => handleReadMore(story.storyId)}
                  className="mt-4 text-sm bg-dusty_fern hover:bg-fresh_sage text-white px-4 py-2 rounded"
                >
                  Read More
                </button>
              </div>
            ))
          ) : (
            <p className="text-muted_indigo">No stories match your search.</p>
          )}
    
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-linen_moss dark:bg-dark_olive text-sm rounded hover:bg-antique_gold"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === currentPage ||
                  (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === pageNumber
                          ? "bg-dusty_fern text-white"
                          : "bg-linen_moss dark:bg-dark_olive hover:bg-antique_gold"
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
                className="px-3 py-1 bg-linen_moss dark:bg-dark_olive text-sm rounded hover:bg-antique_gold"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    );
    
  };
}
