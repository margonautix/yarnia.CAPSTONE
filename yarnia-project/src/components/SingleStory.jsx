import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const { storyId } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [story, setStory] = useState(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [bookmarked, setBookmarked] = useState(false);

  const fetchStoryAndComments = async (storyId) => {
    try {
      const storyResponse = await fetchSingleStory(storyId);
      if (storyResponse) {
        setStory(storyResponse);
        setContent(storyResponse.content);
        setTitle(storyResponse.title);
        setSummary(storyResponse.summary);

        const commentsResponse = await fetchComments(storyId);
        if (commentsResponse) setComments(commentsResponse);
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
      if (response.bookmarked) setBookmarked(true);
    } catch (error) {
      console.error("Failed to check bookmark status:", error);
    }
  };

  useEffect(() => {
    if (storyId) {
      fetchStoryAndComments(storyId);
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

  const handleDeleteStory = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this story?");
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
    const confirmDelete = window.confirm("Delete this comment?");
    if (!confirmDelete) return;

    try {
      await deleteComment(storyId, commentId);
      setComments((prev) => prev.filter((c) => c.commentId !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
      setError("Failed to delete comment.");
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) {
      setError("You must be logged in to bookmark stories.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await bookmarkStory(storyId, currentUser.id, token);
      setBookmarked(true);
    } catch (error) {
      setError("Error occurred while bookmarking the story.");
    }
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

  const handleNavigateToUser = (userId) => {
    navigate(`/users/${userId}`);
  };

  const renderComments = () => (
    <ul className="mt-4 space-y-2">
      {comments.map((comment) => (
        <li key={comment.commentId} className="p-2 bg-worn_page dark:bg-dark_olive rounded shadow">
          <strong>
            {comment.user?.username ? (
              <button
                onClick={() => handleNavigateToUser(comment.userId)}
                className="underline hover:text-fresh_sage"
              >
                {comment.user.username}
              </button>
            ) : (
              "Unknown User"
            )}
          </strong>
          : {comment.content || "No content available"}
          {(currentUser?.id === comment.userId || currentUser?.isAdmin || currentUser?.id === story?.authorId) && (
            <button
              onClick={() => handleDeleteComment(comment.commentId)}
              className="ml-4 text-xs text-red-600 hover:underline"
            >
              Delete
            </button>
          )}
        </li>
      ))}
    </ul>
  );
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
