const express = require("express");
const router = express.Router();

const EnvironmentalData = require("../models/EnvironmentalData");

const {
  updateEnvironmentalData,
  updateEnvironmentalDataByCoordinates,
} = require("../services/environmentalService");

const COMPARISON_CACHE_DURATION = 60 * 60 * 1000;

const normalizeCity = (city) => {
  return String(city || "")
    .trim()
    .toLowerCase();
};

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getLatestEnvironmentalData = async (city) => {
  const normalizedCity = String(city || "").trim();

  if (!normalizedCity) {
    return null;
  }

  return EnvironmentalData.findOne({
    city: {
      $regex: `^${escapeRegex(normalizedCity)}$`,
      $options: "i",
    },
  }).sort({
    timestamp: -1,
  });
};

// Update environmental data using city name
router.get("/update/:city", async (req, res) => {
  try {
    const city = String(req.params.city || "").trim();

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City name is required",
      });
    }

    const data = await updateEnvironmentalData(city);

    return res.json({
      success: true,
      message: "Environmental data saved successfully",
      data,
    });
  } catch (error) {
    console.error("Environmental update route error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update environmental data using GPS coordinates
router.post("/update-by-location", async (req, res) => {
  try {
    const { city, latitude, longitude } = req.body;

    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (
      latitude === undefined ||
      longitude === undefined ||
      latitude === null ||
      longitude === null ||
      !Number.isFinite(parsedLatitude) ||
      !Number.isFinite(parsedLongitude)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
      });
    }

    const data = await updateEnvironmentalDataByCoordinates(
      city,
      parsedLatitude,
      parsedLongitude,
    );

    return res.json({
      success: true,
      message: "Environmental data for current location saved successfully",
      data,
    });
  } catch (error) {
    console.error("Location environmental route error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Latest environmental data
router.get("/latest/:city", async (req, res) => {
  try {
    const data = await getLatestEnvironmentalData(req.params.city);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Latest environmental data error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Weekly environmental data
router.get("/weekly/:city", async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const cityRegex = new RegExp(
      `^${escapeRegex(String(req.params.city || "").trim())}$`,
      "i",
    );

    const data = await EnvironmentalData.find({
      city: cityRegex,
      timestamp: {
        $gte: sevenDaysAgo,
      },
    }).sort({
      timestamp: 1,
    });

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Monthly environmental data
router.get("/monthly/:city", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const cityRegex = new RegExp(
      `^${escapeRegex(String(req.params.city || "").trim())}$`,
      "i",
    );

    const data = await EnvironmentalData.find({
      city: cityRegex,
      timestamp: {
        $gte: thirtyDaysAgo,
      },
    }).sort({
      timestamp: 1,
    });

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Environmental trend
router.get("/trend-data/:city", async (req, res) => {
  try {
    const cityRegex = new RegExp(
      `^${escapeRegex(String(req.params.city || "").trim())}$`,
      "i",
    );

    const data = await EnvironmentalData.find({
      city: cityRegex,
    }).sort({
      timestamp: 1,
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
      city: data[data.length - 1].city,
      averageTemperature: Number((totalTemperature / data.length).toFixed(2)),
      averageHumidity: Number((totalHumidity / data.length).toFixed(2)),
      averageAQI: Number((totalAQI / data.length).toFixed(2)),
      records: data.length,
    };

    return res.json({
      success: true,
      data: trend,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// AQI comparison between multiple cities
router.get("/compare-aqi", async (req, res) => {
  try {
    const citiesParam = req.query.cities;

    if (typeof citiesParam !== "string" || !citiesParam.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide cities to compare",
      });
    }

    const cities = citiesParam
      .split(",")
      .map((city) => city.trim())
      .filter(Boolean);

    const uniqueCities = [
      ...new Map(cities.map((city) => [normalizeCity(city), city])).values(),
    ];

    if (uniqueCities.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least two different cities",
      });
    }

    const cityRegexes = uniqueCities.map(
      (city) => new RegExp(`^${escapeRegex(city)}$`, "i"),
    );

    const results = await EnvironmentalData.find({
      city: {
        $in: cityRegexes,
      },
    }).sort({
      timestamp: -1,
    });

    const latestByCity = {};

    for (const item of results) {
      const cityKey = normalizeCity(item.city);

      if (!latestByCity[cityKey]) {
        latestByCity[cityKey] = item;
      }
    }

    for (const city of uniqueCities) {
      const cityKey = normalizeCity(city);
      const existingData = latestByCity[cityKey];

      let dataIsFresh = false;

      if (existingData && existingData.timestamp) {
        const age = Date.now() - new Date(existingData.timestamp).getTime();

        dataIsFresh =
          Number.isFinite(age) && age >= 0 && age < COMPARISON_CACHE_DURATION;
      }

      if (dataIsFresh) {
        console.log(`Using cached environmental data for ${city}`);
        continue;
      }

      try {
        console.log(`Updating environmental data for ${city}`);

        const freshData = await updateEnvironmentalData(city);

        if (freshData) {
          latestByCity[cityKey] = freshData;
        }
      } catch (error) {
        console.error(
          `Unable to update environmental data for ${city}:`,
          error.message,
        );

        // Keep the existing saved record, if available.
        // Never substitute data belonging to another city.
        if (!existingData) {
          latestByCity[cityKey] = null;
        }
      }
    }

    const comparison = uniqueCities.map((city) => {
      const data = latestByCity[normalizeCity(city)];

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
          timestamp: null,
          message: "No environmental data available for this city",
        };
      }

      return {
        city,
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

    comparison.sort((a, b) => {
      if (!a.available && !b.available) {
        return 0;
      }

      if (!a.available) {
        return 1;
      }

      if (!b.available) {
        return -1;
      }

      return Number(a.AQI) - Number(b.AQI);
    });

    return res.json({
      success: true,
      cities: comparison,
    });
  } catch (error) {
    console.error("AQI comparison error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to compare AQI",
    });
  }
});

module.exports = router;
