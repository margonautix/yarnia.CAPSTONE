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
  const [showPopup, setShowPopup] = useState(false); // To control pop-up visibility
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

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form refresh

    try {
      // Send POST request directly within handleSubmit
      const response = await fetch("http://localhost:3000/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // If using tokens
        },
        body: JSON.stringify({
          title,
          summary,
          content,
          genre,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add story");
      }

      const result = await response.json();

      console.log("Story added successfully:", result);

      // Story added successfully, navigate to home page
      navigate(`/stories/${result.storyId}`);
    } catch (error) {
      console.error("Failed to add the story:", error);
      setError("Failed to add the story.");
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
                  [{ header: "1" }, { header: "2" }, { font: [] }], // Headers and font styles
                  [{ size: [] }], // Font sizes
                  ["bold", "italic", "underline", "strike", "blockquote"], // Formatting options
                  [
                    { list: "ordered" },
                    { list: "bullet" },
                    { indent: "-1" },
                    { indent: "+1" },
                  ], // Lists and indentation
                  [{ align: "justify" }], // Alignment options
                  ["clean"], // Clear formatting
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
                "align", // Add text alignment formats
              ]}
              placeholder="Write your story here..."
              required
              style={{ height: "500px" }} // Adjust the height as needed
            />
          </div>
          <br />
          <br />
          <button type="submit" className="submit-button">
            Submit Story
          </button>{" "}
        </form>{" "}
      </div>
    </>
  );
};

export default AddStory;
