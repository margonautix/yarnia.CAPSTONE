import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserProfileById, fetchUserStoriesById } from "../API";

export default function UserProfile() {
  const { authorId } = useParams(); // Get the user ID from the URL
  const [user, setUser] = useState(null);
  const [userStories, setUserStories] = useState([]);
  const [userError, setUserError] = useState(null);
  const [storiesError, setStoriesError] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state for user data
  const navigate = useNavigate(); // Initialize navigate

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchUserProfileById(authorId);
        if (userData) {
          setUser(userData); // Set the user state
        } else {
          setUserError("User not found.");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUserError("Failed to fetch user data.");
      } finally {
        setLoading(false); // Stop loading once user data is fetched
      }
    };

    fetchUserData();
  }, [authorId]);

  // Fetch user stories
  useEffect(() => {
    const fetchUserStories = async () => {
      try {
        const storiesData = await fetchUserStoriesById(authorId);
        if (storiesData && storiesData.length > 0) {
          setUserStories(storiesData); // Set the user's stories state
        } else {
          setUserStories([]); // No stories found
        }
      } catch (error) {
        console.error("No stories found:", error);
        setStoriesError("No stories found.");
      }
    };

    if (authorId) {
      fetchUserStories();
    }
  }, [authorId]);

  if (loading) {
    return <div>Loading user data...</div>; // Show loading spinner or message
  }

  if (userError) return <p>{userError}</p>;

  return (
    <>
      <section id="whole-profile">
        <div className="profile">
          <div className="profile-container">
            {/* User Profile Section */}
            {user ? (
              <>
                <div className="profile-header">
                  <h1>{user.username}</h1>
                  <p>Bio: {user.bio}</p>
                </div>

                {/* Stories Section */}
                <div className="profile-stories-wrapper">
                  <h2>{user.username}'s Stories</h2>
                  {storiesError ? (
                    <p>{storiesError}</p> // Display error if there's an issue fetching stories
                  ) : userStories.length > 0 ? (
                    <ul className="story-list">
                      {userStories.map((story) => (
                        <div className="story-item" key={story.id}>
                          <li>
                            <div id="story-card">
                              <h3>{story.title}</h3>
                              <p>{story.summary || "No summary available"}</p>
                            </div>
                            <button
                              onClick={() => navigate(`/stories/${story.id}`)}
                              className="button"
                            >
                              Read more
                            </button>
                          </li>
                        </div>
                      ))}
                    </ul>
                  ) : (
                    <p>No stories available.</p> // Display message if there are no stories
                  )}
                </div>
              </>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
