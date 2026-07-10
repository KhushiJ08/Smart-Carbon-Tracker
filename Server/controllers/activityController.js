const Activity = require("../models/Activity");

// Add Activity
const addActivity = async (req, res) => {
  try {
    const activity = await Activity.create(req.body);

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Activities
const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find().sort({
      date: -1,
    });

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Activities By User
const getActivitiesByUser = async (req, res) => {
  try {
    const activities = await Activity.find({
      userId: req.params.userId,
    }).sort({
      date: -1,
    });

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addActivity,
  getActivities,
  getActivitiesByUser,
};
