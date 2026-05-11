const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: String,   // ✅ changed from ObjectId
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
