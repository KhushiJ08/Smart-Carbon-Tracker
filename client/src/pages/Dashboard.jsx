import "./Dashboard.css";
import { useEffect, useState } from "react";
import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

import Navbar from "../components/Navbar";
import SummaryCard from "../components/SummaryCard";
import ActivityTable from "../components/ActivityTable";
import RecommendationBox from "../components/RecommendationBox";
import BarChart from "../components/BarChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const API = "https://smart-carbon-tracker-backend.onrender.com";

export default function Dashboard() {
  const [activities, setActivities] = useState([]);

  const [todayEmission, setTodayEmission] = useState(0);
  const [weekEmission, setWeekEmission] = useState(0);
  const [prediction, setPrediction] = useState("--");

  const [environment, setEnvironment] = useState(null);
  const [environmentHistory, setEnvironmentHistory] = useState([]);

  const goal = 15;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      window.location.href = "/login";
      return;
    }

    // =====================================================
    // CARBON ACTIVITY DATA
    // =====================================================

    axios
      .get(`${API}/api/activities/${user._id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      .then((res) => {
        const data = res.data || [];

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

        // -----------------------------
        // Prediction data
        // -----------------------------

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
          .post(`${API}/api/carbon/predict`, {
            transport,
            electricity,
            fuel,
          })
          .then((response) => {
            const predicted = response.data?.prediction?.predicted_emission;

            if (predicted !== undefined) {
              setPrediction(Number(predicted).toFixed(2));
            }
          })
          .catch(() => {
            setPrediction("--");
          });
      })
      .catch((err) => {
        console.log("Activity data error:", err);
      });

    // =====================================================
    // LATEST ENVIRONMENTAL DATA
    // =====================================================

    axios
      .get(`${API}/api/environment/latest/Delhi`)
      .then((res) => {
        setEnvironment(res.data?.data || null);
      })
      .catch((err) => {
        console.log("Environmental data error:", err);
      });

    // =====================================================
    // ENVIRONMENTAL HISTORY
    // =====================================================

    axios
      .get(`${API}/api/environment/weekly/Delhi`)
      .then((res) => {
        setEnvironmentHistory(res.data?.data || []);
      })
      .catch((err) => {
        console.log("Environmental history error:", err);
      });
  }, []);

  // =====================================================
  // AQI STATUS
  // =====================================================

  const getAQIStatus = (aqi) => {
    if (aqi === null || aqi === undefined) {
      return "Unknown";
    }

    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Poor";
    if (aqi <= 300) return "Very Poor";

    return "Hazardous";
  };

  // =====================================================
  // CHART LABELS
  // =====================================================

  const chartLabels = environmentHistory.map((item) =>
    new Date(item.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );

  // =====================================================
  // TEMPERATURE CHART
  // =====================================================

  const temperatureData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Temperature (°C)",
        data: environmentHistory.map((item) => Number(item.temperature)),
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  // =====================================================
  // HUMIDITY CHART
  // =====================================================

  const humidityData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Humidity (%)",
        data: environmentHistory.map((item) => Number(item.humidity)),
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  // =====================================================
  // AQI CHART
  // =====================================================

  const aqiData = {
    labels: chartLabels,
    datasets: [
      {
        label: "AQI",
        data: environmentHistory.map((item) => Number(item.AQI)),
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  // =====================================================
  // CHART OPTIONS
  // =====================================================

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 14,
          },
        },
      },

      tooltip: {
        enabled: true,
      },
    },

    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          font: {
            size: 12,
          },
        },

        grid: {
          display: true,
        },
      },

      y: {
        beginAtZero: false,

        ticks: {
          font: {
            size: 12,
          },
        },

        grid: {
          display: true,
        },
      },
    },
  };

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <>
      <Navbar />

      <div className="dashboard">
        <div className="dashboard-container">
          {/* =================================================
              HEADER
          ================================================= */}

          <h1 className="dashboard-title">Smart Carbon Tracker</h1>

          <p className="dashboard-subtitle">
            Monitor and reduce your carbon footprint.
          </p>

          {/* =================================================
              CARBON SUMMARY
          ================================================= */}

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

          {/* =================================================
              ACTIVITIES + WEEKLY EMISSION
          ================================================= */}

          <div className="dashboard-middle">
            <div className="glass-card activity-section">
              <ActivityTable activities={activities} />
            </div>

            <div className="glass-card chart-section">
              <h3>Weekly Emission</h3>

              <BarChart activities={activities} />
            </div>
          </div>

          {/* =================================================
              ENVIRONMENTAL MONITORING
          ================================================= */}

          <div className="environment-section">
            <h2 className="environment-title">Environmental Monitoring</h2>

            <p className="environment-subtitle">
              Real-time weather and air quality conditions for Delhi.
            </p>

            {/* =================================================
                WEATHER + AIR QUALITY
            ================================================= */}

            <div className="environment-cards">
              {/* WEATHER */}

              <div className="glass-card environment-card">
                <h3>🌤️ Weather</h3>

                {environment ? (
                  <>
                    <div className="environment-main-value">
                      {environment.temperature}°C
                    </div>

                    <p>
                      <strong>Condition:</strong> {environment.weather}
                    </p>

                    <p>
                      <strong>Humidity:</strong> {environment.humidity}%
                    </p>

                    <p>
                      <strong>City:</strong> {environment.city}
                    </p>
                  </>
                ) : (
                  <p>Loading weather data...</p>
                )}
              </div>

              {/* AIR QUALITY */}

              <div className="glass-card environment-card">
                <h3>🌫️ Air Quality</h3>

                {environment ? (
                  <>
                    <div className="environment-main-value">
                      AQI {environment.AQI}
                    </div>

                    <p>
                      <strong>Status:</strong> {getAQIStatus(environment.AQI)}
                    </p>

                    <p>
                      <strong>PM2.5:</strong> {environment.PM25}
                    </p>

                    <p>
                      <strong>PM10:</strong> {environment.PM10}
                    </p>
                  </>
                ) : (
                  <p>Loading air quality data...</p>
                )}
              </div>
            </div>

            {/* =================================================
                ENVIRONMENTAL CHARTS
            ================================================= */}

            <div className="environment-charts">
              {/* TEMPERATURE */}

              <div className="glass-card environment-chart-card">
                <h3>🌡️ Temperature Trend</h3>

                <div className="environment-chart">
                  {environmentHistory.length > 0 ? (
                    <Line data={temperatureData} options={chartOptions} />
                  ) : (
                    <p>Loading temperature data...</p>
                  )}
                </div>
              </div>

              {/* HUMIDITY */}

              <div className="glass-card environment-chart-card">
                <h3>💧 Humidity Trend</h3>

                <div className="environment-chart">
                  {environmentHistory.length > 0 ? (
                    <Line data={humidityData} options={chartOptions} />
                  ) : (
                    <p>Loading humidity data...</p>
                  )}
                </div>
              </div>

              {/* AQI */}

              <div className="glass-card environment-chart-card">
                <h3>🏭 Air Quality Trend</h3>

                <div className="environment-chart">
                  {environmentHistory.length > 0 ? (
                    <Line data={aqiData} options={chartOptions} />
                  ) : (
                    <p>Loading AQI data...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              AI RECOMMENDATIONS
          ================================================= */}

          <div className="glass-card recommend-section">
            <RecommendationBox activities={activities} />
          </div>
        </div>
      </div>
    </>
  );
}
