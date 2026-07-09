const asyncHandler = require('express-async-handler');
const Meal = require('../models/Meal');

const getMeals = asyncHandler(async (req, res) => {
  const meals = await Meal.find({ user: req.user.id }).sort({ date: -1 }).limit(100);
  res.status(200).json(meals);
});

const setMeal = asyncHandler(async (req, res) => {
  const { mealType, foodName, calories, protein, carbs, fat, date } = req.body;

  if (!foodName || !calories) {
    res.status(400);
    throw new Error('Food name and calories are required');
  }

  const meal = await Meal.create({
    user: req.user.id,
    mealType, foodName, calories, protein, carbs, fat,
    date: date || new Date(),
  });

  res.status(201).json(meal);
});

const deleteMeal = asyncHandler(async (req, res) => {
  const meal = await Meal.findById(req.params.id);

  if (!meal) {
    res.status(404);
    throw new Error('Meal not found');
  }

  if (meal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await meal.deleteOne();
  res.status(200).json({ id: req.params.id, message: 'Meal deleted' });
});

const updateMeal = asyncHandler(async (req, res) => {
  const meal = await Meal.findById(req.params.id);

  if (!meal) {
    res.status(404);
    throw new Error('Meal not found');
  }

  if (meal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedMeal = await Meal.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(updatedMeal);
});

module.exports = { getMeals, setMeal, deleteMeal, updateMeal };