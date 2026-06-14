const getRecommendations = (req, res) => {
  const { transport, electricity, fuel } = req.body; // ✅ IMPORTANT

  let tips = [];

  if (transport > 3) {
    tips.push("Use public transport or carpool to reduce emissions");
  }

  if (electricity > 3) {
    tips.push("Switch off unused appliances to save electricity");
  }

  if (fuel > 2) {
    tips.push("Reduce fuel consumption and plan efficient routes");
  }

  res.json({ tips });
};

module.exports = { getRecommendations };
