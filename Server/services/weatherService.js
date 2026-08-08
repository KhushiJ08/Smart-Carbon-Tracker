const getWeatherData = async () => {
  try {
    return {
      success: true,
      message: "Weather service is ready for future API integration.",
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { getWeatherData };
