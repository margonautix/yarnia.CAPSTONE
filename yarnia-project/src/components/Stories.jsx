import React, { useEffect, useState } from "react";
import { fetchAllStories, fetchSingleStory } from "../API"; // Assuming you have this fetch function

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null); // For storing the currently selected story
  const [showModal, setShowModal] = useState(false); // For modal visibility

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
      const fullStory = await fetchSingleStory(storyId); // Make another API call if needed
      setSelectedStory(fullStory); // Set the full story as the selected story
      setShowModal(true); // Show the modal
    } catch (error) {
      console.error("Failed to load full story:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false); // Hide the modal
  };

  if (loading) {
    return <p>Loading stories...</p>;
  }

  if (stories.length === 0) {
    return <p>No stories available.</p>;
  }

  return (
    <div className="stories-list">
      {stories.map((story) => (
        <div key={story.storyId} className="story-card">
          <h2>{story.title}</h2>
          <p>
            <strong>Author:</strong> {story.author?.username || "Unknown"}
          </p>
          <p>
            <strong>Published On:</strong>{" "}
            {new Date(story.createdAt).toLocaleDateString()}
          </p>
          <p>
            <strong>Summary:</strong> {story.summary || "No summary available"}
          </p>
          <button onClick={() => handleReadMore(story.storyId)}>
            Read More
          </button>{" "}
          {/* Pass storyId */}
        </div>
      ))}

      {/* Modal inside Stories */}
      {showModal && selectedStory && (
        <div className="modal-backdrop">
          <div className="modal-content">
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
            <p>
              <strong>Content:</strong> {selectedStory.content}
            </p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;
