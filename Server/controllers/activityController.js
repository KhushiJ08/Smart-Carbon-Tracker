const Activity = require("../models/Activity");

// Add activity
const addActivity = async (req, res) => {
  try {
    const activity = await Activity.create(req.body);
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get activities by userId
const getActivitiesByUser = async (req, res) => {
  try {
    const activities = await Activity.find({
      userId: req.params.userId,
    });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addActivity,
  getActivitiesByUser,
};
