const express = require('express');
const router = express.Router();

const {
  getMeals,
  setMeal,
  deleteMeal,
  updateMeal,
} = require('../controllers/nutritionController');
const { protect } = require('../middleware/authMiddleware');

// ✅ List & Create
router.route('/')
  .get(protect, getMeals)
  .post(protect, setMeal);

// ✅ Update & Delete by ID
router.route('/:id')
  .put(protect, updateMeal)
  .delete(protect, deleteMeal);

module.exports = router;