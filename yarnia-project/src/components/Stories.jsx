import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAllStories, fetchSingleStory } from "../API";
import catGif from "./images/Yarnia.gif";
import React from "react";
import "react-quill/dist/quill.snow.css";

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const storiesPerPage = 10;

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

  const totalPages = Math.ceil(filteredStories.length / storiesPerPage);
  const indexOfLastStory = currentPage * storiesPerPage;
  const indexOfFirstStory = indexOfLastStory - storiesPerPage;
  const currentStories = filteredStories.slice(
    indexOfFirstStory,
    indexOfLastStory
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

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
    setCurrentPage(1);
  };

  if (loading) {
    return <p>Loading stories...</p>;
  }

  if (stories.length === 0) {
    return <p>No stories available.</p>;
  }

  return (
    <div className="stories-page">
      <div id="search">
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
          <div id="searchbar">
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search by title or author"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar"
            />
          </div>
          <br />
          <br />
          <img src={catGif} alt="Harlee" className="gif" />
        </aside>
      </div>

      <div className="stories-list">
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
                <strong>Genre:</strong> {selectedStory.genre}
              </p>
              <p>
                <strong>Excerpt:</strong>
              </p>
              <div
                className="story-content"
                dangerouslySetInnerHTML={{
                  __html: selectedStory.content.slice(0, 500),
                }}
              ></div>

              <button
                onClick={() => navigate(`/stories/${selectedStory.storyId}`)}
              >
                View Story
              </button>
            </div>
          </div>
        )}
        <div className="pagination">
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;

                if (
                  pageNumber === currentPage ||
                  (pageNumber >= currentPage - 2 &&
                    pageNumber <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`pagination-button ${
                        currentPage === pageNumber ? "active" : ""
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
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </div>
        {currentStories.length > 0 ? (
          currentStories.map((story) => (
            <div key={story.storyId} className="story-card">
              <div className="story-card-counts">
                <span className="bookmark-count">
                  {story._count?.bookmarks || 0}
                </span>
                <Link to={`/stories/${story.storyId}/comments`}>
                  <span className="comment-count">
                    {story._count?.comments || 0}
                  </span>
                </Link>
              </div>
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
              <p>
                <strong>Summary:</strong> {story.summary}
              </p>
              <button onClick={() => handleReadMore(story.storyId)}>
                Read More
              </button>
            </div>
          ))
        ) : (
          <p>No stories match your search.</p>
        )}

        <div className="pagination">
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === currentPage ||
                  (pageNumber >= currentPage - 2 &&
                    pageNumber <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`pagination-button ${
                        currentPage === pageNumber ? "active" : ""
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
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stories;
