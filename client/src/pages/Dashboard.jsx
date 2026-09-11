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

  // =====================================================
  // AQI CITY COMPARISON
  // =====================================================

  const [aqiComparison, setAqiComparison] = useState([]);
  const [comparisonLoading, setComparisonLoading] = useState(true);

  const [city, setCity] = useState("Detecting location...");
  const [locationError, setLocationError] = useState("");

  const goal = 15;

  // =====================================================
  // MAIN EFFECT
  // =====================================================

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      window.location.href = "/login";
      return;
    }

    // =====================================================
    // CARBON ACTIVITY DATA
    // =====================================================

    const loadActivities = async () => {
      try {
        const response = await axios.get(`${API}/api/activities/${user._id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = response.data || [];

        setActivities(data);

        // -------------------------------------------------
        // TOTAL WEEKLY EMISSION
        // -------------------------------------------------

        const total = data.reduce(
          (sum, item) => sum + Number(item.emission || 0),
          0,
        );

        setWeekEmission(total);

        // -------------------------------------------------
        // TODAY'S EMISSION
        // -------------------------------------------------

        if (data.length > 0) {
          setTodayEmission(Number(data[0].emission || 0));
        } else {
          setTodayEmission(0);
        }

        // =================================================
        // AI PREDICTION
        // =================================================

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

        try {
          const predictionResponse = await axios.post(
            `${API}/api/carbon/predict`,
            {
              transport,
              electricity,
              fuel,
            },
          );

          const predicted =
            predictionResponse.data?.prediction?.predicted_emission;

          if (predicted !== undefined) {
            setPrediction(Number(predicted).toFixed(2));
          }
        } catch (error) {
          console.log("Prediction error:", error);

          setPrediction("--");
        }
      } catch (error) {
        console.log("Activity data error:", error);
      }
    };

    loadActivities();

    // =====================================================
    // LOAD AQI CITY COMPARISON
    // =====================================================

    const loadAQIComparison = async () => {
      try {
        setComparisonLoading(true);

        const response = await axios.get(
          `${API}/api/environment/compare-aqi?cities=Delhi,Lucknow,Mumbai`,
        );

        setAqiComparison(response.data?.cities || []);
      } catch (error) {
        console.log("AQI comparison error:", error);

        setAqiComparison([]);
      } finally {
        setComparisonLoading(false);
      }
    };

    loadAQIComparison();

    // =====================================================
    // LOAD ENVIRONMENTAL DATA
    // =====================================================

    const loadEnvironmentalData = async (detectedCity, latitude, longitude) => {
      try {
        console.log("Loading environmental data for:", detectedCity);

        console.log("Coordinates:", latitude, longitude);

        // -------------------------------------------------
        // 1. Try existing latest data
        // -------------------------------------------------

        const latestResponse = await axios.get(
          `${API}/api/environment/latest/${encodeURIComponent(detectedCity)}`,
        );

        let latestData = latestResponse.data?.data;

        // -------------------------------------------------
        // 2. If no data exists, use GPS coordinates
        // -------------------------------------------------

        if (!latestData) {
          console.log("No existing environmental data found.");

          console.log("Requesting fresh data using GPS coordinates...");

          const updateResponse = await axios.post(
            `${API}/api/environment/update-by-location`,
            {
              city: detectedCity,
              latitude: Number(latitude),
              longitude: Number(longitude),
            },
          );

          latestData = updateResponse.data?.data;
        }

        // -------------------------------------------------
        // 3. Make sure we actually received data
        // -------------------------------------------------

        if (!latestData) {
          throw new Error("Environmental data was not returned by the server.");
        }

        // -------------------------------------------------
        // 4. Save environmental data in state
        // -------------------------------------------------

        setEnvironment(latestData);

        setLocationError("");

        // -------------------------------------------------
        // 5. Get weekly environmental history
        // -------------------------------------------------

        try {
          const weeklyResponse = await axios.get(
            `${API}/api/environment/weekly/${encodeURIComponent(detectedCity)}`,
          );

          setEnvironmentHistory(weeklyResponse.data?.data || []);
        } catch (weeklyError) {
          console.log("Weekly environmental data error:", weeklyError);

          setEnvironmentHistory([]);
        }
      } catch (error) {
        console.log("Environmental data error:", error);

        console.log("Environmental error response:", error.response?.data);

        // -------------------------------------------------
        // FALLBACK TO DELHI
        // -------------------------------------------------

        try {
          const fallbackLatest = await axios.get(
            `${API}/api/environment/latest/Delhi`,
          );

          const fallbackWeekly = await axios.get(
            `${API}/api/environment/weekly/Delhi`,
          );

          setEnvironment(fallbackLatest.data?.data || null);

          setEnvironmentHistory(fallbackWeekly.data?.data || []);

          setCity("Delhi");

          setLocationError(
            `Environmental data could not be loaded for ${detectedCity}. Showing Delhi data.`,
          );
        } catch (fallbackError) {
          console.log("Delhi fallback error:", fallbackError);

          setEnvironment(null);
          setEnvironmentHistory([]);

          setLocationError("Environmental data could not be loaded.");
        }
      }
    };

    // =====================================================
    // AUTOMATIC LOCATION DETECTION
    // =====================================================

    const detectCity = async (latitude, longitude) => {
      try {
        console.log("GPS coordinates:", latitude, longitude);

        // -------------------------------------------------
        // Reverse geocoding
        // -------------------------------------------------

        const response = await axios.get(
          "https://api.bigdatacloud.net/data/reverse-geocode-client",
          {
            params: {
              latitude,
              longitude,
              localityLanguage: "en",
            },
          },
        );

        const location = response.data;

        console.log("Detected location:", location);

        // -------------------------------------------------
        // Get city/locality name
        // -------------------------------------------------

        const detectedCity =
          location.city ||
          location.locality ||
          location.principalSubdivision ||
          "Delhi";

        console.log("Detected city:", detectedCity);

        setCity(detectedCity);

        // -------------------------------------------------
        // IMPORTANT:
        // Send BOTH city and coordinates
        // -------------------------------------------------

        await loadEnvironmentalData(detectedCity, latitude, longitude);
      } catch (error) {
        console.log("City detection error:", error);

        // -------------------------------------------------
        // Delhi fallback
        // -------------------------------------------------

        setCity("Delhi");

        setLocationError("Unable to detect your location. Showing Delhi data.");

        try {
          const fallbackLatest = await axios.get(
            `${API}/api/environment/latest/Delhi`,
          );

          const fallbackWeekly = await axios.get(
            `${API}/api/environment/weekly/Delhi`,
          );

          setEnvironment(fallbackLatest.data?.data || null);

          setEnvironmentHistory(fallbackWeekly.data?.data || []);
        } catch (fallbackError) {
          console.log("Fallback environmental error:", fallbackError);
        }
      }
    };

    // =====================================================
    // REQUEST USER LOCATION
    // =====================================================

    if (!navigator.geolocation) {
      console.log("Geolocation is not supported.");

      setLocationError(
        "Geolocation is not supported by your browser. Showing Delhi data.",
      );

      // Delhi coordinates
      detectCity(28.6139, 77.209);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;

          const longitude = position.coords.longitude;

          console.log("Browser GPS location:", latitude, longitude);

          detectCity(latitude, longitude);
        },
        (error) => {
          console.log("Location permission error:", error);

          setLocationError("Location permission denied. Showing Delhi data.");

          // Delhi fallback
          detectCity(28.6139, 77.209);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        },
      );
    }
  }, []);

  // =====================================================
  // AQI STATUS
  // =====================================================

  const getAQIStatus = (aqi) => {
    if (aqi === null || aqi === undefined) {
      return "Unknown";
    }

    if (aqi <= 50) {
      return "Good";
    }

    if (aqi <= 100) {
      return "Moderate";
    }

    if (aqi <= 150) {
      return "Unhealthy for Sensitive Groups";
    }

    if (aqi <= 200) {
      return "Poor";
    }

    if (aqi <= 300) {
      return "Very Poor";
    }

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
              📍 Real-time weather and air quality conditions for{" "}
              <strong>{city}</strong>.
            </p>

            {locationError && (
              <p className="environment-error">{locationError}</p>
            )}

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
              AQI CITY COMPARISON
          ================================================= */}

          <div className="environment-section">
            <h2 className="environment-title">🌍 Compare City AQI</h2>

            <p className="environment-subtitle">
              Compare air quality across different cities.
            </p>

            <div className="environment-cards">
              {comparisonLoading ? (
                <div className="glass-card environment-card">
                  <h3>🌫️ AQI Comparison</h3>

                  <p>Loading city AQI data...</p>
                </div>
              ) : aqiComparison.length > 0 ? (
                aqiComparison.map((item) => (
                  <div className="glass-card environment-card" key={item.city}>
                    <h3>📍 {item.city}</h3>

                    {item.available ? (
                      <>
                        <div className="environment-main-value">
                          AQI {item.AQI}
                        </div>

                        <p>
                          <strong>Status:</strong> {getAQIStatus(item.AQI)}
                        </p>

                        <p>
                          <strong>PM2.5:</strong> {item.PM25}
                        </p>

                        <p>
                          <strong>PM10:</strong> {item.PM10}
                        </p>
                      </>
                    ) : (
                      <p>Environmental data not available yet.</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="glass-card environment-card">
                  <h3>🌫️ AQI Comparison</h3>

                  <p>Unable to load city comparison data.</p>
                </div>
              )}
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
