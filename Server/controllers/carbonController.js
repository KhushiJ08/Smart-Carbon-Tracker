exports.calculateCarbon = async (req, res) => {
  try {
    const { userId } = req.body;

    const mockCarbonData = {
      userId,
      totalEmissions: 50,
      breakdown: {
        transport: 20,
        electricity: 20,
        food: 10,
      },
    };

    res.status(200).json({
      message: "Carbon footprint calculated (mock mode)",
      data: mockCarbonData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/carbonController.js
// NOTE: Mock implementation used since database integration is pending

exports.calculateCarbon = async (req, res) => {
  try {
    const { userId } = req.body;

    const mockCarbonData = {
      userId,
      totalEmissions: 50,
      breakdown: {
        transport: 20,
        electricity: 20,
        food: 10,
      },
    };

    res.status(200).json({
      message: "Carbon footprint calculated (mock mode)",
      data: mockCarbonData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/activityController.js

let mockActivities = []; // in-memory storage (NO DB)

exports.addActivity = async (req, res) => {
  try {
    const { userId, category, description, activityData, date } = req.body;

    if (!userId || !category || !activityData) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    const newActivity = {
      id: mockActivities.length + 1,
      userId,
      category,
      description,
      activityData,
      date: date || new Date(),
    };

    mockActivities.push(newActivity);

    res.status(201).json({
      message: "Activity added successfully (mock)",
      data: newActivity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActivitiesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const userActivities = mockActivities.filter(
      (activity) => activity.userId === userId
    );

    res.status(200).json({
      message: "Activities fetched successfully (mock)",
      data: userActivities,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
