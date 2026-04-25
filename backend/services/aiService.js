const router = require("express").Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "No message provided" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const result = await model.generateContent(message);

    const reply = result.response.text();

    res.json({ reply });

  } catch (err) {
    console.error("AI ERROR:", err);
    res.json({ reply: "AI error" });
  }
});

module.exports = router;