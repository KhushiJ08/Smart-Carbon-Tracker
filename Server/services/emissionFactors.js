const emissionFactors = {
  car: {
    petrol: 0.18,
    diesel: 0.20,
    electric: 0.05,
  },

  "two-wheeler": {
    petrol: 0.10,
    electric: 0.03,
  },

  bus: {
    public: 0.08,
  },

  bicycle: {
    default: 0,
  },

  walking: {
    default: 0,
  },

  ev: {
    default: 0.05,
  },
};

const getEmissionFactor = (
  transportMode,
  vehicleType,
) => {
  const mode =
    emissionFactors[transportMode];

  if (!mode) {
    throw new Error(
      `Unsupported transport mode: ${transportMode}`,
    );
  }

  if (vehicleType && mode[vehicleType] !== undefined) {
    return mode[vehicleType];
  }

  if (mode.default !== undefined) {
    return mode.default;
  }

  const firstFactor =
    Object.values(mode)[0];

  if (firstFactor === undefined) {
    throw new Error(
      `Emission factor not available for ${transportMode}`,
    );
  }

  return firstFactor;
};

module.exports = {
  emissionFactors,
  getEmissionFactor,
};