const router = require("express").Router();
const aiService = require("../services/aiService");

router.post("/", (req, res) => {
    const { message } = req.body;

    let reply = "Stay focused and consistent.";

    if (message.toLowerCase().includes("lazy")) {
        reply = "Feeling lazy is normal. Start with a small task to build momentum.";
    } 
    else if (message.toLowerCase().includes("tired")) {
        reply = "Rest is important. Take a short break and recharge.";
    } 
    else if (message.toLowerCase().includes("distracted")) {
        reply = "Eliminate distractions. Try working in focused intervals.";
    }

    res.json({ reply });
});

module.exports = router;