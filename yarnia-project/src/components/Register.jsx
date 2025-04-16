import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNewUser } from "../API";

const Register = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await createNewUser(username, email, password);

      if (result && result.token) {
        const userData = { username, email };
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);

        navigate("/profile");
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setError("User already exists with this email or username");
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark text-primary dark:text-primary-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card dark:bg-card-dark rounded-2xl shadow-lg p-8 border border-border dark:border-border-dark">
        <h2 className="text-2xl font-semibold text-center mb-6">Register New Account</h2>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="sr-only">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="w-full px-4 py-2 rounded-xl bg-input dark:bg-input-dark text-input-text dark:text-input-text-dark placeholder-input-placeholder dark:placeholder-input-placeholder-dark border border-border dark:border-border-dark focus:outline-none focus:ring-2 focus:ring-button dark:focus:ring-button-dark"
            />
          </div>

          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-4 py-2 rounded-xl bg-input dark:bg-input-dark text-input-text dark:text-input-text-dark placeholder-input-placeholder dark:placeholder-input-placeholder-dark border border-border dark:border-border-dark focus:outline-none focus:ring-2 focus:ring-button dark:focus:ring-button-dark"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-4 py-2 rounded-xl bg-input dark:bg-input-dark text-input-text dark:text-input-text-dark placeholder-input-placeholder dark:placeholder-input-placeholder-dark border border-border dark:border-border-dark focus:outline-none focus:ring-2 focus:ring-button dark:focus:ring-button-dark"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2 rounded-xl bg-button dark:bg-button-dark hover:bg-button-hover dark:hover:bg-button-hover-dark text-white font-medium transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
