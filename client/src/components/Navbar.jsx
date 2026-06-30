import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">🌱 Smart Carbon Tracker</Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/add-activity">Add Activity</Link>
        <Link to="/login">Login</Link>

        <Link to="/signup" className="nav-btn">
          Sign Up
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
