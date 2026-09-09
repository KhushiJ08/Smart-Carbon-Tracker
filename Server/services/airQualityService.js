const axios = require("axios");

const getAQIData = async (city) => {
  try {
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

    const aqiResponse = await axios.get(
      "https://air-quality-api.open-meteo.com/v1/air-quality",
      {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          current:
            "us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide",
          timezone: "auto",
        },
      },
    );

    const data = aqiResponse.data.current;

    return {
      city: location.name,
      AQI: data.us_aqi,
      PM25: data.pm2_5,
      PM10: data.pm10,
      CO: data.carbon_monoxide,
      NO2: data.nitrogen_dioxide,
      O3: data.ozone,
      SO2: data.sulphur_dioxide,
    };
  } catch (error) {
    console.error("AQI Error:", error.message);

    throw new Error(
      error.response?.data?.reason ||
        error.message ||
        "Unable to fetch air quality data",
    );
  }
};

module.exports = { getAQIData };
