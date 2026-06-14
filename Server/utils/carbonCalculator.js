const emissionFactors = {
  car: 0.192,
  bus: 0.105,
  electricity: 0.82,
  lpg: 2.98,
};

const calculateCarbonEmission = (activityType, value) => {
  if (!activityType) {
    throw new Error("Activity type missing");
  }

  const factor = emissionFactors[String(activityType).toLowerCase()];

  if (!factor) {
    throw new Error("Invalid activity type");
  }

  return factor * (value || 0);
};

module.exports = calculateCarbonEmission;
