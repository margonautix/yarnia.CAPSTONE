import { useEffect, useState } from "react";
import { fetchAllUsers, deleteUsers } from "../API";
import { Link } from "react-router-dom";

export default function AdminUsersFeed() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all users when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await fetchAllUsers(); // Fetch all users from the API
        console.log(allUsers); // Log users to verify structure
        setUsers(allUsers);
        setFilteredUsers(allUsers);
      } catch (err) {
        setError("Failed to fetch users.");
      }
    };

    fetchUsers();
  }, []);

  // Handle delete action for users
  const handleDeleteUser = async (userId) => {
    try {
      await deleteUsers(userId); // Assuming deleteUsers takes only userId as a parameter
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId)); // Remove the deleted user from state
      setFilteredUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== userId)
      );
    } catch (error) {
      console.error("Failed to delete the user:", error);
      setError("Failed to delete the user.");
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim() === "") {
      setFilteredUsers(users); // If the search term is empty, reset to all users
    } else {
      const lowerCaseTerm = term.toLowerCase();
      const filtered = users.filter(
        (user) =>
          (user.username &&
            user.username.toLowerCase().includes(lowerCaseTerm)) ||
          (user.email && user.email.toLowerCase().includes(lowerCaseTerm))
      );
      setFilteredUsers(filtered);
    }
  };

  return (
    <div className="admin-users-container">
      <h2>All Users</h2>
      {error && <p className="error">{error}</p>}

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by username or email"
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-bar"
      />

      <ul className="users-list">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <li key={user.id} className="user-item">
              <div className="user-content">
                {/* Placeholder Avatar with Initials */}
                <div className="user-avatar">
                  {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                </div>

                {/* User Details Section */}
                <div className="user-details">
                  <span className="user-name">
                    <Link to={`/users/${user.id}`}>
                      {user.username || "Unknown User"}
                    </Link>
                  </span>
                  <span className="user-email">
                    {user.email || "No email available"}
                  </span>
                  <span className="user-role">
                    {user.isAdmin ? "Admin" : "User"}
                  </span>
                </div>
              </div>
              {/* Delete Button */}
              <button
                onClick={() => handleDeleteUser(user.id)}
                className="delete-button"
              >
                Delete
              </button>
            </li>
          ))
        ) : (
          <p>No users available.</p>
        )}
      </ul>
    </div>
  );
}
