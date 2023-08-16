// models/RevokedToken.js

const mongoose = require("mongoose");

const revokedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // expires: 60 * 60,
    expires: 60 * 60 * 24 * 7, // The token will be automatically removed from the collection after 7 days
  },
});

module.exports = mongoose.model("RevokedToken", revokedTokenSchema);
