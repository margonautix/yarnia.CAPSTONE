import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { createNewUser } from "../API"; // Assuming the API file is set up like this

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // To display error messages

  const navigate = useNavigate(); // Initialize navigate

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    try {
      // Call the API function to create a new user
      const result = await createNewUser(username, email, password);

      if (result && result.token) {
        // Store the token and any other necessary user data
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify({ username, email }));

        // Navigate to the profile page after successful registration and login
        navigate("/profile");
      }
    } catch (error) {
      // Handle errors such as duplicate emails or other registration failures
      if (error.response && error.response.status === 409) {
        setError("User already exists with this email or username");
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div>
      <h2>Register New Account</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>
        <form onSubmit={handleSubmit}>
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
          <br />
          <br />
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
          <br />
          <br />
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
          <br />
          <br />
          <button className="login-button" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
