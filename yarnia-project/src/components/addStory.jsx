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
    // Validate input fields
    if (!title || !content || !genre) {
      setError("Title, content, and genre are required.");
      return;
    }

    try {
      const response = await fetchWithAuth(
        "http://localhost:3000/api/stories",
        {
          method: "POST",
          body: JSON.stringify({
            title,
            summary,
            content,
            genre,
          }),
        }
      );

      if (response.storyId) {
        setShowPopup(true); // Show pop-up
        setTimeout(() => {
          setShowPopup(false); // Hide pop-up after 3 seconds
          navigate(`/${response.storyId}`); // Redirect to the newly created story
        }, 3000); // Pop-up duration: 3 seconds
      }
    } catch (error) {
      console.error("Error creating story:", error);
      setError(error.message || "An error occurred while creating the story.");
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
