console.log("✅ activityRoutes loaded");
const express = require("express");
const {
  addActivity,
  getActivitiesByUser,
} = require("../controllers/activityController");

const router = express.Router();

// Add a new activity (mock)
router.post("/add", addActivity);

// Get activities by userId (mock)
router.get("/:userId", getActivitiesByUser);

module.exports = router;
