const router = require("express").Router();
const Habit = require("../models/Habit");
const HabitLog = require("../models/HabitLog");
// ADD this line at the top (line 3)
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
    try {
        const habits = await Habit.find({ user: req.user.id });
        const logs = await HabitLog.find({
            habitId: { $in: habits.map(h => h._id) }
        });

        const totalHabits = habits.length;
        const completedHabits = habits.filter(h => h.completed).length;

        const completionRate =
            totalHabits === 0 ? 0 : (completedHabits / totalHabits) * 100;

        // ✅ SAFE WEEKLY DATA
        const weeklyData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

            const count = logs.filter(l => {
                if (!l.date) return false; // 🛡 prevents crash
                return (
                    new Date(l.date).toDateString() === date.toDateString()
                );
            }).length;

            weeklyData.push({
                day: dayName,
                completed: count
            });
        }

        // ✅ INSIGHT
        let insight = "";
        if (completionRate < 40) {
            insight = "⚠ Very low consistency detected.";
        } else if (completionRate < 70) {
            insight = "⚡ You're doing okay.";
        } else {
            insight = "🔥 Great discipline!";
        }

        // ✅ ALERT
        let alert = "";
        if (completionRate < 30) {
            alert = "🚨 You are falling behind badly. Take action NOW.";
        } else if (completionRate < 60) {
            alert = "⚠ Your consistency is dropping.";
        } else {
            alert = "✅ You're doing well.";
        }

        res.json({
            totalHabits,
            completedHabits,
            completionRate,
            weeklyData,
            insight,
            alert
        });

    } catch (err) {
        console.error("ANALYTICS ERROR:", err.message); // 🔥 IMPORTANT
        res.status(500).json({ error: "Analytics failed" });
    }
});

// ✅ Calendar heatmap endpoint
router.get("/calendar", authMiddleware, async (req, res) => {
    try {
        const habits = await Habit.find({ user: req.user.id });
        const habitIds = habits.map(h => h._id);

        // Get logs for last 365 days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 365);
        const startStr = startDate.toISOString().split("T")[0];

        const logs = await HabitLog.find({
            habitId: { $in: habitIds },
            date: { $gte: startStr }
        });

        // Group by date — count completions per day
        const countMap = {};
        for (const log of logs) {
            if (!countMap[log.date]) countMap[log.date] = 0;
            countMap[log.date]++;
        }

        // Build array of last 365 days
        const calendar = [];
        for (let i = 364; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            calendar.push({
                date: dateStr,
                count: countMap[dateStr] || 0
            });
        }

        res.json({ calendar, totalHabits: habits.length });
    } catch (err) {
        console.error("CALENDAR ERROR:", err.message);
        res.status(500).json({ error: "Calendar fetch failed" });
    }
});

// ✅ Feature 9 — Per-habit analytics
router.get("/habit/:id", authMiddleware, async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);
        if (!habit) return res.status(404).json({ error: "Not found" });
        if (habit.user.toString() !== req.user.id) return res.status(403).json({ error: "Not authorized" });

        const allLogs = await HabitLog.find({ habitId: req.params.id }).sort({ date: 1 });
        const totalCompletions = allLogs.length;

        // Current streak
        const recentLogs = [...allLogs].reverse();
        let currentStreak = 0;
        let checkDate = new Date();
        for (const log of recentLogs) {
            const logDate = new Date(log.date);
            const diff = (checkDate - logDate) / (1000 * 60 * 60 * 24);
            if (diff <= 1) { currentStreak++; checkDate = logDate; }
            else break;
        }

        // Best streak
        let bestStreak = 0, cur = 0;
        for (let i = 0; i < allLogs.length; i++) {
            if (i === 0) { cur = 1; continue; }
            const diff = (new Date(allLogs[i].date) - new Date(allLogs[i-1].date)) / (1000*60*60*24);
            if (Math.round(diff) === 1) cur++;
            else cur = 1;
            bestStreak = Math.max(bestStreak, cur);
        }
        if (allLogs.length > 0) bestStreak = Math.max(bestStreak, 1);

        // Last 30 days
        const last30 = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            last30.push({ date: dateStr, completed: allLogs.some(l => l.date === dateStr) });
        }

        res.json({ title: habit.title, category: habit.category || "General", totalCompletions, currentStreak, bestStreak, last30 });
    } catch (err) {
        console.error("PER-HABIT ERROR:", err.message);
        res.status(500).json({ error: "Failed" });
    }
});

module.exports = router;