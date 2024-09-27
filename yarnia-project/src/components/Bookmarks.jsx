import { useEffect, useState } from "react";
import { fetchBookmarkedStories, removeBookmark } from "../API";
import { useNavigate } from "react-router-dom";

const Bookmarks = ({ user }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  console.log("testing");

  useEffect(() => {
    console.log("Bookmarks data:", bookmarks); // Add this to check the structure of the bookmarks
  }, [bookmarks]);

  useEffect(() => {
    const getBookmarks = async () => {
      try {
        const data = await fetchBookmarkedStories(user.id, token); // Fetch bookmarks from the API
        setBookmarks(data);
      } catch (error) {
        console.error("Failed to fetch bookmarks", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      getBookmarks();
    }
  }, [user?.id, token]); // Add user.id and token as dependencies

  const handleRemoveBookmark = async (storyId, bookmarkId) => {
    console.log(
      "Deleting bookmark with storyId:",
      storyId,
      "and bookmarkId:",
      bookmarkId
    );
    try {
      await removeBookmark(storyId, user.id, token, bookmarkId);
      // Update the bookmarks list locally by filtering out the removed bookmark
      setBookmarks(
        bookmarks.filter((bookmark) => bookmark.bookmarkId !== bookmarkId)
      );
    } catch (error) {
      console.error("Failed to remove bookmark", error);
    }
  };

  const handleViewStory = (storyId) => {
    navigate(`/stories/${storyId}`); // Navigate to the story details page
  };

  if (loading) {
    return <p>Loading bookmarks...</p>;
  }

  if (bookmarks.length === 0) {
    return (
      <p>You have no bookmarks yet. Start saving your favorite stories!</p>
    );
  }

  return (
    <div className="bookmarks-list">
      {bookmarks.map((bookmark) => (
        <div key={bookmark.storyId} className="bookmark-card">
          <h2>{bookmark.story.title}</h2>
          <p>
            <strong>Author:</strong>{" "}
            {bookmark.story.author?.username || "Unknown"}{" "}
            {/* Display author's username */}
          </p>
          <p>
            <strong>Summary:</strong>{" "}
            {bookmark.story.summary || "No summary available"}
          </p>
          <button onClick={() => handleViewStory(bookmark?.storyId)}>
            View Story
          </button>
          <button
            onClick={() =>
              handleRemoveBookmark(bookmark.storyId, bookmark.bookmarkId)
            }
          >
            Remove Bookmark
          </button>
        </div>
      ))}
    </div>
  );
};

export default Bookmarks;
