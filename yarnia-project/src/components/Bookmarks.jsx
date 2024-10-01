import { useEffect, useState } from "react";
import { fetchBookmarkedStories, removeBookmark } from "../API";
import { useNavigate } from "react-router-dom";

const Bookmarks = ({ user }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
  }, [bookmarks]);

  useEffect(() => {
    const getBookmarks = async () => {
      try {
        const data = await fetchBookmarkedStories(user.id, token); 
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
  }, [user?.id, token]); 

  const handleRemoveBookmark = async (storyId, bookmarkId) => {
    try {
      await removeBookmark(storyId, user.id, token, bookmarkId);
      setBookmarks(
        bookmarks.filter((bookmark) => bookmark.bookmarkId !== bookmarkId)
      );
    } catch (error) {
      console.error("Failed to remove bookmark", error);
    }
  };

  const handleViewStory = (storyId) => {
    navigate(`/stories/${storyId}`); 
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

          </p>
          <p>
            <strong>Summary:</strong>{" "}
            {bookmark.story.summary || "No summary available"}
          </p>
          <div class="button-container">
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
        </div>
      ))}
    </div>
  );
};

export default Bookmarks;
