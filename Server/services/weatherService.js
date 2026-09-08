const axios = require("axios");

const getWeatherData = async (city) => {
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: city,
          appid: process.env.OPENWEATHER_API_KEY,
          units: "metric",
        },
      },
    );

    const data = response.data;

    return {
      city: data.name,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      weather: data.weather[0].main,
      pressure: data.main.pressure,
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error("City not found");
    }

    if (error.response && error.response.status === 401) {
      throw new Error("Invalid OpenWeather API key");
    }

    throw new Error("Unable to fetch weather data");
  }
};

module.exports = { getWeatherData };
