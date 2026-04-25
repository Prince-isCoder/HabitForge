const router = require("express").Router();
const { getDashboard } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Added authMiddleware so req.user is available
router.get("/", authMiddleware, getDashboard);

module.exports = router;