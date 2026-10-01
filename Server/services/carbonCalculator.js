const { getEmissionFactor } = require("./emissionFactors");

const calculateEmission = ({
  distance,
  transportMode,
  vehicleType,
  passengerCount = 1,
}) => {
  if (
    typeof distance !== "number" ||
    !Number.isFinite(distance) ||
    distance < 0
  ) {
    throw new Error("Distance must be a valid non-negative number");
  }

  if (
    typeof passengerCount !== "number" ||
    !Number.isFinite(passengerCount) ||
    passengerCount < 1
  ) {
    throw new Error("Passenger count must be at least 1");
  }

  const emissionFactor = getEmissionFactor(transportMode, vehicleType);

  const totalEmission = distance * emissionFactor;
  const emissionPerPassenger = totalEmission / passengerCount;

  return {
    emissionFactor,
    totalEmission: Number(totalEmission.toFixed(3)),
    emissionPerPassenger: Number(emissionPerPassenger.toFixed(3)),
  };
};

const compareTransportModes = ({ distance, passengerCount = 1 }) => {
  const modes = [
    {
      transportMode: "car",
      vehicleType: "petrol",
    },
    {
      transportMode: "two-wheeler",
      vehicleType: "petrol",
    },
    {
      transportMode: "bus",
      vehicleType: "public",
    },
    {
      transportMode: "ev",
      vehicleType: "electric",
    },
    {
      transportMode: "bicycle",
      vehicleType: null,
    },
    {
      transportMode: "walking",
      vehicleType: null,
    },
  ];

  return modes.map((mode) => {
    const result = calculateEmission({
      distance: Number(distance),
      transportMode: mode.transportMode,
      vehicleType: mode.vehicleType,
      passengerCount: Number(passengerCount),
    });

    return {
      transportMode: mode.transportMode,
      emissionFactor: result.emissionFactor,
      totalEmission: result.totalEmission,
      emissionPerPassenger: result.emissionPerPassenger,
    };
  });
};

const getRecommendation = ({ distance, currentMode, passengerCount = 1 }) => {
  const comparison = compareTransportModes({
    distance,
    passengerCount,
  });

  const current = comparison.find((item) => item.transportMode === currentMode);

  if (!current) {
    throw new Error("Invalid current transport mode");
  }

  const alternatives = comparison.filter(
    (item) => item.transportMode !== currentMode,
  );

  const bestAlternative = alternatives.reduce((best, item) =>
    item.totalEmission < best.totalEmission ? item : best,
  );

  if (
    Number(distance) < 5 &&
    ["walking", "bicycle"].includes(bestAlternative.transportMode)
  ) {
    return {
      recommendation: `🌱 Suggested option: ${bestAlternative.transportMode}. It has lower estimated emissions for this short trip.`,
      currentEmission: current.totalEmission,
      suggestedEmission: bestAlternative.totalEmission,
    };
  }

  if (bestAlternative.totalEmission < current.totalEmission) {
    return {
      recommendation: `🌱 Suggested option: ${bestAlternative.transportMode}. It has lower estimated emissions than your current mode.`,
      currentEmission: current.totalEmission,
      suggestedEmission: bestAlternative.totalEmission,
    };
  }

  return {
    recommendation:
      "Your current transport mode already has the lowest estimated emissions among the available options.",
    currentEmission: current.totalEmission,
    suggestedEmission: current.totalEmission,
  };
};

module.exports = {
  calculateEmission,
  compareTransportModes,
  getRecommendation,
};
