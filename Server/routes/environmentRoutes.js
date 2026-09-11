const express = require("express");
const router = express.Router();

const EnvironmentalData = require("../models/EnvironmentalData");

const {
  updateEnvironmentalData,
  updateEnvironmentalDataByCoordinates,
} = require("../services/environmentalService");

// ======================================================
// Update environmental data using city name
// ======================================================

router.get("/update/:city", async (req, res) => {
  try {
    const data = await updateEnvironmentalData(req.params.city);

    res.json({
      success: true,
      message: "Environmental data saved successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ======================================================
// NEW: Update environmental data using GPS coordinates
// ======================================================

router.post("/update-by-location", async (req, res) => {
  try {
    const { city, latitude, longitude } = req.body;

    const data = await updateEnvironmentalDataByCoordinates(
      city,
      Number(latitude),
      Number(longitude),
    );

    res.json({
      success: true,
      message: "Environmental data for current location saved successfully",
      data,
    });
  } catch (error) {
    console.error("Location environmental route error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ======================================================
// Latest environmental data
// ======================================================

router.get("/latest/:city", async (req, res) => {
  try {
    const data = await EnvironmentalData.findOne({
      city: req.params.city,
    }).sort({ timestamp: -1 });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ======================================================
// Weekly environmental data
// ======================================================

router.get("/weekly/:city", async (req, res) => {
  try {
    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const data = await EnvironmentalData.find({
      city: req.params.city,
      timestamp: {
        $gte: sevenDaysAgo,
      },
    }).sort({ timestamp: 1 });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ======================================================
// Monthly environmental data
// ======================================================

router.get("/monthly/:city", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const data = await EnvironmentalData.find({
      city: req.params.city,
      timestamp: {
        $gte: thirtyDaysAgo,
      },
    }).sort({ timestamp: 1 });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ======================================================
// Environmental trend
// ======================================================

router.get("/trend-data/:city", async (req, res) => {
  try {
    const data = await EnvironmentalData.find({
      city: req.params.city,
    });

    if (data.length === 0) {
      return res.json({
        success: true,
        message: "No environmental data available",
        data: null,
      });
    }

    const totalTemperature = data.reduce(
      (sum, item) => sum + item.temperature,
      0,
    );

    const totalHumidity = data.reduce((sum, item) => sum + item.humidity, 0);

    const totalAQI = data.reduce((sum, item) => sum + item.AQI, 0);

    const trend = {
      city: req.params.city,

      averageTemperature: Number((totalTemperature / data.length).toFixed(2)),

      averageHumidity: Number((totalHumidity / data.length).toFixed(2)),

      averageAQI: Number((totalAQI / data.length).toFixed(2)),

      records: data.length,
    };

    res.json({
      success: true,
      data: trend,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// ======================================================
// AQI COMPARISON BETWEEN MULTIPLE CITIES
// ======================================================

router.get("/compare-aqi", async (req, res) => {
  try {
    const citiesParam = req.query.cities;

    if (!citiesParam) {
      return res.status(400).json({
        success: false,
        message: "Please provide cities to compare",
      });
    }

    const cities = citiesParam
      .split(",")
      .map((city) => city.trim())
      .filter((city) => city.length > 0);

    if (cities.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least two cities",
      });
    }

    const results = await EnvironmentalData.find({
      city: {
        $in: cities,
      },
    }).sort({
      timestamp: -1,
    });

    // Keep only the latest record for each city
    const latestByCity = {};

    results.forEach((item) => {
      if (!latestByCity[item.city]) {
        latestByCity[item.city] = item;
      }
    });

    const comparison = cities.map((city) => {
      const data = latestByCity[city];

      if (!data) {
        return {
          city,
          available: false,
          AQI: null,
          PM25: null,
          PM10: null,
          temperature: null,
          humidity: null,
          weather: null,
        };
      }

      return {
        city: data.city,
        available: true,
        AQI: data.AQI,
        PM25: data.PM25,
        PM10: data.PM10,
        temperature: data.temperature,
        humidity: data.humidity,
        weather: data.weather,
        timestamp: data.timestamp,
      };
    });

    // Sort cities with available AQI from lowest to highest
    comparison.sort((a, b) => {
      if (!a.available) return 1;
      if (!b.available) return -1;

      return a.AQI - b.AQI;
    });

    res.json({
      success: true,
      cities: comparison,
    });
  } catch (error) {
    console.error("AQI comparison error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to compare AQI",
    });
  }
});

module.exports = router;
