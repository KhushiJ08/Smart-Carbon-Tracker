const mongoose = require("mongoose");

const carbonSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    totalEmissions: {
      type: Number,
      required: true,
    },
    breakdown: {
      transport: Number,
      electricity: Number,
      food: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CarbonFootprint", carbonSchema);
