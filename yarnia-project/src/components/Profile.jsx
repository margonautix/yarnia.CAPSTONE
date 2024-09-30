import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBookmarkedStories } from "../API"; // Import necessary functions
import { fetchWithAuth } from "../API"; // Import the utility function to fetch with auth

const Profile = ({ user, setUser }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track if the user is authenticated
  const [isEditing, setIsEditing] = useState(false); // Track if we are in edit mode
  const [username, setUsername] = useState(""); // State for editing username
  const [bio, setBio] = useState(""); // State for editing bio
  const [stories, setStories] = useState([]); // State to store user's stories
  const [bookmarks, setBookmarks] = useState([]); // State to store user's bookmarks
  const [comments, setComments] = useState([]); // State to store user's comments
  const [error, setError] = useState(null); // Error state
  const [saveError, setSaveError] = useState(null); // Error state for saving profile
  const [loading, setLoading] = useState(true); // Loading state for user data
  const navigate = useNavigate(); // Initialize navigate
  const [image, setImage] = useState(null);
  const hiddenFileInput = useRef(null);
  const authorId = user?.id;

  const handleReadMore = (storyId) => {
    navigate(`/stories/${storyId}`);
  };

  const handleStoryDelete = async (storyId) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:3000/api/stories/${storyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is sent for authentication
          },
        }
      );

      if (response.ok) {
        // Remove the deleted story from the state
        setStories((prevStories) =>
          prevStories.filter((story) => story.storyId !== storyId)
        );
      } else {
        console.error("Failed to delete story");
        setError("An error occurred while deleting the story.");
      }
    } catch (error) {
      console.error("Error deleting story:", error);
      setError("An error occurred while deleting the story.");
    }
  };

  // Fetch user data and their stories when the component mounts
  const fetchUserData = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:3000/api/auth/me");

      if (response.ok) {
        const userData = await response.json();
        setUser(userData); // Set user data in state
        setUsername(userData.username); // Initialize editing fields
        setBio(userData.bio);
        setIsAuthenticated(true); // User is authenticated

        // Fetch the user's stories, bookmarks, and comments after fetching user data
        await fetchUserStories(userData.id);
        await fetchUserBookmarks(userData.id); // Fetch user's bookmarks
        await fetchUserComments(userData.id); // Fetch comments posted by the user
      } else {
        console.error("Failed to fetch user data");
        setIsAuthenticated(false); // Not authenticated
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsAuthenticated(false); // Handle error as unauthenticated
      navigate("/login");
    } finally {
      setLoading(false); // Stop loading once user data is fetched
    }
  };

  // Fetch stories written by the user
  const fetchUserStories = async (userId) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:3000/api/users/${userId}/stories`
      );
      if (response.ok) {
        const userStories = await response.json();
        setStories(userStories); // Set stories in state
      }
    } catch (error) {
      console.error("Error fetching user stories:", error);
      setError("An error occurred while fetching stories.");
    }
  };

  // Fetch user's bookmarked stories
  const fetchUserBookmarks = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const bookmarkedStories = await fetchBookmarkedStories(userId, token);
      setBookmarks(bookmarkedStories); // Set bookmarks in state
    } catch (error) {
      console.error("Error fetching user bookmarks:", error);
      setError("An error occurred while fetching bookmarks.");
    }
  };

  // Fetch all comments made by the user
  const fetchUserComments = async (userId) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:3000/api/users/${userId}/comments`
      );
      if (response.ok) {
        const userComments = await response.json();
        setComments(userComments); // Set comments in state
      }
    } catch (error) {
      console.error("Error fetching user comments:", error);
      setError("An error occurred while fetching comments.");
    }
  };

  useEffect(() => {
    fetchUserData(); // Fetch user data once when the component mounts
  }, []);

  // Handle save action for editing profile
  const handleSave = async () => {
    try {
      const response = await fetchWithAuth(
        "http://localhost:3000/api/users/me",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is sent
          },
          body: JSON.stringify({ username, bio }), // Include updated username and bio
        }
      );

      if (response.ok) {
        await fetchUserData(); // Fetch updated data again after saving
        setIsEditing(false); // Exit edit mode after saving
        setSaveError(null); // Reset any previous save error
      } else {
        setSaveError("Failed to update profile");
      }
    } catch (error) {
      setSaveError("Error while updating profile.");
    }
  };

  const deleteUserAccount = async (authorId) => {
    const token = localStorage.getItem("token");
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account and all your stories? This action cannot be undone."
    );

    if (!confirmDelete) {
      return; // Exit the function if the user cancels
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${authorId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 204) {
        console.log("User account deleted successfully.");

        // Clear the localStorage
        localStorage.removeItem("token");
        // localStorage.removeItem("user");

        // Reset user state
        setUser(null);

        // Redirect to the homepage
        navigate("/"); // Call navigate here for redirection
      } else {
        const textResponse = await response.text();
        const responseData = JSON.parse(textResponse);
        console.error("Error deleting account:", responseData.message);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    const imgname = event.target.files[0].name;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = Math.max(img.width, img.height);
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(
          img,
          (maxSize - img.width) / 2,
          (maxSize - img.height) / 2
        );
        canvas.toBlob(
          (blob) => {
            const file = new File([blob], imgname, {
              type: "image/*",
              lastModified: Date.now(),
            });

            setImage(file);
          },
          "image/jpeg",
          0.8
        );
      };
    };
  };

  const updateUserProfileWithImage = async (profileUrl) => {
    try {
      const response = await fetchWithAuth(
        "http://localhost:3000/api/users/me",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ profilePicture: profileUrl }),
        }
      );

      if (response.ok) {
        await fetchUserData(); // Refresh user data to include the new profile picture
      } else {
        console.error("Failed to update profile picture");
      }
    } catch (error) {
      console.error("Error while updating profile picture:", error);
    }
  };

  const handleUploadButtonClick = async (file) => {
    if (!file) {
      console.error("No file selected for upload.");
      return; // Exit if no file
    }

    try {
      const myHeaders = new Headers();
      const token = localStorage.getItem("token");
      myHeaders.append("Authorization", `Bearer ${token}`);

      const formdata = new FormData();
      formdata.append("file", file);

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow",
      };

      const response = await fetch(
        "http://localhost:3000/api/upload/profile_pic",
        requestOptions
      );
      if (response.ok) {
        const result = await response.json();
        const profileUrl = result.img_url; // Assuming backend returns { img_url: 'URL' }
        setImage(profileUrl); // Update the image in state
        await updateUserProfileWithImage(profileUrl); // Update user profile with the new image URL
      } else {
        console.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };

  // Handle delete action for comments
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

  if (loading) {
    return <div>Loading user data...</div>; // Show loading spinner or message
  }

  if (!isAuthenticated || !user) {
    return <div>Redirecting to login...</div>; // Redirect if user is not authenticated
  }

  return (
    <>
      <br />
      <section id="whole-profile">
        <div className="profile">
          <div className="stories-container">
            <div className="profile-stories-wrapper">
              <div className="profile-container">
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
                  <div className="image-upload-container">
                    <div className="box-decoration">
                      {isEditing ? (
                        <>
                          <label
                            htmlFor="image-upload-input"
                            className="image-upload-label"
                          >
                            {image ? image.name : "Choose an image"}
                          </label>
                          <div
                            onClick={handleClick}
                            style={{ cursor: "pointer" }}
                          >
                            {image ? (
                              <img
                                src={URL.createObjectURL(image)}
                                alt="upload image"
                                className="img-display-after"
                              />
                            ) : (
                              <img
                                src={user.profilePicture || "./photo.png"}
                                alt="upload image"
                                className="img-display-before"
                              />
                            )}
                          </div>
                          <input
                            id="image-upload-input"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={hiddenFileInput}
                            style={{ display: "none" }}
                          />
                          <button
                            className="button"
                            onClick={() => handleUploadButtonClick(image)}
                          >
                            Upload Image
                          </button>
                        </>
                      ) : (
                        <img
                          src={user.profilePicture || "./photo.png"}
                          alt="Profile"
                          className="img-display"
                        />
                      )}
                    </div>
                  </div>
                  <br />
                  <br />
                  <h4 id="label"> Email:</h4>
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
                <button className="button">Delete Account</button>
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
                          onClick={() => handleReadMore(story.storyId)} // Navigate to the single story
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
                  <li className="comments-item" key={comment.commentId}>
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
      <button onClick={() => deleteUserAccount(authorId)}>
        Delete Account
      </button>

    </>
  );
};

export default Profile;
