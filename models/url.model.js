const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  longUrl: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        try {
          new URL(v);
          return true;
        } catch (err) {
          return false;
        }
      },
      message: "Invalid URL format",
    },
  },
  alias: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  topic: {
    type: String,
    enum: [
      "acquisition",
      "activation",
      "retention",
      "random",
      "Technology",
      "Science",
      "Health",
      "Business",
      "Entertainment",
      "Sports",
      "Education",
      "Art",
      "Travel",
      null,
    ],
    default: null,
  },
  userId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastAccessed: {
    type: Date,
  },
});

module.exports = mongoose.model("Url", urlSchema);
