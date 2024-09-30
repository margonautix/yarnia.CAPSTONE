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
        // Store the token and user data in localStorage
        const userData = { username, email };
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(userData));

        // Update the parent component's user state
        setUser(userData);

        // Navigate to the profile page after successful registration
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
    <div className="register-container">
      <h2>Register New Account</h2>
      {error && <p className="error-message">{error}</p>}
      <div>
        <form className="register-form" onSubmit={handleSubmit}>
          <label>
            Username:
            <input
              placeholder="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            Email:
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password:
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button className="login-button" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
