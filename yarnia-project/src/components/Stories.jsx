import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import navigate from react-router-dom
import { fetchAllStories, fetchSingleStory } from "../API"; // Assuming you have this fetch function

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null); // For storing the currently selected story
  const [showModal, setShowModal] = useState(false); // For modal visibility
  const [searchQuery, setSearchQuery] = useState(""); // For the search query

  const navigate = useNavigate(); // Initialize the navigate function

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await fetchAllStories();
        setStories(data);
      } catch (error) {
        console.error("Failed to fetch stories", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const handleReadMore = async (storyId) => {
    try {
      console.log(`Fetching story with ID: ${storyId}`); // Log the storyId
      const fullStory = await fetchSingleStory(storyId);
      setSelectedStory(fullStory);
      setShowModal(true);
    } catch (error) {
      console.error("Failed to load full story:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false); // Hide the modal
  };

  const filteredStories = stories.filter(
    (story) =>
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (story.author?.username || "Unknown")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <p>Loading stories...</p>;
  }

  if (stories.length === 0) {
    return <p>No stories available.</p>;
  }

  return (
    <div className="stories-list">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by title or author"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-bar"
      />

      {filteredStories.length > 0 ? (
        filteredStories.map((story) => (
          <div key={story.storyId} className="story-card">
            <h2>{story.title}</h2>
            <p>
              <strong>Author:</strong> {story.author?.username || "Unknown"}
            </p>
            <p>
              <strong>Published On:</strong>{" "}
              {new Date(story.createdAt).toLocaleDateString()}
            </p>
            <button onClick={() => handleReadMore(story.storyId)}>
              Read More
            </button>
          </div>
        ))
      ) : (
        <p>No stories match your search.</p>
      )}

      {/* Modal inside Stories */}
      {showModal && selectedStory && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <button id="X" onClick={closeModal}>
              X
            </button>
            <h2>{selectedStory.title}</h2>
            <p>
              <strong>Author:</strong>{" "}
              {selectedStory.author?.username || "Unknown"}
            </p>
            <p>
              <strong>Published On:</strong>{" "}
              {new Date(selectedStory.createdAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Summary:</strong> {selectedStory.summary}
            </p>
            <button
              onClick={() => navigate(`/stories/${selectedStory.storyId}`)}
            >
              View Story
            </button>{" "}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;
