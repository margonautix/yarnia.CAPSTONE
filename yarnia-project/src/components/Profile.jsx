import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBookmarkedStories, fetchWithAuth } from "../API"; // Import necessary functions

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [image, setImage] = useState(null); // Updated state for image
  const [imagePreview, setImagePreview] = useState(null); // Preview state
  const [bio, setBio] = useState("");
  const [stories, setStories] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user data and their stories when the component mounts
  const fetchUserData = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:3000/api/auth/me");

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setUsername(userData.username);
        setBio(userData.bio);
        setIsAuthenticated(true);
        
        // Fetch the user's stories, bookmarks, and comments after fetching user data
        await fetchUserStories(userData.id);
        await fetchUserBookmarks(userData.id);
        await fetchUserComments(userData.id);
      } else {
        console.error("Failed to fetch user data");
        setIsAuthenticated(false);
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsAuthenticated(false);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStories = async (userId) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:3000/api/users/${userId}/stories`
      );
      if (response.ok) {
        const userStories = await response.json();
        setStories(userStories);
      }
    } catch (error) {
      console.error("Error fetching user stories:", error);
      setError("An error occurred while fetching stories.");
    }
  };

  const fetchUserBookmarks = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const bookmarkedStories = await fetchBookmarkedStories(userId, token);
      setBookmarks(bookmarkedStories);
    } catch (error) {
      console.error("Error fetching user bookmarks:", error);
      setError("An error occurred while fetching bookmarks.");
    }
  };

  const fetchUserComments = async (userId) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:3000/api/users/${userId}/comments`
      );
      if (response.ok) {
        const userComments = await response.json();
        setComments(userComments);
      }
    } catch (error) {
      console.error("Error fetching user comments:", error);
      setError("An error occurred while fetching comments.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("bio", bio);
      if (image) {
        formData.append("profilePicture", image); // Append image if available
      }

      const response = await fetchWithAuth(
        "http://localhost:3000/api/users/me",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData, // Send FormData with image
        }
      );

      if (response.ok) {
        await fetchUserData();
        setIsEditing(false);
        setSaveError(null);
      } else {
        setSaveError("Failed to update profile");
      }
    } catch (error) {
      setSaveError("Error while updating profile.", error);
    }
  };

  const handleReadMore = (storyId) => {
    if (!storyId) {
      console.error("Story ID not provided for navigation");
      return;
    }
    navigate(`/stories/${storyId}`);
  };

  const handleStoryDelete = async (storyId) => {
    try {
      const url = `http://localhost:3000/api/stories/${storyId}`;
      const response = await fetchWithAuth(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setStories((prevStories) =>
          prevStories.filter((story) => story.storyId !== storyId)
        );
      } else {
        console.error("Failed to delete story");
      }
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      const url = `http://localhost:3000/api/comments/${commentId}`;
      const response = await fetchWithAuth(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.commentId !== commentId)
        );
      } else {
        console.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set the preview
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <>
      <br />
      <section id="whole-profile">
        <div className="profile">
          <div className="stories-container">
            <div className="profile-stories-wrapper">
              <div className="profile-container">
                {/* Profile Picture */}
                <div className='profile_img text-center p-4'>
                  <div className="flex flex-column justify-content-center align-items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange} // Handle image change
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Profile Preview"
                        style={{
                          width: "200px",
                          height: "200px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "4px solid green",
                        }}
                      />
                    )}
                  </div>
                </div>
                <h1>
                  Welcome,{" "}
                  {isEditing ? (
                    <div className="group">
                      <input
                        id="username"
                        className="input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  ) : (
                    user.username
                  )}
                  !
                </h1>
                <div className="info">
                  <h4 id="label">Email:</h4>
                  <p>{user.email}</p>

                  <br />
                  <br />
                  <h4 id="label">Bio:</h4>
                  <p>
                    {isEditing ? (
                      <div className="group">
                        <textarea
                          id="bio"
                          className="form-textarea"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                        />
                      </div>
                    ) : (
                      user.bio
                    )}
                  </p>
                </div>
                {isEditing ? (
                  <div className="group">
                    <button className="button" onClick={handleSave}>
                      Save
                    </button>
                    <button
                      className="button"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button className="button" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                )}
                {saveError && <p className="error-message">{saveError}</p>}
              </div>

              {/* Bookmarks Section */}
              <div className="profile-container">
                <h2>Your Bookmarks</h2>
                {bookmarks.length > 0 ? (
                  <ul className="bookmark-list">
                    {bookmarks.map((bookmark) => (
                      <li key={bookmark.bookmarkId} className="bookmark-item">
                        <h3>{bookmark.story.title}</h3>
                        <p>
                          {bookmark.story.summary || "No summary available"}
                        </p>
                        <button
                          onClick={() => handleReadMore(bookmark.storyId)}
                          className="button"
                        >
                          Read more
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No bookmarks found.</p>
                )}
              </div>
            </div>

            {/* Stories Section */}
            <div className="profile-container">
              <h2>Your Stories</h2>
              {error && <p className="error-message">{error}</p>}

              {stories.length > 0 ? (
                <ul className="story-list">
                  {stories.map((story) => (
                    <div className="story-item" key={story.storyId}>
                      <li>
                        <div id="story-card">
                          <h3>{story.title}</h3>
                          <p>{story.summary || "No summary available"}</p>
                        </div>
                        <button
                          onClick={() => handleReadMore(story.storyId)}
                          className="button"
                        >
                          Read more
                        </button>
                        <button
                          onClick={() => handleStoryDelete(story.storyId)}
                          className="button"
                        >
                          Delete
                        </button>
                      </li>
                    </div>
                  ))}
                </ul>
              ) : (
                <p>Nothing to find here...</p>
              )}
            </div>
          </div>

          {/* Comment History Section */}
          <div className="profile-container">
            <h3 id="history">Comment History:</h3>
            {comments.length > 0 ? (
              <ul className="comment-list">
                {comments.map((comment) => (
                  <li className="comment-item" key={comment.commentId}>
                    <strong>Story: {comment.story.title}</strong>
                    <p>{comment.content}</p>
                    <br />
                    <button
                      onClick={() => handleReadMore(comment.storyId)}
                      className="button"
                    >
                      View Story
                    </button>
                    <button
                      onClick={() => handleCommentDelete(comment.commentId)}
                      className="button"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No comments found</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
