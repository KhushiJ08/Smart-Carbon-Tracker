const axios = require("axios");

const EnvironmentalData = require("../models/EnvironmentalData");

const { getAQIData, getAQIDataByCoordinates } = require("./airQualityService");

// ======================================================
// CACHE SETTINGS
// ======================================================

// Keep API data for 15 minutes
const CACHE_DURATION = 15 * 60 * 1000;

// ======================================================
// Convert Open-Meteo weather code into readable text
// ======================================================

const getWeatherCondition = (weatherCode) => {
  if (weatherCode === 0) {
    return "Clear";
  } else if (weatherCode <= 3) {
    return "Cloudy";
  } else if (weatherCode <= 48) {
    return "Foggy";
  } else if (weatherCode <= 67) {
    return "Rain";
  } else if (weatherCode <= 77) {
    return "Snow";
  } else if (weatherCode <= 82) {
    return "Rain Showers";
  } else if (weatherCode <= 99) {
    return "Thunderstorm";
  }

  return "Unknown";
};

// ======================================================
// Check whether recent cached data exists
// ======================================================

const getCachedEnvironmentalData = async (city) => {
  if (!city) {
    return null;
  }

  const latestData = await EnvironmentalData.findOne({
    city: city,
  }).sort({
    timestamp: -1,
  });

  if (!latestData) {
    return null;
  }

  const age = Date.now() - new Date(latestData.timestamp).getTime();

  if (age <= CACHE_DURATION) {
    console.log(`Using cached environmental data for ${city}`);

    return latestData;
  }

  return null;
};

// ======================================================
// Get last saved data
// Used as fallback if API temporarily fails
// ======================================================

const getLastSavedEnvironmentalData = async (city) => {
  if (!city) {
    return null;
  }

  const latestData = await EnvironmentalData.findOne({
    city: city,
  }).sort({
    timestamp: -1,
  });

  return latestData;
};

// ======================================================
// Existing city-based update
// ======================================================

const updateEnvironmentalData = async (city) => {
  try {
    // ==================================================
    // 0. Check 15-minute cache
    // ==================================================

    const cachedData = await getCachedEnvironmentalData(city);

    if (cachedData) {
      return cachedData;
    }

    // ==================================================
    // 1. Find city coordinates
    // ==================================================

    const geoResponse = await axios.get(
      "https://geocoding-api.open-meteo.com/v1/search",
      {
        params: {
          name: city,
          count: 1,
          language: "en",
          format: "json",
        },
      },
    );

    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      throw new Error("City not found");
    }

    const location = geoResponse.data.results[0];

    // ==================================================
    // 2. Get weather
    // ==================================================

    const weatherResponse = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          current:
            "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
          timezone: "auto",
        },
      },
    );

    const weather = weatherResponse.data.current;

    // ==================================================
    // 3. Get AQI
    // ==================================================

    let airQuality;

    try {
      airQuality = await getAQIData(city);
    } catch (aqiError) {
      console.error("AQI API error:", aqiError.message);

      // Try using previously saved data
      const lastSavedData = await getLastSavedEnvironmentalData(city);

      if (lastSavedData) {
        console.log(
          `Using last saved AQI data for ${city} because AQI API failed`,
        );

        return lastSavedData;
      }

      throw aqiError;
    }

    // ==================================================
    // 4. Convert weather code
    // ==================================================

    const weatherCondition = getWeatherCondition(weather.weather_code);

    // ==================================================
    // 5. Save data
    // ==================================================

    const environmentalData = await EnvironmentalData.create({
      city: location.name,
      temperature: weather.temperature_2m,
      humidity: weather.relative_humidity_2m,
      AQI: airQuality.AQI,
      PM25: airQuality.PM25,
      PM10: airQuality.PM10,
      weather: weatherCondition,
      timestamp: new Date(),
    });

    console.log(`Environmental data saved for ${location.name}`);

    return environmentalData;
  } catch (error) {
    console.error("Environmental update error:", error.message);

    throw new Error(
      error.response?.data?.reason ||
        error.message ||
        "Unable to update environmental data",
    );
  }
};

// ======================================================
// GPS / COORDINATE BASED UPDATE
// ======================================================

const updateEnvironmentalDataByCoordinates = async (
  city,
  latitude,
  longitude,
) => {
  try {
    // ==================================================
    // Validate coordinates
    // ==================================================

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      throw new Error("Valid latitude and longitude are required");
    }

    if (latitude < -90 || latitude > 90) {
      throw new Error("Invalid latitude");
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error("Invalid longitude");
    }

    const detectedCity = city || "Current Location";

    // ==================================================
    // 0. Check 15-minute cache
    // ==================================================

    const cachedData = await getCachedEnvironmentalData(detectedCity);

    if (cachedData) {
      console.log(
        `Returning cached GPS environmental data for ${detectedCity}`,
      );

      return cachedData;
    }

    // ==================================================
    // 1. Get weather directly from GPS coordinates
    // ==================================================

    const weatherResponse = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude,
          longitude,
          current:
            "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
          timezone: "auto",
        },
      },
    );

    const weather = weatherResponse.data.current;

    // ==================================================
    // 2. Get AQI directly from GPS coordinates
    // ==================================================

    let airQuality;

    try {
      airQuality = await getAQIDataByCoordinates(
        latitude,
        longitude,
        detectedCity,
      );
    } catch (aqiError) {
      console.error("GPS AQI API error:", aqiError.message);

      // ==================================================
      // If AQI API fails, use previous saved data
      // ==================================================

      const lastSavedData = await getLastSavedEnvironmentalData(detectedCity);

      if (lastSavedData) {
        console.log(`Using last saved GPS AQI data for ${detectedCity}`);

        return lastSavedData;
      }

      // No previous data exists
      throw aqiError;
    }

    // ==================================================
    // 3. Convert weather code
    // ==================================================

    const weatherCondition = getWeatherCondition(weather.weather_code);

    // ==================================================
    // 4. Save environmental data
    // ==================================================

    const environmentalData = await EnvironmentalData.create({
      city: detectedCity,
      temperature: weather.temperature_2m,
      humidity: weather.relative_humidity_2m,
      AQI: airQuality.AQI,
      PM25: airQuality.PM25,
      PM10: airQuality.PM10,
      weather: weatherCondition,
      timestamp: new Date(),
    });

    // ==================================================
    // 5. Log successful GPS update
    // ==================================================

    console.log(
      `Environmental data saved for ${detectedCity} (${latitude}, ${longitude})`,
    );

    return environmentalData;
  } catch (error) {
    console.error("Coordinate environmental update error:", error.message);

    throw new Error(
      error.response?.data?.reason ||
        error.message ||
        "Unable to update environmental data",
    );
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  updateEnvironmentalData,
  updateEnvironmentalDataByCoordinates,
};
