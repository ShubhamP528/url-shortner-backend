const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Url",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  userAgent: String,
  ipAddress: String,
  geolocation: {
    country: String,
    city: String,
  },
  osType: String,
  deviceType: String,
  browserType: String,
  referrer: String,
});

module.exports = mongoose.model("Analytics", analyticsSchema);
