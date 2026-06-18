const express = require("express");
const router = express.Router();

const {
  getWorkouts,
  setWorkout,
  deleteWorkout,
  updateWorkout,
} = require("../controllers/workoutController");
const { protect } = require("../middleware/authMiddleware");

// ✅ List & Create
router.route("/")
  .get(protect, getWorkouts)
  .post(protect, setWorkout);

// ✅ Update & Delete by ID
router.route("/:id")
  .put(protect, updateWorkout)
  .delete(protect, deleteWorkout);

module.exports = router;