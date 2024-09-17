import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { fetchWithAuth } from "../API"; // Import the utility function to fetch with auth

const Profile = () => {
  const [user, setUser] = useState(null); // Store the user's profile data
  const [isEditing, setIsEditing] = useState(false); // Track if we are in edit mode
  const [username, setUsername] = useState(""); // State for editing username
  const [bio, setBio] = useState(""); // State for editing bio
  const navigate = useNavigate(); // Initialize navigate

  // Fetch user data when component mounts
  const fetchUserData = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:3000/api/auth/me");

      if (response.ok) {
        const userData = await response.json();
        setUser(userData); // Set user data in state
        setUsername(userData.username); // Initialize editing fields
        setBio(userData.bio);
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData(); // Fetch user data once when the component mounts
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    navigate("/login"); // Redirect to login page
  };

  // Handle save action for editing profile
  const handleSave = async () => {
    try {
      const response = await fetchWithAuth(
        "http://localhost:3000/api/users/me",
        {
          method: "PUT",
          body: JSON.stringify({ username, bio }), // Include updated username and bio
        }
      );

      if (response.ok) {
        await fetchUserData(); // Fetch updated data again after saving
        setIsEditing(false); // Exit edit mode after saving
      } else {
        console.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error while updating profile:", error);
    }
  };

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div>
      <h1>
        Welcome,{" "}
        {isEditing ? (
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        ) : (
          user.username
        )}
        !
      </h1>
      <p>Email: {user.email}</p>
      <p>
        Bio:{" "}
        {isEditing ? (
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
        ) : (
          user.bio
        )}
      </p>

      {isEditing ? (
        <>
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </>
      ) : (
        <button onClick={() => setIsEditing(true)}>Edit Profile</button>
      )}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Profile;
