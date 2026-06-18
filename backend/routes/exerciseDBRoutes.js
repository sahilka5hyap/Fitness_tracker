const express = require('express');
const router = express.Router();
const ExerciseDB = require('../models/ExerciseDB');
const initialExercises = require('../data/exerciseData');
const { protect } = require('../middleware/authMiddleware');

// @desc Search exercises
// @route GET /api/exercises/search
// @access Private
router.get('/search', protect, async (req, res) => {
  try {
    const { query, muscleGroup, category } = req.query;

    // ✅ Build filter dynamically
    const filter = {};

    if (query) {
      filter.name = { $regex: query, $options: 'i' };
    }

    if (muscleGroup) {
      filter.muscleGroup = muscleGroup;
    }

    if (category) {
      filter.category = category;
    }

    const exercises = await ExerciseDB.find(filter).limit(20);
    res.status(200).json(exercises);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching exercises' });
  }
});

// @desc Get all exercises
// @route GET /api/exercises
// @access Private
router.get('/', protect, async (req, res) => {
  try {
    const exercises = await ExerciseDB.find({}).limit(50);
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exercises' });
  }
});

// @desc Seed exercise DB
// @route POST /api/exercises/seed
// @access Private ✅ Protected so not open to everyone
router.post('/seed', protect, async (req, res) => {
  try {
    await ExerciseDB.deleteMany({});
    await ExerciseDB.insertMany(initialExercises);
    res.status(201).json({ message: 'Exercise DB seeded successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error seeding exercises' });
  }
});

module.exports = router;