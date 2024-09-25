import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../API"; // Assuming this function sends authenticated requests
import ReactQuill from "react-quill"; // Import ReactQuill component
import "react-quill/dist/quill.snow.css"; // Import styles for ReactQuill

const AddStory = () => {
  const [title, setTitle] = useState(""); // State for story title
  const [summary, setSummary] = useState(""); // State for story summary
  const [content, setContent] = useState(""); // State for story content
  const [genre, setGenre] = useState(""); // State for selected genre
  const [error, setError] = useState(null); // State to handle errors
  const navigate = useNavigate();

  // Predefined genres for the dropdown
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

  // Function to handle form submission and create a new story
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form from submitting the default way

    // Validate input fields
    if (!title || !content || !genre) {
      setError("Title, content, and genre are required.");
      return;
    }

    try {
      // Make a POST request to create a new story
      const response = await fetchWithAuth(
        "http://localhost:3000/api/stories", // Your API endpoint
        {
          method: "POST", // POST for creating a new story
          headers: {
            "Content-Type": "application/json", // Ensure the request is sent as JSON
          },
          body: JSON.stringify({
            title, // Title should not be empty
            summary, // Optional
            content, // Content should not be empty
            genre, // Genre should not be empty
          }), // Convert the body to JSON format
        }
      );

      if (response.ok) {
        const newStory = await response.json(); // Get the created story from the response

        // Redirect the user to the new story's page using the storyId
        navigate(`/stories/${newStory.storyId}`);
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
    <>
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
            <label htmlFor="genre">Genre</label>
            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)} // Update genre state
              required
            >
              <option value="">Select a genre</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <ReactQuill
              value={content}
              onChange={setContent} // Update content state using ReactQuill
              modules={{
                toolbar: [
                  [{ header: "1" }, { header: "2" }, { font: [] }],
                  [{ size: [] }],
                  ["bold", "italic", "underline", "strike", "blockquote"],
                  [
                    { list: "ordered" },
                    { list: "bullet" },
                    { indent: "-1" },
                    { indent: "+1" },
                  ],
                  ["link", "image", "video"],
                  ["clean"],
                ],
              }}
              formats={[
                "header",
                "font",
                "size",
                "bold",
                "italic",
                "underline",
                "strike",
                "blockquote",
                "list",
                "bullet",
                "indent",
                "link",
                "image",
                "video",
              ]}
              placeholder="Write your story here..."
              theme="snow" // Use the "snow" theme for styling
              required
              style={{ height: "200px" }} // Adjust the height as needed
            />
          </div>
          <button type="submit" className="submit-button">
            Submit Story
          </button>{" "}
        </form>{" "}
      </div>
    </>
  );
};

export default AddStory;
