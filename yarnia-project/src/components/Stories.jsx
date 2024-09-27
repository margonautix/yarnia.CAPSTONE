import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAllStories, fetchSingleStory } from "../API"; // Assuming you have this fetch function

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null); // For the selected story
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [selectedCategory, setSelectedCategory] = useState(""); // Selected genre filter

  const navigate = useNavigate();

  // Fetch all stories on component mount
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

  // Handle full story modal opening
  const handleReadMore = async (storyId) => {
    try {
      const fullStory = await fetchSingleStory(storyId);
      setSelectedStory(fullStory);
      setShowModal(true);
    } catch (error) {
      console.error("Failed to load full story:", error);
    }
  };

  // Close the modal
  const closeModal = () => setShowModal(false);

  // Filter and sort stories based on search query and selected genre (category)
  const filteredStories = stories
    .filter((story) => {
      const matchesSearchQuery =
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (story.author?.username || "Unknown")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || story.genre === selectedCategory;
      return matchesSearchQuery && matchesCategory;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Categories (Genres) for the sidebar
  const genres = [
    "Fantasy",
    "Science Fiction",
    "Romance",
    "Thriller",
    "Horror",
    "Mystery",
    "Drama",
    "Comedy",
  ];

  // Handle category selection for filtering stories by genre
  const handleCategorySelect = (genre) => {
    setSelectedCategory(genre);
  };

  // Conditional rendering for loading state
  if (loading) {
    return <p>Loading stories...</p>;
  }

  if (stories.length === 0) {
    return <p>No stories available.</p>;
  }

  return (
    <div className="stories-page">
      <div id="search">
        {/* Sidebar for Categories and Search */}
        <aside className="sidebar">
          <h2>Genres</h2>

          <ul className="sidebar-menu">
            <li
              onClick={() => handleCategorySelect("")}
              className={selectedCategory === "" ? "active" : ""}
            >
              All
            </li>
            {genres.map((genre, index) => (
              <li
                key={index}
                onClick={() => handleCategorySelect(genre)}
                className={selectedCategory === genre ? "active" : ""}
              >
                {genre}
              </li>
            ))}
          </ul>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by title or author"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar"
          />
        </aside>
      </div>

      {/* Main Story Content */}
      <div className="stories-list">
        {filteredStories.length > 0 ? (
          filteredStories.map((story) => (
            <div key={story.storyId} className="story-card">
              <h2>{story.title}</h2>
              <p>
                <strong>Author:</strong>{" "}
                {story?.author?.username ? (
                  <Link to={`/users/${story.authorId}`}>
                    {story.author.username}
                  </Link>
                ) : (
                  "Unknown Author"
                )}
              </p>
              <p>
                <strong>Published On:</strong>{" "}
                {new Date(story.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Genre:</strong> {story.genre}
              </p>
              <button onClick={() => handleReadMore(story.storyId)}>
                Read More
              </button>
            </div>
          ))
        ) : (
          <p>No stories match your search.</p>
        )}

        {/* Modal for Story Details */}
        {showModal && selectedStory && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <button id="X" onClick={closeModal}>
                X
              </button>
              <h2>{selectedStory.title}</h2>
              <p>
                <strong>Author:</strong>{" "}
                {selectedStory.author?.username || "Unknown Author"}
              </p>
              <p>
                <strong>Published On:</strong>{" "}
                {new Date(selectedStory.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Summary:</strong> {selectedStory.summary}
              </p>
              <p>
                <strong>Genre:</strong> {selectedStory.genre}
              </p>
              <button
                onClick={() => navigate(`/stories/${selectedStory.storyId}`)}
              >
                View Story
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stories;
