import "./Dashboard.css";
import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../components/Navbar";
import SummaryCard from "../components/SummaryCard";
import ActivityTable from "../components/ActivityTable";
import RecommendationBox from "../components/RecommendationBox";
import BarChart from "../components/BarChart";

export default function Dashboard() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/activities")
      .then((res) => setActivities(res.data))
      .catch(() => setActivities([]));
  }, []);

  return (
    <>
      <Navbar />

      <div className="dashboard">
        <div className="dashboard-container">
          <h1 className="dashboard-title">
            Smart Carbon Tracker
          </h1>

          <p className="dashboard-subtitle">
            Monitor and reduce your carbon footprint.
          </p>

          <div className="summary-section">
            <SummaryCard
              title="Today's Emission"
              value="18.4 kg CO₂"
            />

            <SummaryCard
              title="This Week"
              value="112.8 kg CO₂"
            />

            <SummaryCard
              title="Prediction"
              value="16.2 kg CO₂"
            />

            <SummaryCard
              title="Goal"
              value="15 kg CO₂"
            />
          </div>

          <div className="dashboard-middle">

            <div className="glass-card activity-section">
              <ActivityTable activities={activities} />
            </div>

            <div className="glass-card chart-section">
              <h3>Weekly Emission</h3>

              <BarChart />
            </div>

          </div>

          <div className="glass-card recommend-section">
            <RecommendationBox />
          </div>

        </div>
      </div>
    </>
  );
}