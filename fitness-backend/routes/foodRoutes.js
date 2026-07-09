const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const initialFoods = require('../data/foodData');
const { protect } = require('../middleware/authMiddleware');

router.get('/search', protect, async (req, res) => {
  try {
    const { query, category } = req.query;
    const filter = {};
    if (query) filter.name = { $regex: query, $options: 'i' };
    if (category) filter.category = category;

    const foods = await Food.find(filter).limit(20);
    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching foods' });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const foods = await Food.find({}).limit(50);
    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching foods' });
  }
});

// Protected — run this once after deploying to populate food data
router.post('/seed', protect, async (req, res) => {
  try {
    await Food.deleteMany({});
    await Food.insertMany(initialFoods);
    res.status(201).json({ message: 'Food DB seeded successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error seeding foods' });
  }
});

module.exports = router;