import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAllStories, fetchSingleStory } from "../API";
import catGif from "./images/Yarnia.gif";
import React from "react";
import "react-quill/dist/quill.snow.css";

const Stories = () => {
  const [showSidebar, setShowSidebar] = useState(false);
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
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden sticky top-2 z-40 px-4">
        <div className="relative w-full">
          <div className="lg:hidden flex justify-end sticky top-2 z-40;">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-xl p-2 rounded-full bg- text-white hover: transition"
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
            p-4 rounded shadow z-50 max-h-[70vh] overflow-y-auto">
          
              <h2 className="font-semibold text-lg mb-2 text-worn_page">Genres</h2>
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
  className="mt-4 w-full px-3 py-2 rounded bg-worn_page dark:bg-deep_grove text-ink_brown dark:text-white placeholder:text-ink_brown dark:placeholder:text-gray-300"
/>

            </div>
          )}
        </div>
      </div>
  
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block sticky top-6 self-start w-64 bg-library_leather dark:bg-worn_oak text-ink_brown dark:text-birch_parchment p-4 rounded shadow max-h-[90vh] overflow-y-auto">
        <h2 className="font-semibold text-lg mb-2 text-worn_page">Genres</h2>
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
  className="mt-4 w-full px-3 py-2 rounded bg-worn_page dark:bg-dark_olive text-ink_brown dark:text-white placeholder:text-ink_brown dark:placeholder:text-gray-300"
/>
      </aside>
  
      {/* Story Feed */}
      <section className="flex-1 space-y-6">
        {showModal && selectedStory && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-linen_moss dark:bg-dark_olive text-ink_brown dark:text-birch_parchment p-6 rounded-lg shadow-xl max-w-2xl w-full">
              <button onClick={closeModal} className="text-right block ml-auto mb-4 text-xl hover:text-antique_gold">✕</button>
              <h2 className="text-2xl font-bold mb-4 text-ink_brown dark:text-warm_brass tracking-wide border-b-2 border-worn_oak dark:border-antique_gold pb-1 w-fit">{selectedStory.title}</h2>
              <p className="text-sm mb-1">Author: {selectedStory.author?.username || "Unknown Author"}</p>
              <p className="text-sm mb-1">Published: {new Date(selectedStory.createdAt).toLocaleDateString()}</p>
              <p className="text-sm mb-3">Genre: {selectedStory.genre}</p>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedStory.content.slice(0, 500) }}
              />
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
            <div key={story.storyId} className="bg-linen_moss dark:bg-worn_oak p-6 rounded shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-ink_brown dark:text-warm_brass tracking-wide border-b-2 border-worn_oak dark:border-antique_gold pb-1 w-fit">{story.title}</h2>
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
              className="px-3 py-1 bg-worn_page dark:bg-dark_olive text-sm rounded hover:bg-antique_gold"
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
                        : "bg-worn_page dark:bg-dark_olive hover:bg-antique_gold"
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
              className="px-3 py-1 bg-worn_page dark:bg-dark_olive text-sm rounded hover:bg-antique_gold"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Stories;
