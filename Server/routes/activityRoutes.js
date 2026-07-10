const express = require("express");

const {
  addActivity,
  getActivities,
  getActivitiesByUser,
} = require("../controllers/activityController");

const router = express.Router();

router.post("/add", addActivity);

router.get("/", getActivities);

router.get("/:userId", getActivitiesByUser);

module.exports = router;
