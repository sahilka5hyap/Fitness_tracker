const asyncHandler = require("express-async-handler");
const Workout = require("../models/Workout");

const getWorkouts = asyncHandler(async (req, res) => {
  const workouts = await Workout.find({ user: req.user.id }).sort({ date: -1 });
  res.status(200).json(workouts);
});

const setWorkout = asyncHandler(async (req, res) => {
  const { title, exerciseName, muscleGroup, sets, reps, weight, duration, caloriesBurned, distance, date } = req.body;
  const workout = await Workout.create({
    user: req.user.id,
    title: title || exerciseName,
    exerciseName, muscleGroup, sets, reps, weight, duration, caloriesBurned, distance,
    date: date || new Date()
  });
  res.status(201).json(workout);
});

const updateWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);
  if (!workout) { res.status(404); throw new Error("Workout not found"); }

  if (workout.user.toString() !== req.user.id) {
    res.status(401); throw new Error("Not authorized");
  }

  const updatedWorkout = await Workout.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(updatedWorkout);
});

const deleteWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);
  if (!workout) { res.status(404); throw new Error("Workout not found"); }


  if (workout.user.toString() !== req.user.id) {
    res.status(401); throw new Error("Not authorized");
  }

  await workout.deleteOne();
  res.status(200).json({ message: "Workout deleted" });
});

module.exports = { getWorkouts, setWorkout, updateWorkout, deleteWorkout };