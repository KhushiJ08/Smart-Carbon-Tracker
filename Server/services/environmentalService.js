const axios = require("axios");
const EnvironmentalData = require("../models/EnvironmentalData");
const { getAQIData } = require("./airQualityService");

const updateEnvironmentalData = async (city) => {
  try {
    // Get weather data from Open-Meteo
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

    const { latitude, longitude, name } = geoResponse.data.results[0];

    const weatherResponse = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude,
          longitude,
          current:
            "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
          timezone: "auto",
        },
      },
    );

    const weather = weatherResponse.data.current;

    // Get air quality data
    const airQuality = await getAQIData(city);

    const environmentalData = new EnvironmentalData({
      city: name,
      temperature: weather.temperature_2m,
      humidity: weather.relative_humidity_2m,
      AQI: airQuality.AQI,
      PM25: airQuality.PM2_5,
      PM10: airQuality.PM10,
      weather: String(weather.weather_code),
      timestamp: new Date(),
    });

    await environmentalData.save();

    return environmentalData;
  } catch (error) {
    throw new Error(
      error.response?.data?.reason ||
        error.message ||
        "Unable to save environmental data",
    );
  }
};

module.exports = { updateEnvironmentalData };
