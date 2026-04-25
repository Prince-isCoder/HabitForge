const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
    createHabit,
    getHabits,
    deleteHabit
} = require("../controllers/habitController");

const { markComplete } = require("../controllers/habitController");


console.log(createHabit, getHabits, deleteHabit);

router.post("/", authMiddleware, createHabit);
router.get("/", authMiddleware, getHabits);
router.delete("/:id", authMiddleware, deleteHabit);
router.post("/complete", authMiddleware, markComplete);

module.exports = router;