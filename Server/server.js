const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// =========================
// Import Routes
// =========================
const userRoutes = require("./routes/userRoutes");
const carbonRoutes = require("./routes/carbonRoutes");
const activityRoutes = require("./routes/activityRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

// =========================
// API Routes
// =========================
app.use("/api/users", userRoutes);
app.use("/api/carbon", carbonRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/recommendations", recommendationRoutes);

// =========================
// Health Check
// =========================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Smart Carbon Tracker API is running",
  });
});

// =========================
// Root Route
// =========================
app.get("/", (req, res) => {
  res.send("🌱 Smart Carbon Tracker Backend Running");
});

// =========================
// 404 Handler
// =========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// =========================
// Start Server
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
