import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom"; // Removed useNavigate, using Link for navigation
import React from "react";
import { fetchAllStories } from "../api";

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  useEffect(() => {
    async function getAllStories() {
      try {
        const response = await fetchAllStories();
        console.log(response); // Debug to check story data structure
        setStories(response);
      } catch (error) {
        console.error("Error fetching stories:", error);
        setError("Failed to load stories.");
      }
    }
    getAllStories();
  }, []);

  const filteredStories = stories.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchParams({ search: value });
  };

  return (
    <div>
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search stories..."
        value={searchTerm}
        onChange={handleSearch}
      />

      <div className="stories-container">
        {error && <p>{error}</p>}

        {filteredStories.map((story) => (
          <div key={story.id} className="story-card">
            <h2>{story.title}</h2>
            {story.author ? (
              <p>
                <strong>Author:</strong> {story.author.username}
              </p>
            ) : (
              <p>
                <strong>Author:</strong> Unknown
              </p>
            )}
            <p>
              <strong>Summary:</strong>{" "}
              {story.summary || "No summary available."}
            </p>
            <p>
              <strong>Content Preview:</strong> {story.content?.slice(0, 50)}...
            </p>

            {/* "See Single Story" Button - now using Link */}
            <Link to={`/stories/${story.id}`}>
              <button>See Single Story</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stories;
