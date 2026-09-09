const classifyAQI = (aqi) => {
  if (aqi <= 50) {
    return {
      level: 1,
      status: "Good",
    };
  } else if (aqi <= 100) {
    return {
      level: 2,
      status: "Fair",
    };
  } else if (aqi <= 150) {
    return {
      level: 3,
      status: "Moderate",
    };
  } else if (aqi <= 200) {
    return {
      level: 4,
      status: "Poor",
    };
  } else {
    return {
      level: 5,
      status: "Very Poor",
    };
  }
};

module.exports = { classifyAQI };
