import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./TravelTracker.css";

const API = "http://localhost:5000";

const transportModes = [
  {
    value: "car",
    label: "Car",
  },
  {
    value: "two-wheeler",
    label: "Two-wheeler",
  },
  {
    value: "bus",
    label: "Bus / Public Transport",
  },
  {
    value: "ev",
    label: "Electric Vehicle",
  },
  {
    value: "bicycle",
    label: "Bicycle",
  },
  {
    value: "walking",
    label: "Walking",
  },
];

export default function TravelTracker() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const [transportMode, setTransportMode] = useState("car");

  const [vehicleType, setVehicleType] = useState("petrol");

  const [passengerCount, setPassengerCount] = useState(1);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [routeData, setRouteData] = useState(null);

  const [calculation, setCalculation] = useState(null);

  const [comparison, setComparison] = useState([]);

  const [recommendation, setRecommendation] = useState("");

  const [travelHistory, setTravelHistory] = useState([]);

  // =====================================================
  // LOAD TRAVEL HISTORY
  // =====================================================

  const loadTravelHistory = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const token = user?.token;

      const config = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {};

      const response = await axios.get(`${API}/api/travel/history`, config);

      setTravelHistory(response.data?.data || []);
    } catch (error) {
      console.log("Travel history error:", error);

      setTravelHistory([]);
    }
  };

  useEffect(() => {
    loadTravelHistory();
  }, []);

  // =====================================================
  // GEOCODE LOCATION
  // =====================================================

  const geocodeLocation = async (location) => {
    const response = await axios.get(
      "https://geocoding-api.open-meteo.com/v1/search",
      {
        params: {
          name: location,
          count: 1,
          language: "en",
          format: "json",
        },
      },
    );

    if (!response.data.results || response.data.results.length === 0) {
      throw new Error(`Unable to identify location: ${location}`);
    }

    const result = response.data.results[0];

    return {
      latitude: result.latitude,
      longitude: result.longitude,
      name: result.name || location,
    };
  };

  // =====================================================
  // CALCULATE TRAVEL
  // =====================================================

  const calculateTravel = async (event) => {
    event.preventDefault();

    setError("");
    setRouteData(null);
    setCalculation(null);
    setComparison([]);
    setRecommendation("");

    if (!origin.trim()) {
      setError("Please enter the starting location.");
      return;
    }

    if (!destination.trim()) {
      setError("Please enter the destination.");
      return;
    }

    if (!passengerCount || Number(passengerCount) < 1) {
      setError("Passenger count must be at least 1.");
      return;
    }

    try {
      setLoading(true);

      // -------------------------------------------------
      // GEOCODE ORIGIN
      // -------------------------------------------------

      const originLocation = await geocodeLocation(origin.trim());

      // -------------------------------------------------
      // GEOCODE DESTINATION
      // -------------------------------------------------

      const destinationLocation = await geocodeLocation(destination.trim());

      // -------------------------------------------------
      // GET ROUTE
      // -------------------------------------------------

      const routeResponse = await axios.post(`${API}/api/travel/route`, {
        origin: [originLocation.longitude, originLocation.latitude],

        destination: [
          destinationLocation.longitude,
          destinationLocation.latitude,
        ],

        transportMode,
      });

      if (!routeResponse.data?.success) {
        throw new Error(
          routeResponse.data?.message || "Unable to calculate route.",
        );
      }

      const route = routeResponse.data.data;

      setRouteData({
        ...route,

        origin: originLocation.name,

        destination: destinationLocation.name,
      });

      // -------------------------------------------------
      // CALCULATE EMISSION
      // -------------------------------------------------

      const calculationResponse = await axios.post(
        `${API}/api/travel/calculate`,
        {
          distance: Number(route.distance),

          transportMode,

          vehicleType,

          passengerCount: Number(passengerCount),
        },
      );

      if (!calculationResponse.data?.success) {
        throw new Error(
          calculationResponse.data?.message || "Unable to calculate emissions.",
        );
      }

      const emission = calculationResponse.data.data;

      setCalculation(emission);

      // -------------------------------------------------
      // COMPARE TRANSPORT MODES
      // -------------------------------------------------

      const comparisonResponse = await axios.post(`${API}/api/travel/compare`, {
        distance: Number(route.distance),

        passengerCount: Number(passengerCount),
      });

      if (comparisonResponse.data?.success) {
        setComparison(comparisonResponse.data.data || []);
      }

      // -------------------------------------------------
      // GET RECOMMENDATION
      // -------------------------------------------------

      const recommendationResponse = await axios.post(
        `${API}/api/travel/recommendation`,
        {
          distance: Number(route.distance),

          currentMode: transportMode,

          passengerCount: Number(passengerCount),
        },
      );

      if (recommendationResponse.data?.success) {
        setRecommendation(
          recommendationResponse.data.data?.recommendation || "",
        );
      }
    } catch (err) {
      console.error("Travel calculation error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to calculate travel emissions. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SAVE TRAVEL RECORD
  // =====================================================

  const saveTravel = async () => {
    if (!routeData || !calculation) {
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const userId = user?._id || user?.id;

      if (!userId) {
        setError("Please log in before saving travel history.");
        return;
      }

      const response = await axios.post(`${API}/api/travel`, {
        userId,

        origin: routeData.origin,

        destination: routeData.destination,

        distance: Number(routeData.distance),

        duration: Number(routeData.duration),

        transportMode,

        vehicleType,

        passengerCount: Number(passengerCount),

        emissionFactor: Number(calculation.emissionFactor),

        estimatedEmission: Number(calculation.totalEmission),
      });

      if (response.data?.success) {
        setError("");

        await loadTravelHistory();

        alert("Travel record saved successfully.");
      }
    } catch (err) {
      console.error("Save travel error:", err);

      setError(err.response?.data?.message || "Unable to save travel record.");
    }
  };

  return (
    <>
      <Navbar />

      <div className="travel-page">
        <div className="travel-container">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="travel-header">
            <h1>Travel Emission Tracker</h1>

            <p>
              Calculate route distance, travel emissions, and sustainable
              alternatives.
            </p>
          </div>

          {/* =================================================
              INPUT FORM
          ================================================= */}

          <div className="travel-card">
            <h2>🚗 Plan Your Journey</h2>

            <form onSubmit={calculateTravel}>
              {/* ORIGIN */}

              <div className="travel-field">
                <label>Origin</label>

                <input
                  type="text"
                  placeholder="Enter starting location"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
              </div>

              {/* DESTINATION */}

              <div className="travel-field">
                <label>Destination</label>

                <input
                  type="text"
                  placeholder="Enter destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>

              {/* TRANSPORT MODE */}

              <div className="travel-field">
                <label>Transport Mode</label>

                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value)}
                >
                  {transportModes.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* VEHICLE TYPE */}

              {(transportMode === "car" || transportMode === "two-wheeler") && (
                <div className="travel-field">
                  <label>Vehicle Type</label>

                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                  >
                    <option value="petrol">Petrol</option>

                    <option value="diesel">Diesel</option>

                    <option value="electric">Electric</option>
                  </select>
                </div>
              )}

              {transportMode === "bus" && (
                <div className="travel-field">
                  <label>Vehicle Type</label>

                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                  >
                    <option value="public">Public Transport</option>
                  </select>
                </div>
              )}

              {/* PASSENGERS */}

              <div className="travel-field">
                <label>Number of Passengers</label>

                <input
                  type="number"
                  min="1"
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(e.target.value)}
                />
              </div>

              {/* ERROR */}

              {error && <div className="travel-error">{error}</div>}

              {/* BUTTON */}

              <button
                type="submit"
                className="travel-button"
                disabled={loading}
              >
                {loading ? "Calculating..." : "Calculate Travel Emissions"}
              </button>
            </form>
          </div>

          {/* =================================================
              ROUTE INFORMATION
          ================================================= */}

          {routeData && (
            <div className="travel-card">
              <h2>🗺️ Route Information</h2>

              <div className="travel-results">
                <div>
                  <strong>Route</strong>

                  <span>
                    {routeData.origin}
                    {" → "}
                    {routeData.destination}
                  </span>
                </div>

                <div>
                  <strong>Distance</strong>

                  <span>{routeData.distance} km</span>
                </div>

                <div>
                  <strong>Estimated Travel Time</strong>

                  <span>{routeData.duration} minutes</span>
                </div>

                <div>
                  <strong>Transport Mode</strong>

                  <span>
                    {
                      transportModes.find(
                        (item) => item.value === transportMode,
                      )?.label
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              CARBON RESULT
          ================================================= */}

          {calculation && (
            <div className="travel-card">
              <h2>🌱 Carbon Calculation</h2>

              <div className="travel-results">
                <div>
                  <strong>Emission Factor</strong>

                  <span>{calculation.emissionFactor} kg CO₂e/km</span>
                </div>

                <div>
                  <strong>Estimated CO₂</strong>

                  <span className="travel-highlight">
                    {calculation.totalEmission} kg CO₂e
                  </span>
                </div>

                <div>
                  <strong>CO₂ per Passenger</strong>

                  <span>{calculation.emissionPerPassenger} kg CO₂e</span>
                </div>
              </div>

              <button className="travel-save-button" onClick={saveTravel}>
                💾 Save Travel Record
              </button>
            </div>
          )}

          {/* =================================================
              TRANSPORT COMPARISON
          ================================================= */}

          {comparison.length > 0 && (
            <div className="travel-card">
              <h2>🌍 Travel Mode Comparison</h2>

              <div className="comparison-list">
                {comparison.map((item) => (
                  <div className="comparison-item" key={item.transportMode}>
                    <div>
                      <strong>
                        {item.transportMode === "car"
                          ? "🚗 Car"
                          : item.transportMode === "two-wheeler"
                            ? "🛵 Two-wheeler"
                            : item.transportMode === "bus"
                              ? "🚌 Bus"
                              : item.transportMode === "ev"
                                ? "⚡ Electric Vehicle"
                                : item.transportMode === "bicycle"
                                  ? "🚲 Bicycle"
                                  : "🚶 Walking"}
                      </strong>

                      <span>{item.emissionFactor} kg CO₂e/km</span>
                    </div>

                    <div className="comparison-emission">
                      <strong>{item.totalEmission} kg CO₂e</strong>

                      <span>{item.emissionPerPassenger} kg/passenger</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================
              RECOMMENDATION
          ================================================= */}

          {recommendation && (
            <div className="travel-card recommendation-card">
              <h2>🌱 Sustainable Travel Recommendation</h2>

              <p>{recommendation}</p>
            </div>
          )}

          {/* =================================================
              TRAVEL HISTORY
          ================================================= */}

          <div className="travel-card travel-history">
            <h2>📋 Travel History</h2>

            {travelHistory.length === 0 ? (
              <p>No travel records found.</p>
            ) : (
              <div className="history-table-wrapper">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>

                      <th>Route</th>

                      <th>Mode</th>

                      <th>Distance</th>

                      <th>CO₂</th>
                    </tr>
                  </thead>

                  <tbody>
                    {travelHistory.map((travel) => (
                      <tr key={travel._id}>
                        <td>
                          {travel.createdAt
                            ? new Date(travel.createdAt).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>
                          {travel.origin} → {travel.destination}
                        </td>

                        <td>{travel.transportMode}</td>

                        <td>{Number(travel.distance || 0).toFixed(2)} km</td>

                        <td>
                          {Number(travel.estimatedEmission || 0).toFixed(2)} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
