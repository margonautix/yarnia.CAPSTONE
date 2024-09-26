import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { fetchBookmarkedStories, removeBookmark } from "../API"; // Assuming you have these API functions

const Bookmarks = ({ user }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    console.log("HERE");
    const getBookmarks = async () => {
      try {
        const data = await fetchBookmarkedStories(user?.id, token); // Fetch bookmarks from the API
        setBookmarks(data);
      } catch (error) {
        console.error("Failed to fetch bookmarks", error);
      } finally {
        setLoading(false);
      }
    };

    getBookmarks();
  }, [user?.id, token]);

  const handleRemoveBookmark = async (storyId, userId, token, bookmarkId) => {
    try {
      await removeBookmark(storyId, userId, token, bookmarkId); // Remove bookmark from the API
      // Update the bookmarks list locally by filtering out the removed bookmark
      setBookmarks(
        bookmarks.filter((bookmark) => bookmark.storyId !== storyId)
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
  console.log("bookmarks", bookmarks);
  return (
    <div className="bookmarks-list">
      {bookmarks.map((bookmark, index) => (
        <div key={index} className="bookmark-card">
          <h2>{bookmark?.title}</h2>
          <p>
            <strong>Author:</strong> {bookmark?.story.authorId || "Unknown"}
          </p>
          <p>
            <strong>Summary:</strong>{" "}
            {bookmark?.story.summary || "No summary available"}
          </p>
          <button onClick={() => handleViewStory(bookmark?.storyId)}>
            View Story
          </button>
          <button
            onClick={() =>
              handleRemoveBookmark(
                bookmark?.storyId,
                bookmark?.userId,
                token,
                bookmark?.bookmarkId
              )
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
