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
    console.error("Environmental update route error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ======================================================
// Update environmental data using GPS coordinates
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
    }).sort({
      timestamp: -1,
    });

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
    }).sort({
      timestamp: 1,
    });

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
    }).sort({
      timestamp: 1,
    });

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
      (sum, item) => sum + Number(item.temperature || 0),
      0,
    );

    const totalHumidity = data.reduce(
      (sum, item) => sum + Number(item.humidity || 0),
      0,
    );

    const totalAQI = data.reduce((sum, item) => sum + Number(item.AQI || 0), 0);

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

    // --------------------------------------------------
    // Check cities parameter
    // --------------------------------------------------

    if (!citiesParam) {
      return res.status(400).json({
        success: false,
        message: "Please provide cities to compare",
      });
    }

    // --------------------------------------------------
    // Convert comma-separated cities into an array
    //
    // Example:
    // ?cities=Delhi,Lucknow,Mumbai
    // --------------------------------------------------

    const cities = citiesParam
      .split(",")
      .map((city) => city.trim())
      .filter((city) => city.length > 0);

    // --------------------------------------------------
    // At least two cities are required
    // --------------------------------------------------

    if (cities.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least two cities",
      });
    }

    // --------------------------------------------------
    // Remove duplicate cities
    // --------------------------------------------------

    const uniqueCities = [];

    cities.forEach((city) => {
      const alreadyExists = uniqueCities.some(
        (existingCity) => existingCity.toLowerCase() === city.toLowerCase(),
      );

      if (!alreadyExists) {
        uniqueCities.push(city);
      }
    });

    // --------------------------------------------------
    // Find existing environmental data
    // --------------------------------------------------

    const results = await EnvironmentalData.find({
      city: {
        $in: uniqueCities,
      },
    }).sort({
      timestamp: -1,
    });

    // --------------------------------------------------
    // Keep only latest record for each city
    // --------------------------------------------------

    const latestByCity = {};

    results.forEach((item) => {
      if (!latestByCity[item.city]) {
        latestByCity[item.city] = item;
      }
    });

    // --------------------------------------------------
    // Check every requested city
    // --------------------------------------------------

    for (const city of uniqueCities) {
      const existingData = latestByCity[city];

      // ------------------------------------------------
      // If data exists, check its age
      // ------------------------------------------------

      if (existingData) {
        const timestamp = new Date(existingData.timestamp).getTime();

        const age = Date.now() - timestamp;

        // One hour
        const oneHour = 60 * 60 * 1000;

        // ------------------------------------------------
        // Use cached data if it is less than one hour old
        // ------------------------------------------------

        if (age < oneHour) {
          console.log(`Using cached AQI data for ${city}`);

          continue;
        }
      }

      // ------------------------------------------------
      // City has no data OR old data
      //
      // Try to fetch fresh data
      // ------------------------------------------------

      try {
        console.log(`Fetching fresh environmental data for ${city}`);

        const freshData = await updateEnvironmentalData(city);

        latestByCity[city] = freshData;

        console.log(`Environmental data updated for ${city}`);
      } catch (error) {
        console.error(`Unable to update ${city}:`, error.message);

        // ------------------------------------------------
        // If fresh API request fails but old data exists,
        // keep the old database value.
        // ------------------------------------------------

        if (!existingData) {
          latestByCity[city] = null;
        }
      }
    }

    // --------------------------------------------------
    // Build final comparison response
    // --------------------------------------------------

    const comparison = uniqueCities.map((city) => {
      const data = latestByCity[city];

      // ------------------------------------------------
      // No data available
      // ------------------------------------------------

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

      // ------------------------------------------------
      // Data available
      // ------------------------------------------------

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

    // --------------------------------------------------
    // Sort available cities by AQI
    //
    // Lower AQI = better air quality
    // --------------------------------------------------

    comparison.sort((a, b) => {
      // Both unavailable
      if (!a.available && !b.available) {
        return 0;
      }

      // Put unavailable cities at the bottom
      if (!a.available) {
        return 1;
      }

      if (!b.available) {
        return -1;
      }

      // Lowest AQI first
      return a.AQI - b.AQI;
    });

    // --------------------------------------------------
    // Send response
    // --------------------------------------------------

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

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;
