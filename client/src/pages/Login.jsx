import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser({
        email,
        password,
      });

      localStorage.setItem("user", JSON.stringify(res));

      alert("Login Successful!");

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Invalid Email or Password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="join-badge">🌱 Welcome Back</div>

        <h1 className="login-title">
          Login to <span>Smart Carbon Tracker</span>
        </h1>

        <p className="login-subtitle">
          Continue your sustainability journey.
        </p>

        <form className="login-form" onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

        <p className="bottom-text">
          Don't have an account?
          <Link to="/signup"> Signup</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;