const express = require('express');
const router = express.Router();

const {
  getStats,
  setStat,
  deleteStat,
  updateStat,
} = require('../controllers/bodyStatsController');
const { protect } = require('../middleware/authMiddleware');

// ✅ List & Create
router.route('/')
  .get(protect, getStats)
  .post(protect, setStat);

// ✅ Update & Delete by ID
router.route('/:id')
  .put(protect, updateStat)
  .delete(protect, deleteStat);

module.exports = router;