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

  const [todayEmission, setTodayEmission] = useState(0);
  const [weekEmission, setWeekEmission] = useState(0);
  const [prediction, setPrediction] = useState("--");

  const goal = 15;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      window.location.href = "/login";
      return;
    }

    axios
      .get(`http://localhost:5000/api/activities/${user._id}`)
      .then((res) => {
        const data = res.data;

        setActivities(data);

        const total = data.reduce(
          (sum, item) => sum + Number(item.emission || 0),
          0,
        );

        setWeekEmission(total);

        if (data.length > 0) {
          setTodayEmission(Number(data[0].emission || 0));
        } else {
          setTodayEmission(0);
        }

        const transport = data
          .filter(
            (item) =>
              item.category && item.category.toLowerCase() === "transport",
          )
          .reduce((sum, item) => sum + Number(item.emission || 0), 0);

        const electricity = data
          .filter(
            (item) =>
              item.category && item.category.toLowerCase() === "electricity",
          )
          .reduce((sum, item) => sum + Number(item.emission || 0), 0);

        const fuel = data
          .filter(
            (item) => item.category && item.category.toLowerCase() === "fuel",
          )
          .reduce((sum, item) => sum + Number(item.emission || 0), 0);

        axios
          .post("http://localhost:5000/api/carbon/predict", {
            transport,
            electricity,
            fuel,
          })
          .then((response) => {
            setPrediction(
              Number(response.data.prediction.predicted_emission).toFixed(2),
            );
          })
          .catch(() => {
            setPrediction("--");
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <>
      <Navbar />

      <div className="dashboard">
        <div className="dashboard-container">
          <h1 className="dashboard-title">Smart Carbon Tracker</h1>

          <p className="dashboard-subtitle">
            Monitor and reduce your carbon footprint.
          </p>

          <div className="summary-section">
            <SummaryCard
              title="Today's Emission"
              value={`${todayEmission} kg CO₂`}
            />

            <SummaryCard
              title="This Week"
              value={`${weekEmission.toFixed(2)} kg CO₂`}
            />

            <SummaryCard title="Prediction" value={`${prediction} kg CO₂`} />

            <SummaryCard title="Goal" value={`${goal} kg CO₂`} />
          </div>

          <div className="dashboard-middle">
            <div className="glass-card activity-section">
              <ActivityTable activities={activities} />
            </div>

            <div className="glass-card chart-section">
              <h3>Weekly Emission</h3>

              <BarChart activities={activities} />
            </div>
          </div>

          <div className="glass-card recommend-section">
            <RecommendationBox activities={activities} />
          </div>
        </div>
      </div>
    </>
  );
}
