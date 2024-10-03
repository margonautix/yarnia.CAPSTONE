import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../API";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const AddStory = () => {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [genre, setGenre] = useState("");
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
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
        <form onSubmit={handleSubmit} className="add-story-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Write a short summary (optional)"
            />
          </div>
          <div className="form-group">
            <label htmlFor="genre">Genre</label>
            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
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
              onChange={setContent}
              modules={{
                toolbar: [
                  [{ header: "1" }, { header: "2" }, { font: [] }],
                  [{ size: [] }], // Font sizes
                  ["bold", "italic", "underline", "strike", "blockquote"],
                  [
                    { list: "ordered" },
                    { list: "bullet" },
                    { indent: "-1" },
                    { indent: "+1" },
                  ],
                  [{ align: "justify" }],
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
                "align",
              ]}
              placeholder="Write your story here..."
              required
              style={{ height: "500px" }}
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
