require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/habits",    require("./routes/habitRoutes"));
app.use("/api/auth",      require("./routes/authRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/test",      require("./routes/testRoutes"));
app.use("/api/chat",      require("./routes/chatRoutes"));
app.use("/api/ai",        require("./routes/aiRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

console.log("OPENROUTER KEY:", process.env.OPENROUTER_API_KEY);

// ✅ DAILY RESET — runs every day at midnight (00:00)
const scheduleDailyReset = () => {
  cron.schedule("0  0 * * *", async () => {
    try {
      const Habit = require("./models/Habit");
      const today = new Date().toISOString().split("T")[0];

      // Only reset habits that were completed on a previous day
      const result = await Habit.updateMany(
        {
          completed: true,
          lastCompletedDate: { $ne: today }
        },
        {
          $set: { completed: false }
        }
      );

      console.log(`✅ Daily reset done — ${result.modifiedCount} habits reset at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      console.error("❌ Daily reset failed:", err.message);
    }
  }, {
    timezone: "Asia/Kolkata" // ✅ IST timezone for India
  });

  console.log("⏰ Daily habit reset scheduler started (runs at midnight IST)");
};

// MongoDB Connection + Server Start
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Start cron AFTER DB is connected
    scheduleDailyReset();

    app.listen(5000, () => {
      console.log("🚀 Server running on port 5000");
    });

  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();