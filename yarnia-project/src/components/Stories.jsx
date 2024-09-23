import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAllStories, fetchSingleStory } from "../API"; // Assuming you have this fetch function

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null); // For the selected story
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Sidebar dropdown

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

  // Filter and sort stories based on search query
  const filteredStories = stories
    .filter(
      (story) =>
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (story.author?.username || "Unknown")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Categories for the sidebar
  const categories = [
    { name: "Fiction", path: "/search?category=Fiction" },
    { name: "Non-fiction", path: "/search?category=Non-fiction" },
    { name: "Sci-Fi", path: "/search?category=Sci-Fi" },
    { name: "Fantasy", path: "/search?category=Fantasy" },
    { name: "Mystery", path: "/search?category=Mystery" },
    { name: "Horror", path: "/search?category=Horror" },
  ];

  // Toggle dropdown menu
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

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
          <h2 onClick={toggleDropdown} className="sidebar-toggle">
            {isDropdownOpen ? "Categories" : "Categories"}
          </h2>

          {isDropdownOpen && (
            <ul className="sidebar-menu">
              {categories.map((category, index) => (
                <li key={index}>
                  <Link to={category.path} onClick={toggleDropdown}>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}

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
