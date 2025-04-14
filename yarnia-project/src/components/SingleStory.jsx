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
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <article className="bg-pearl dark:bg-night_bark text-ink_brown dark:text-birch_parchment rounded-2xl shadow-md p-8 space-y-6 leading-relaxed transition-colors duration-300">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-bold bg-transparent border-b border-satin_sheen_gold pb-2 focus:outline-none"
          />
        ) : (
          <h1 className="text-4xl font-bold tracking-tight border-b border-worn_oak pb-2">
            {story?.title || "Untitled Story"}
          </h1>
        )}

        <div className="flex flex-wrap items-center justify-between text-sm text-dry_grass dark:text-forest_green">
          <div>
            By {story?.author?.username && story?.authorId ? (
              <button
                onClick={() => handleNavigateToUser(story.authorId)}
                className="font-medium text-ink_brown dark:text-birch_parchment underline hover:text-fresh_sage"
              >
                {story.author.username}
              </button>
            ) : (
              "Anonymous"
            )} · {new Date(story?.createdAt).toLocaleDateString()}
          </div>
          <div className="italic">Genre: {story?.genre}</div>
        </div>

        {isEditing ? (
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full p-2 rounded bg-ecru dark:bg-dark_moss_green text-sm"
            placeholder="Enter a short summary..."
          />
        ) : (
          <p className="italic text-sm text-muted_indigo dark:text-dry_grass">{story?.summary}</p>
        )}

        {isEditing ? (
          <ReactQuill value={content} onChange={setContent} />
        ) : (
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(story?.content || "No content yet."),
            }}
          />
        )}

        <div className="flex flex-wrap items-center gap-3 mt-6">
          {(currentUser?.id === story?.authorId || currentUser?.isAdmin) && (
            <>
              {isEditing ? (
                <button
                  onClick={handleSaveContent}
                  className="bg-mantis hover:bg-kelly_green text-white px-4 py-2 rounded-xl text-sm shadow"
                >
                  Save Changes
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-ecru hover:bg-satin_sheen_gold text-ink_brown px-4 py-2 rounded-xl text-sm shadow"
                >
                  Edit
                </button>
              )}
              <button
                onClick={handleDeleteStory}
                className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded-xl text-sm shadow"
              >
                Delete
              </button>
            </>
          )}

          <button
            onClick={handleBookmark}
            disabled={bookmarked}
            className={`px-4 py-2 text-sm rounded-xl shadow ${
              bookmarked
                ? "bg-forest_green text-white"
                : "bg-mantis hover:bg-kelly_green text-white"
            }`}
          >
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </button>
        </div>

        <button
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          className="mt-8 text-sm underline text-warm_brass"
        >
          {isCommentsOpen ? "Hide Comments" : `Show Comments (${comments.length})`}
        </button>

        {isCommentsOpen && (
          <section className="mt-6 space-y-4 border-t border-worn_page pt-4">
            {renderComments()}

            {currentUser && (
              <form onSubmit={handleSubmitComment} className="space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your comment..."
                  required
                  className="w-full p-3 rounded-xl bg-worn_page dark:bg-dark_moss_green text-sm"
                />
                <button
                  type="submit"
                  className="bg-dusty_fern hover:bg-fresh_sage text-white px-4 py-2 rounded-xl text-sm"
                >
                  Submit Comment
                </button>
              </form>
            )}
          </section>
        )}

        {error && <p className="text-red-600">{error}</p>}
      </article>
    </div>
  );
}
