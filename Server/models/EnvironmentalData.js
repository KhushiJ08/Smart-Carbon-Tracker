const mongoose = require("mongoose");

const environmentalDataSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    trim: true,
  },
  temperature: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Number,
    required: true,
  },
  AQI: {
    type: Number,
    default: null,
  },
  PM25: {
    type: Number,
    default: null,
  },
  PM10: {
    type: Number,
    default: null,
  },
  weather: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("EnvironmentalData", environmentalDataSchema);
