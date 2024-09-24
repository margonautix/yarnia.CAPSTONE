import { useEffect, useState } from "react";
import { fetchBookmarkedStories, removeBookmark } from "../API"; // Assuming you have these API functions



const Bookmarks = ({user}) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  console.log(bookmarks);
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

    getBookmarks();
  }, []);

  const handleRemoveBookmark = async (storyId) => {
    try {
      await removeBookmark(storyId); // Remove bookmark from the API
      // Update the bookmarks list locally by filtering out the removed bookmark
      setBookmarks(
        bookmarks.filter((bookmark) => bookmark.storyId !== storyId)
      );
    } catch (error) {
      console.error("Failed to remove bookmark", error);
    }
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
          <h2>{bookmark.title}</h2>
          <p>
            <strong>Author:</strong> {bookmark.story.authorId || "Unknown"}
          </p>
          <p>
            <strong>Summary:</strong>{" "}
            {bookmark.story.summary || "No summary available"}
          </p>
          <button onClick={() => alert(`Open story: ${bookmark.storyId}`)}>
            View Story
          </button>
          <button onClick={() => handleRemoveBookmark(bookmark.storyId)}>
            Remove Bookmark
          </button>
        </div>
      ))}
    </div>
  );
};

export default Bookmarks;