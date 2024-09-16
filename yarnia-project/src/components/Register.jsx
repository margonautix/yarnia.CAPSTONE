import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode"; // Make sure this is installed via npm

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (data.token) {
        const decodedToken = jwtDecode(data.token);

        // Store token and user details in localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            token: data.token,
            email: decodedToken.email,
            username: decodedToken.username,
            isAdmin: decodedToken.isAdmin,
          })
        );

        navigate("/profile"); // Redirect to profile page
      } else {
        alert("Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
