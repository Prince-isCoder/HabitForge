const Habit = require("../models/Habit");
const HabitLog = require("../models/HabitLog");
const User = require("../models/User");

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

exports.getDashboard = async (req, res) => {
    try {
        // ✅ Only fetch THIS user's habits
        console.log("DASHBOARD CALLED - user:", req.user?.id);
        const habits = await Habit.find({ user: req.user.id });
        const user   = await User.findById(req.user.id);

        const insights = [];
        const actions  = [];
        const habitSummaries = [];

        for (let habit of habits) {
            const streak = await calculateStreak(habit._id);
            habitSummaries.push({
                title:     habit.title,
                completed: habit.completed,
                streak
            });

            if (streak <= 1) {
                insights.push(`⚠ You are breaking "${habit.title}"`);
                actions.push(`Do "${habit.title}" right now (5 min rule)`);
            } else if (streak <= 3) {
                insights.push(`😐 Improve consistency in "${habit.title}"`);
                actions.push(`Schedule "${habit.title}" at a fixed time daily`);
            } else {
                insights.push(`🔥 Great job on "${habit.title}" — ${streak} day streak!`);
            }
        }

        const completedCount   = habits.filter(h => h.completed).length;
        const completionRate   = habits.length ? Math.round((completedCount / habits.length) * 100) : 0;
        const topStreakHabit   = habitSummaries.sort((a, b) => b.streak - a.streak)[0];

        // ✅ Build personalized AI coach message using OpenRouter
        const coach = await generateCoachMessage({
            name:          user?.name || "there",
            totalHabits:   habits.length,
            completedCount,
            completionRate,
            xp:            user?.xp || 0,
            level:         user?.level || 1,
            habitSummaries,
            topStreakHabit
        });

        res.json({ insights, actions, coach });

    } catch (err) {
        console.error("DASHBOARD ERROR:", err.message);
        res.status(500).json({ error: "Dashboard failed" });
    }
};

// ✅ Personalized AI coach message generator
const generateCoachMessage = async ({
    name, totalHabits, completedCount, completionRate,
    xp, level, habitSummaries, topStreakHabit
}) => {
    try {
        const habitList = habitSummaries.map(h =>
            `- "${h.title}" → ${h.completed ? "✅ Done" : "❌ Pending"}, streak: ${h.streak} days`
        ).join("\n");

        const tone = completionRate >= 70
            ? "celebratory and motivating"
            : completionRate >= 40
            ? "encouraging but firm"
            : "serious and urgent";

        const prompt = `
You are a personal AI habit coach. Respond in a ${tone} tone.

User: ${name}
Level: ${level} | XP: ${xp}
Today's Habits (${completedCount}/${totalHabits} completed, ${completionRate}%):
${habitList}
${topStreakHabit ? `Best streak: "${topStreakHabit.title}" at ${topStreakHabit.streak} days` : ""}

Write a SHORT personalized daily message for ${name}.

FORMAT RULES — follow exactly:
- Start with a one-line personal greeting using their name
- Use 2-3 bullet points for specific habit feedback
- End with one bold action line
- Max 6 lines total
- Use emojis naturally
- Reference their actual habit names and streaks
- Do NOT write in paragraph form
`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "HabitForge"
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();
        return data?.choices?.[0]?.message?.content || getFallbackCoach(name, completionRate);

    } catch (err) {
        console.error("COACH AI ERROR:", err.message);
        return getFallbackCoach(name, completionRate);
    }
};

// ✅ Fallback if AI fails
const getFallbackCoach = (name, completionRate) => {
    if (completionRate >= 70) return `🔥 Great work ${name}! You're crushing it today — keep the momentum going!`;
    if (completionRate >= 40) return `💪 You're halfway there, ${name}. Push through and complete your remaining habits!`;
    return `⚡ ${name}, today's habits are waiting. Start with just one — momentum builds fast!`;
};