const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  xp:               { type: Number,   default: 0    },
  level:            { type: Number,   default: 1    },
  badges:           { type: [String], default: []   }, // ✅ F6
  resetToken:       { type: String,   default: null }, // ✅ F7
  resetTokenExpiry: { type: Date,     default: null }  // ✅ F7
});

module.exports = mongoose.model("User", userSchema);