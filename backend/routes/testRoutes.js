const router = require("express").Router();
const HabitLog = require("../models/HabitLog");
const UserStats = require("../models/UserStats");

router.get("/seed", async (req, res) => {
    await HabitLog.deleteMany();
    await UserStats.deleteMany();

    await HabitLog.insertMany([
        { status: "missed" },
        { status: "missed" },
        { status: "completed" }
    ]);

    await UserStats.create({
        productivityScore: 40,
        sleepHours: 4,
        screenTime: 7
    });

    res.send("Test data inserted");
});

module.exports = router;