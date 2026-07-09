const asyncHandler = require('express-async-handler');
const BodyStat = require('../models/BodyStat');

const getStats = asyncHandler(async (req, res) => {
  const stats = await BodyStat.find({ user: req.user.id }).sort({ date: -1 }).limit(100);
  res.status(200).json(stats);
});

const setStat = asyncHandler(async (req, res) => {
  const { weight, bodyFat, muscleMass, steps, sleep, water, waist, chest, arms, legs, notes, date } = req.body;

  if (!weight && !bodyFat && !muscleMass && !steps && !sleep && !water) {
    res.status(400);
    throw new Error('Please provide at least one stat');
  }

  const stat = await BodyStat.create({
    user: req.user.id,
    date: date || new Date(),
    weight, bodyFat, muscleMass, steps, sleep, water, waist, chest, arms, legs, notes,
  });

  res.status(201).json(stat);
});

const deleteStat = asyncHandler(async (req, res) => {
  const stat = await BodyStat.findById(req.params.id);

  if (!stat) {
    res.status(404);
    throw new Error('Stat not found');
  }

  if (stat.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await stat.deleteOne();
  res.status(200).json({ id: req.params.id, message: 'Stat deleted' });
});

const updateStat = asyncHandler(async (req, res) => {
  const stat = await BodyStat.findById(req.params.id);

  if (!stat) {
    res.status(404);
    throw new Error('Stat not found');
  }

  if (stat.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedStat = await BodyStat.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(updatedStat);
});

module.exports = { getStats, setStat, deleteStat, updateStat };