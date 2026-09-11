const axios = require("axios");

const EnvironmentalData = require("../models/EnvironmentalData");

const { getAQIData, getAQIDataByCoordinates } = require("./airQualityService");

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
// Existing city-based update
// Keeps the old functionality working
// ======================================================

const updateEnvironmentalData = async (city) => {
  try {
    // 1. Find city coordinates
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

    // 2. Get weather
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

    // 3. Get AQI
    const airQuality = await getAQIData(city);

    // 4. Convert weather code
    const weatherCondition = getWeatherCondition(weather.weather_code);

    // 5. Save data
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
// NEW: Update environmental data using GPS coordinates
// ======================================================

const updateEnvironmentalDataByCoordinates = async (
  city,
  latitude,
  longitude,
) => {
  try {
    // Validate coordinates
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      throw new Error("Valid latitude and longitude are required");
    }

    if (latitude < -90 || latitude > 90) {
      throw new Error("Invalid latitude");
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error("Invalid longitude");
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

    const airQuality = await getAQIDataByCoordinates(latitude, longitude, city);

    // ==================================================
    // 3. Convert weather code
    // ==================================================

    const weatherCondition = getWeatherCondition(weather.weather_code);

    // ==================================================
    // 4. Save environmental data
    // ==================================================

    const environmentalData = await EnvironmentalData.create({
      city: city || "Current Location",
      temperature: weather.temperature_2m,
      humidity: weather.relative_humidity_2m,
      AQI: airQuality.AQI,
      PM25: airQuality.PM25,
      PM10: airQuality.PM10,
      weather: weatherCondition,
      timestamp: new Date(),
    });

    console.log(
      `Environmental data saved for ${city} (${latitude}, ${longitude})`,
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

module.exports = {
  updateEnvironmentalData,
  updateEnvironmentalDataByCoordinates,
};
