const calculateCarbon = async (transport, electricity, fuel) => {
  return {
    transport,
    electricity,
    fuel,
    message: "Carbon service is ready for AI integration.",
  };
};

module.exports = { calculateCarbon };
