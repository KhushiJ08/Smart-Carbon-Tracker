import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" onClick={closeMenu}>
          🌱 Smart Carbon Tracker
        </Link>
      </div>

      <button
        className={`hamburger ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        aria-controls="navbar-links"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div
        id="navbar-links"
        className={`navbar-links ${menuOpen ? "open" : ""}`}
      >
        <Link to="/" onClick={closeMenu}>
          Home
        </Link>

        <Link to="/dashboard" onClick={closeMenu}>
          Dashboard
        </Link>

        <Link to="/add-activity" onClick={closeMenu}>
          Add Activity
        </Link>

        <Link to="/login" onClick={closeMenu}>
          Login
        </Link>

        <Link to="/signup" className="nav-btn" onClick={closeMenu}>
          Sign Up
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
