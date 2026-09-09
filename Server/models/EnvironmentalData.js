const mongoose = require("mongoose");

const environmentalDataSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
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
    required: true,
  },

  PM25: {
    type: Number,
    required: true,
  },

  PM10: {
    type: Number,
    required: true,
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

module.exports = mongoose.model(
  "EnvironmentalData",
  environmentalDataSchema
);