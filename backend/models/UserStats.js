const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    streaks: Number,
    productivityScore: Number,
    sleepHours: Number,
    screenTime: Number,
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserStats", statsSchema);