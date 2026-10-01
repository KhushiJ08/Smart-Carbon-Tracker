const mongoose = require("mongoose");

const travelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    origin: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    distance: {
      type: Number,
      required: true,
      min: 0,
    },

    duration: {
      type: Number,
      required: true,
      min: 0,
    },

    transportMode: {
      type: String,
      required: true,
      enum: [
        "car",
        "two-wheeler",
        "bus",
        "bicycle",
        "walking",
        "ev",
      ],
    },

    vehicleType: {
      type: String,
      default: null,
    },

    passengerCount: {
      type: Number,
      required: true,
      min: 1,
    },

    emissionFactor: {
      type: Number,
      required: true,
      min: 0,
    },

    estimatedEmission: {
      type: Number,
      required: true,
      min: 0,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "Travel",
  travelSchema,
);