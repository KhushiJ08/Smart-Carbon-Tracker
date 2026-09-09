const axios = require("axios");
const { classifyAQI } = require("../utils/aqiClassification");

const getAQIData = async (city) => {
  try {
    // Find city coordinates
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

    // Get current air-quality data
    const aqiResponse = await axios.get(
      "https://air-quality-api.open-meteo.com/v1/air-quality",
      {
        params: {
          latitude,
          longitude,
          current:
            "us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide",
          timezone: "auto",
        },
      },
    );

    const data = aqiResponse.data.current;
    const classification = classifyAQI(data.us_aqi);

    return {
      city: name,
      AQI: data.us_aqi,
      classification: classification.status,
      level: classification.level,
      PM2_5: data.pm2_5,
      PM10: data.pm10,
      CO: data.carbon_monoxide,
      NO2: data.nitrogen_dioxide,
      O3: data.ozone,
      SO2: data.sulphur_dioxide,
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.reason ||
        error.message ||
        "Unable to fetch air quality data",
    );
  }
};

module.exports = { getAQIData };
