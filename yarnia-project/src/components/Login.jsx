import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode"; // Make sure this is installed via npm

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
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
        alert("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
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
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
