import { useState } from "react";
import { createNewUser } from "../API"; // Assuming the API file is set up like this

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // To display error messages
  const [success, setSuccess] = useState(""); // To display success message

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors
    setSuccess(""); // Clear any previous success messages

    try {
      // Call the API function to create a new user
      const result = await createNewUser(username, email, password);

      if (result.status === 201) {
        setSuccess("User registered successfully!");
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
      {success && <p style={{ color: "green" }}>{success}</p>}
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
              minLength="8"
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
