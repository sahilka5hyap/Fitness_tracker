const express = require('express');
const router = express.Router();
const {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

// ✅ List & Create
router.route('/')
  .get(protect, getGoals)
  .post(protect, createGoal);

// ✅ Update & Delete by ID
router.route('/:id')
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

module.exports = router;