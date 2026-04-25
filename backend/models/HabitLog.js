const mongoose = require("mongoose");

const habitLogSchema = new mongoose.Schema({
    habitId: mongoose.Schema.Types.ObjectId,
    date: String,
    status: String
});

module.exports = mongoose.model("HabitLog", habitLogSchema);