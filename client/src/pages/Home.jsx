import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Home.css";

function Home() {
  return (
    <>
      <Navbar />

      <section className="hero">
        <div className="overlay">
          <div className="hero-content">
            <span className="badge">🌱 Smart Carbon Tracker</span>

            <h1>
              Track. Analyze.
              <br />
              Reduce. Together.
            </h1>

            <p>
              Monitor your carbon footprint, understand your daily impact, and
              make sustainable decisions with AI-powered insights.
            </p>

            <div className="hero-buttons">
              <Link to="/signup">
                <button className="primary-btn">Start Tracking</button>
              </Link>

              <Link to="/login">
                <button className="secondary-btn">Login</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>What You Can Do</h2>

        <div className="cards">
          <div className="card">
            <h3>📊 Track Emissions</h3>
            <p>Log daily activities and monitor your carbon footprint.</p>
          </div>

          <div className="card">
            <h3>🤖 AI Insights</h3>
            <p>Receive smart recommendations to reduce emissions.</p>
          </div>

          <div className="card">
            <h3>📈 Analytics</h3>
            <p>Visualize trends and understand your environmental impact.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Small Changes. Big Impact.</h2>

        <p>Every sustainable choice contributes towards a greener tomorrow.</p>

        <Link to="/signup">
          <button className="primary-btn">Join Now</button>
        </Link>
      </section>

      <Footer />
    </>
  );
}

export default Home;
