const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
    title: String,
    completed:         { type: Boolean, default: false },
    user:              { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastCompletedDate: { type: String,  default: null },
    category: {                                           // ✅ F8
        type: String,
        default: "General",
        enum: ["Health", "Work", "Learning", "Fitness", "Mindfulness", "General"]
    }
});

module.exports = mongoose.model("Habit", habitSchema);