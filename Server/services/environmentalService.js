const axios = require("axios");

const EnvironmentalData = require("../models/EnvironmentalData");
const { getAQIData } = require("./airQualityService");

const updateEnvironmentalData = async (city) => {
  try {
    // =========================
    // 1. Find city coordinates
    // =========================
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

    // =========================
    // 2. Get weather data
    // =========================
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

    // =========================
    // 3. Get air quality data
    // =========================
    const airQuality = await getAQIData(city);

    // =========================
    // 4. Convert weather code
    // =========================
    let weatherCondition = "Unknown";

    if (weather.weather_code === 0) {
      weatherCondition = "Clear";
    } else if (weather.weather_code <= 3) {
      weatherCondition = "Cloudy";
    } else if (weather.weather_code <= 48) {
      weatherCondition = "Foggy";
    } else if (weather.weather_code <= 67) {
      weatherCondition = "Rain";
    } else if (weather.weather_code <= 77) {
      weatherCondition = "Snow";
    } else if (weather.weather_code <= 82) {
      weatherCondition = "Rain Showers";
    } else if (weather.weather_code <= 99) {
      weatherCondition = "Thunderstorm";
    }

    // =========================
    // 5. Save to MongoDB
    // =========================
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

module.exports = {
  updateEnvironmentalData,
};
