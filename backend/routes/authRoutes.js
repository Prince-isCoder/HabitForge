const router = require("express").Router();
const { signup, login, forgotPassword, resetPassword } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);   // ✅ F7
router.post("/reset-password", resetPassword);     // ✅ F7

module.exports = router;