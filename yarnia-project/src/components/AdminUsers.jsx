import { useEffect, useState } from "react";
import { fetchAllUsers, deleteUsers } from "../API";
import { Link } from "react-router-dom";
import DefaultAvatar from "./images/anonav.jpg";


export default function AdminUsersFeed() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

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

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user's account, along with all their stories and comments? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await deleteUsers(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setFilteredUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Failed to delete the user:", error);
      setError("Failed to delete the user.");
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) =>
        (user.username && user.username.toLowerCase().includes(term.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(term.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
    setCurrentPage(1);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
<div className="min-h-screen overflow-x-hidden bg-surface dark:bg-surface-dark text-primary dark:text-primary-dark px-4 py-10">
<div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Admin: All Users</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by username or email"
          className="w-full max-w-md px-4 py-2 rounded-md border border-border dark:border-border-dark bg-input dark:bg-input-dark text-input-text dark:text-input-text-dark mb-6"
        />

        {totalPages > 1 && (
          <div className="flex flex-wrap gap-2 mb-5">
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
     className="mr-5"
            >
              《
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
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`px-3 py-1 rounded-full transition-all ${
                      currentPage === pageNumber
                        ? "bg-layer dark:bg-layer-dark text-secondary dark:text-secondary-dark"
                        : "bg-mantis text-black font-semibold dark:text-white"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              }
              return null;
            })}

            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
              className="ml-5"
            >
              》
            </button>
          </div>
        )}

<ul className="space-y-4">
  {currentUsers.length > 0 ? (
    currentUsers.map((user) => (
      <li
        key={user.id}
        className="flex flex-col sm:flex-row sm:items-center justify-between bg-card dark:bg-card-dark p-4 rounded-md shadow border border-border dark:border-border-dark overflow-hidden"
      >
        <div className="flex items-center gap-4 overflow-hidden">
        <img
  src={
    user.avatar
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `http://localhost:3000${user.avatar.startsWith("/") ? "" : "/"}${user.avatar}`
      : DefaultAvatar
  }
  alt={`${user.username}'s avatar`}
  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
/>


          <div className="flex flex-col min-w-0">
            <Link
              to={`/users/${user.id}`}
              className="text-sm font-semibold text-link dark:text-link-dark hover:underline truncate"
            >
              {user.username || "Unknown User"}
            </Link>
            <span className="text-sm text-secondary dark:text-secondary-dark truncate">
              {user.email || "No email available"}
            </span>
            <span className="text-xs text-accent">
              {user.isAdmin ? "Admin" : "User"}
            </span>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
          <button
            onClick={() => handleDeleteUser(user.id)}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded w-full sm:w-auto"
          >
            Delete
          </button>
        </div>
      </li>
    ))
  ) : (
    <p className="text-secondary dark:text-secondary-dark">No users available.</p>
  )}
</ul>

      </div>
    </div>
  );
}
