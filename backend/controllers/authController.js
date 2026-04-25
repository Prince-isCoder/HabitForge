const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const calculateLevel = (xp) => Math.floor(xp / 100) + 1;

const getLevelName = (level) => {
    if (level >= 5) return "Legend";
    if (level === 4) return "Champion";
    if (level === 3) return "Disciplined";
    if (level === 2) return "Consistent";
    return "Beginner";
};

// ✅ All badge definitions
const BADGE_DEFS = {
    first_habit: { name: "First Step",  emoji: "🌱", desc: "Complete your first habit" },
    streak_7:    { name: "On Fire",     emoji: "🔥", desc: "Achieve a 7-day streak" },
    perfect_day: { name: "Perfect Day", emoji: "💯", desc: "Complete all habits in one day" },
    xp_100:      { name: "Century",     emoji: "⚡", desc: "Earn 100 XP" },
    level_3:     { name: "Disciplined", emoji: "🏆", desc: "Reach Level 3" },
    legend:      { name: "Legend",      emoji: "👑", desc: "Reach Level 5" },
};

// ✅ Mailtrap transporter
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
});

// SIGNUP
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashed, xp: 0, level: 1, badges: [] });
        await user.save();
        res.json({ message: "User created" });
    } catch (err) {
        res.status(500).json({ error: "Signup failed" });
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Wrong password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({
            token,
            user: {
                id:        user._id,
                name:      user.name,
                email:     user.email,
                xp:        user.xp,
                level:     user.level,
                levelName: getLevelName(user.level),
                xpForNext: user.level * 100,
                badges:    user.badges || []
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Email not found" });

        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        const resetUrl = `http://localhost:5173/login?token=${token}`;

        await transporter.sendMail({
            from: '"HabitForge" <noreply@habitforge.com>',
            to: email,
            subject: "Reset Your Password — HabitForge",
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0a0c12;color:#e2e8f0;padding:40px;border-radius:16px;">
                    <h2 style="color:#818cf8;">🔥 HabitForge</h2>
                    <h3 style="color:#f1f5f9;">Reset Your Password</h3>
                    <p style="color:#94a3b8;">Click below to reset your password. Link expires in 1 hour.</p>
                    <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#4338ca);color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:8px;">Reset Password</a>
                    <p style="color:#475569;font-size:12px;margin-top:24px;">If you didn't request this, ignore this email.</p>
                </div>
            `
        });

        res.json({ message: "Reset email sent — check Mailtrap inbox" });
    } catch (err) {
        console.error("FORGOT PASSWORD ERROR:", err.message);
        res.status(500).json({ error: "Failed to send reset email" });
    }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() }
        });
        if (!user) return res.status(400).json({ error: "Invalid or expired token" });

        user.password = await bcrypt.hash(password, 10);
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (err) {
        res.status(500).json({ error: "Reset failed" });
    }
};

module.exports = { signup, login, forgotPassword, resetPassword, calculateLevel, getLevelName, BADGE_DEFS };