import { createNewUser } from "../API";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Call the API function to create a new user
      const result = await createNewUser(username, email, password);
      if (result) {
        console.log("User registered successfully", result);
      }
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  return (
    <div>
      <>
        <h2>Register New Account</h2>
        <div>
          <form onSubmit={handleSubmit}>
            <label>
              Username:{" "}
              <input
                placeholder="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <br />
            <br />
            <label>
              Email:{" "}
              <input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <br />
            <br />
            <label>
              Password:{" "}
              <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <br />
            <br />
            <button className="login-button">Submit</button>
          </form>
        </div>
      </>
    </div>
  );
};

export default Register;
