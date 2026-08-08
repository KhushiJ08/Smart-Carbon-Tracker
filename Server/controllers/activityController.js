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

// Update Activity
const updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Activity
const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    res.status(200).json({
      message: "Activity deleted successfully",
    });
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
  updateActivity,
  deleteActivity,
};
