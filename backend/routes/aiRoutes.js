const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const Habit = require("../models/Habit");
const HabitLog = require("../models/HabitLog");

router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { messages } = req.body;

    // ✅ Fetch this user's real habit data for context
    const habits = await Habit.find({ user: req.user.id });
    const completedCount = habits.filter(h => h.completed).length;
    const completionRate = habits.length
      ? Math.round((completedCount / habits.length) * 100) : 0;

    const habitList = habits.map(h =>
      `- "${h.title}": ${h.completed ? "✅ completed today" : "❌ not done"}`
    ).join("\n");

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
        messages: [
          {
            role: "system",
            content: `
You are HabitForge AI Coach — a smart, direct personal habit coach.

User's Current Habits (${completedCount}/${habits.length} done today, ${completionRate}% rate):
${habitList || "No habits added yet"}

RESPONSE FORMAT RULES — always follow:
- Never write long paragraphs
- Use bullet points (•) for lists
- Use **bold** for key points or action items  
- Use section headers if answer has multiple parts (e.g. "📊 Analysis:", "✅ Action Plan:")
- Keep total response under 10 lines
- Be direct, specific, and use the user's actual habit names
- Use emojis naturally but not excessively
- If asked about a specific habit, reference its actual status from the data above
`
          },
          ...messages
        ]
      })
    });

    const data = await response.json();
    console.log("OPENROUTER RESPONSE:", JSON.stringify(data, null, 2));

    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) return res.json({ reply: "AI not responding properly" });

    res.json({ reply });

  } catch (err) {
    console.error("AI ERROR:", err.message);
    res.json({ reply: "AI error occurred. Please try again." });
  }
});

module.exports = router;