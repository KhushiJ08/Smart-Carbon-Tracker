const Activity = require("../models/Activity");

// ✅ TOTAL EMISSION
const getTotalEmission = async (req, res) => {
  try {
    const activities = await Activity.find();

    const total = activities
      .reduce((sum, activity) => sum + (activity.emission || 0), 0)
      .toFixed(2);

    res.json({
      total,
      unit: "kg CO2",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ CATEGORY-WISE EMISSION
const getCategoryEmission = async (req, res) => {
  try {
    const activities = await Activity.find();
    const result = {};

    activities.forEach((activity) => {
      const category = activity.category || "other";
      const emission = activity.emission || 0;

      if (!result[category]) {
        result[category] = 0;
      }

      result[category] += emission;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ TRENDS (DATE-WISE)
const getTrends = async (req, res) => {
  try {
    const activities = await Activity.find();
    const data = {};

    activities.forEach((activity) => {
      const date = activity.createdAt
        ? new Date(activity.createdAt).toLocaleDateString()
        : "Unknown";

      const emission = activity.emission || 0;

      if (!data[date]) {
        data[date] = 0;
      }

      data[date] += emission;
    });

    res.json({
      labels: Object.keys(data),
      values: Object.values(data),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ MONTHLY COMPARISON
const getComparison = async (req, res) => {
  try {
    const activities = await Activity.find();

    const now = new Date();
    const currentMonth = now.getMonth();
    const previousMonth = currentMonth - 1;

    let currentTotal = 0;
    let previousTotal = 0;

    activities.forEach((activity) => {
      if (!activity.createdAt) return;

      const date = new Date(activity.createdAt);
      const month = date.getMonth();
      const emission = activity.emission || 0;

      if (month === currentMonth) currentTotal += emission;
      if (month === previousMonth) previousTotal += emission;
    });

    const percentageChange =
      previousTotal === 0
        ? 0
        : ((currentTotal - previousTotal) / previousTotal) * 100;

    res.json({
      currentMonth: currentTotal,
      previousMonth: previousTotal,
      percentageChange: percentageChange.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ INSIGHTS
const getInsights = async (req, res) => {
  try {
    const activities = await Activity.find();

    if (activities.length === 0) {
      return res.json({
        message: "No data available",
      });
    }

    let maxEmission = 0;
    let maxDate = "";
    let totalEmission = 0;
    let categoryCount = {};

    activities.forEach((activity) => {
      const emission = activity.emission || 0;
      totalEmission += emission;

      // Highest emission day
      if (emission > maxEmission) {
        maxEmission = emission;
        maxDate = new Date(activity.createdAt).toLocaleDateString();
      }

      // Category count
      const category = activity.category || "other";
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    // Most frequent category
    const mostUsedCategory = Object.keys(categoryCount).reduce((a, b) =>
      categoryCount[a] > categoryCount[b] ? a : b,
    );

    const avgEmission = totalEmission / activities.length;

    res.json({
      highestEmission: maxEmission,
      highestDate: maxDate,
      mostUsedCategory,
      avgEmission: avgEmission.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ AI RECOMMENDATIONS
const getRecommendations = async (req, res) => {
  try {
    const activities = await Activity.find();

    let transport = 0;
    let electricity = 0;
    let fuel = 0;

    // Calculate category totals
    activities.forEach((activity) => {
      if (activity.category === "transport")
        transport += activity.emission || 0;
      if (activity.category === "electricity")
        electricity += activity.emission || 0;
      if (activity.category === "fuel") fuel += activity.emission || 0;
    });

    const total = transport + electricity + fuel;

    let recommendations = [];

    if (transport > 0.4 * total) {
      recommendations.push({
        category: "Transport",
        tip: "Use public transport or carpool",
        reduction: "10-20%",
      });
    }

    if (electricity > 0.4 * total) {
      recommendations.push({
        category: "Electricity",
        tip: "Use energy-efficient appliances",
        reduction: "5-15%",
      });
    }

    if (fuel > 0.3 * total) {
      recommendations.push({
        category: "Fuel",
        tip: "Reduce fuel usage",
        reduction: "5-10%",
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        category: "General",
        tip: "Great job! Maintain your low carbon footprint 🎉",
        reduction: "0%",
      });
    }

    res.json({
      transport,
      electricity,
      fuel,
      total,
      recommendations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ EXPORT (VERY IMPORTANT)
module.exports = {
  getTotalEmission,
  getCategoryEmission,
  getTrends,
  getComparison,
  getInsights,
  getRecommendations   // ✅ ADD THIS
};
