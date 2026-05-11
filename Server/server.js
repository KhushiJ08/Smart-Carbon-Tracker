const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Routes
const carbonRoutes = require("./routes/carbonRoutes");
const activityRoutes = require("./routes/activityRoutes");

app.use("/api/carbon", carbonRoutes);
app.use("/api/activities", activityRoutes);

// Health route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Root route
app.get("/", (req, res) => {
  res.send("API running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
