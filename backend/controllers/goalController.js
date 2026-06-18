const asyncHandler = require('express-async-handler');
const Goal = require('../models/Goal');

// @desc Get all goals
// @route GET /api/goals
// @access Private
const getGoals = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.status(200).json(goals);
});

// @desc Create a goal
// @route POST /api/goals
// @access Private
const createGoal = asyncHandler(async (req, res) => {
  if (!req.body.title) {
    res.status(400);
    throw new Error('Goal title is required');
  }

  const goal = await Goal.create({
    user: req.user.id,
    ...req.body,
  });

  res.status(201).json(goal);
});

// @desc Update a goal
// @route PUT /api/goals/:id
// @access Private
const updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  if (goal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // ✅ Auto complete if progress reaches target
  if (req.body.currentProgress >= goal.targetValue) {
    req.body.status = 'completed';
  }

  const updatedGoal = await Goal.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedGoal);
});

// @desc Delete a goal
// @route DELETE /api/goals/:id
// @access Private
const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  if (goal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await goal.deleteOne();
  res.status(200).json({ id: req.params.id, message: 'Goal deleted' });
});

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };