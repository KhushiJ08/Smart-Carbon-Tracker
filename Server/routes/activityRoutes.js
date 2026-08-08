const express = require("express");

const {
  addActivity,
  getActivities,
  getActivitiesByUser,
  updateActivity,
  deleteActivity,
} = require("../controllers/activityController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, addActivity);

router.get("/", getActivities);

router.get("/:userId", protect, getActivitiesByUser);

router.put("/:id", protect, updateActivity);

router.delete("/:id", protect, deleteActivity);

module.exports = router;
