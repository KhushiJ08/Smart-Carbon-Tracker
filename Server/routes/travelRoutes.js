const express = require("express");
const router = express.Router();

const Travel = require("../models/Travel");
const { protect } = require("../middleware/authMiddleware");

const { getRoute } = require("../services/routingService");

const {
  calculateEmission,
  compareTransportModes,
  getRecommendation,
} = require("../services/carbonCalculator");

const getUserId = (req) => {
  return (
    req.user?._id ||
    req.user?.id ||
    req.user?.userId ||
    req.body?.userId ||
    req.query?.userId ||
    null
  );
};

// =====================================================
// CALCULATE ROUTE
// =====================================================

router.post("/route", async (req, res) => {
  try {
    const { origin, destination, transportMode } = req.body;

    if (!origin || !origin.trim() || !destination || !destination.trim()) {
      return res.status(400).json({
        success: false,
        message: "Origin and destination are required",
      });
    }

    const result = await getRoute({
      origin: origin.trim(),
      destination: destination.trim(),
      transportMode,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Route calculation error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to calculate route",
    });
  }
});

// =====================================================
// CALCULATE EMISSIONS
// =====================================================

router.post("/calculate", async (req, res) => {
  try {
    const { distance, transportMode, vehicleType, passengerCount } = req.body;

    const result = calculateEmission({
      distance,
      transportMode,
      vehicleType,
      passengerCount,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Emission calculation error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to calculate emissions",
    });
  }
});

// =====================================================
// COMPARE TRANSPORT MODES
// =====================================================

router.post("/compare", async (req, res) => {
  try {
    const { distance, passengerCount } = req.body;

    const result = compareTransportModes({
      distance,
      passengerCount,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Transport comparison error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to compare transport modes",
    });
  }
});

// =====================================================
// SUSTAINABLE RECOMMENDATION
// =====================================================

router.post("/recommendation", async (req, res) => {
  try {
    const { distance, currentMode, passengerCount } = req.body;

    const result = getRecommendation({
      distance,
      currentMode,
      passengerCount,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Recommendation error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to generate recommendation",
    });
  }
});

// =====================================================
// SAVE TRAVEL RECORD
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      userId,
      origin,
      destination,
      distance,
      duration,
      transportMode,
      vehicleType,
      passengerCount,
      emissionFactor,
      estimatedEmission,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!origin || !origin.trim()) {
      return res.status(400).json({
        success: false,
        message: "Origin is required",
      });
    }

    if (!destination || !destination.trim()) {
      return res.status(400).json({
        success: false,
        message: "Destination is required",
      });
    }

    if (distance === undefined || distance === null || Number(distance) < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid distance is required",
      });
    }

    if (!transportMode) {
      return res.status(400).json({
        success: false,
        message: "Transport mode is required",
      });
    }

    if (
      estimatedEmission === undefined ||
      estimatedEmission === null ||
      Number(estimatedEmission) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid estimated emission is required",
      });
    }

    const travel = await Travel.create({
      userId,
      origin: origin.trim(),
      destination: destination.trim(),
      distance: Number(distance),
      duration: Number(duration) || 0,
      transportMode,
      vehicleType,
      passengerCount: Number(passengerCount) || 1,
      emissionFactor: Number(emissionFactor) || 0,
      estimatedEmission: Number(estimatedEmission),
    });

    return res.status(201).json({
      success: true,
      message: "Travel record saved successfully",
      data: travel,
    });
  } catch (error) {
    console.error("Save travel error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to save travel record",
    });
  }
});

// =====================================================
// GET AUTHENTICATED USER'S TRAVEL HISTORY
// =====================================================

router.get("/history", protect, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication is required",
      });
    }

    const history = await Travel.find({
      userId,
    }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Travel history error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to retrieve travel history",
    });
  }
});

module.exports = router;
