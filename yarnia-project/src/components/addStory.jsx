import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../API"; // Assuming this function sends authenticated requests

const AddStory = () => {
  const [title, setTitle] = useState(""); // State for story title
  const [summary, setSummary] = useState(""); // State for story summary
  const [content, setContent] = useState(""); // State for story content
  const [error, setError] = useState(null); // State to handle errors
  const navigate = useNavigate();

  // Function to handle form submission and create a new story
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form from submitting the default way

    // Validate input fields
    if (!title || !content) {
      setError("Title and content are required.");
      return;
    }

    try {
      // Make a POST request to create a new story
      const response = await fetchWithAuth(
        "http://localhost:3000/api/stories", // Assuming this is your API endpoint
        {
          method: "POST", // POST for creating a new story
          body: {
            title, // Title should not be empty
            summary, // Optional
            content, // Content should not be empty
          },
        }
      );

      if (response.ok) {
        // Redirect the user to the profile or stories page after successful story creation
        navigate("/profile");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create story.");
      }
    } catch (error) {
      console.error("Error creating story:", error);
      setError("An error occurred while creating the story.");
    }
  };

  return (
    <div className="add-story-container">
      <h1>Create a New Story</h1>
      {error && <p className="error-message">{error}</p>}{" "}
      {/* Show error if exists */}
      <form onSubmit={handleSubmit} className="add-story-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)} // Update title state
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="summary">Summary</label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)} // Update summary state
            placeholder="Write a short summary (optional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)} // Update content state
            required
            rows="10"
          />
        </div>

        <button type="submit" className="button submit-button">
          Submit Story
        </button>
      </form>
    </div>
  );
};

export default AddStory;
