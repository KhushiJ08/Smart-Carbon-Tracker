const express = require("express");
const router = express.Router();

const { getAQIData } = require("../services/airQualityService");

router.get("/:city", async (req, res) => {
  try {
    const data = await getAQIData(req.params.city);

    res.json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
