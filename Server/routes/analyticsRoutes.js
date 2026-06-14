const express = require("express");
const router = express.Router();
const { getRecommendations } = require("../controllers/analyticsController");

const {
  getTotalEmission,
  getCategoryEmission,
  getTrends,
  getComparison,
  getInsights,
} = require("../controllers/analyticsController");

router.get("/insights", getInsights);

router.get("/total", getTotalEmission);
router.get("/category", getCategoryEmission);
router.get("/trends", getTrends);
router.get("/comparison", getComparison);
router.get("/recommendations", getRecommendations);

router.get("/predict", async (req, res) => {
  try {
    // Dummy prediction (for now)
    const prediction = 120;

    res.json({
      prediction,
      confidence: "High",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
