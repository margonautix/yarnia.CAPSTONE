import { useEffect, useState } from "react";
import { fetchAllUsers, deleteUsers } from "../API";
import { Link } from "react-router-dom";

export default function AdminUsersFeed() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  // Fetch all users when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await fetchAllUsers();
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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user's account, along with all their stories and comments? This action cannot be undone."
    );
    if (!confirmDelete) return; // If the user cancels, exit the function
    try {
      await deleteUsers(userId);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
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
      setFilteredUsers(users);
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
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="admin-users-container">
      <h2>All Users</h2>
      {error && <p className="error">{error}</p>}

      <input
        type="text"
        placeholder="Search by username or email"
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-bar"
      />
      <br />
      <br />

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;

            if (
              pageNumber === currentPage ||
              (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
            ) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`pagination-button ${
                    currentPage === pageNumber ? "active-page" : ""
                  }`}
                >
                  {pageNumber}
                </button>
              );
            }

            return null;
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}

      <ul className="users-list">
        {currentUsers.length > 0 ? (
          currentUsers.map((user) => (
            <li key={user.id} className="user-item">
              <div className="user-content">
                <div className="user-avatar">
                  {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                </div>

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
