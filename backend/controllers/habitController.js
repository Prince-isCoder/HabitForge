const Habit = require("../models/Habit");
const HabitLog = require("../models/HabitLog");
const User = require("../models/User");
const { calculateLevel, getLevelName, BADGE_DEFS } = require("./authController");

// Create Habit — now accepts category
const createHabit = async (req, res) => {
    try {
        const { title, category } = req.body;
        const habit = new Habit({
            title,
            user: req.user.id,
            category: category || "General"
        });
        await habit.save();
        res.json(habit);
    } catch (err) {
        res.status(500).json({ error: "Failed to create habit" });
    }
};

// Get Habits
const getHabits = async (req, res) => {
    try {
        const habits = await Habit.find({ user: req.user.id });
        const result = [];
        for (let habit of habits) {
            const streak = await calculateStreak(habit._id);
            result.push({ ...habit.toObject(), streak });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch habits" });
    }
};

// Delete Habit
const deleteHabit = async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);
        if (!habit) return res.status(404).json({ error: "Habit not found" });
        if (habit.user.toString() !== req.user.id) return res.status(403).json({ error: "Not authorized" });
        await habit.deleteOne();
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
};

// Mark Complete
const markComplete = async (req, res) => {
    try {
        const { habitId } = req.body;
        const habit = await Habit.findById(habitId);
        if (!habit) return res.status(404).json({ error: "Habit not found" });
        if (habit.user.toString() !== req.user.id) return res.status(403).json({ error: "Not authorized" });

        const today = new Date().toISOString().split("T")[0];
        habit.completed = !habit.completed;

        const user = await User.findById(req.user.id);
        if (habit.completed) {
            habit.lastCompletedDate = today;
            await HabitLog.create({ habitId, date: today, status: "completed" });
            user.xp = Math.max(0, user.xp + 10);
        } else {
            user.xp = Math.max(0, user.xp - 5);
        }

        const newLevel = calculateLevel(user.xp);
        const leveledUp = newLevel > user.level;
        user.level = newLevel;

        // ✅ Badge checking
        const newBadges = [];
        const earned = user.badges || [];

        if (habit.completed) {
            // First habit ever
            const userHabitIds = (await Habit.find({ user: req.user.id })).map(h => h._id);
            const totalLogs = await HabitLog.countDocuments({ habitId: { $in: userHabitIds } });
            if (totalLogs === 1 && !earned.includes("first_habit")) newBadges.push("first_habit");

            // 7-day streak
            const streak = await calculateStreak(habitId);
            if (streak >= 7 && !earned.includes("streak_7")) newBadges.push("streak_7");

            // Perfect day — all habits done
            const allHabits = await Habit.find({ user: req.user.id });
            const allDone = allHabits.every(h => h._id.toString() === habitId ? true : h.completed);
            if (allDone && allHabits.length > 0 && !earned.includes("perfect_day")) newBadges.push("perfect_day");

            // 100 XP
            if (user.xp >= 100 && !earned.includes("xp_100")) newBadges.push("xp_100");

            // Level 3
            if (user.level >= 3 && !earned.includes("level_3")) newBadges.push("level_3");

            // Level 5
            if (user.level >= 5 && !earned.includes("legend")) newBadges.push("legend");
        }

        if (newBadges.length > 0) user.badges = [...earned, ...newBadges];

        await user.save();
        await habit.save();

        res.json({
            habit,
            xpUpdate: {
                xp:        user.xp,
                level:     user.level,
                levelName: getLevelName(user.level),
                xpForNext: user.level * 100,
                leveledUp,
                badges:    user.badges
            },
            newBadges: newBadges.map(id => ({ id, ...BADGE_DEFS[id] }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed" });
    }
};

// Calculate Streak
const calculateStreak = async (habitId) => {
    const logs = await HabitLog.find({ habitId }).sort({ date: -1 });
    let streak = 0;
    let currentDate = new Date();
    for (let log of logs) {
        const logDate = new Date(log.date);
        const diff = (currentDate - logDate) / (1000 * 60 * 60 * 24);
        if (diff <= 1) { streak++; currentDate = logDate; }
        else break;
    }
    return streak;
};

module.exports = { createHabit, getHabits, deleteHabit, markComplete };