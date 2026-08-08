const getAQIData = async () => {
  try {
    return {
      success: true,
      message: "Air Quality service is ready for future API integration.",
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { getAQIData };
