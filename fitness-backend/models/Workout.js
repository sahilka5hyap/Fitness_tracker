const mongoose = require("mongoose");

const workoutSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    title: { type: String, required: [true, "Workout title is required"], trim: true, maxlength: [100, "Title must be under 100 characters"] },
    exerciseName: { type: String, trim: true, default: "" },
    muscleGroup: {
      type: String,
      enum: ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Cardio", "Full Body", "Other", ""],
      default: "",
    },
    sets: { type: Number, default: 0, min: [0, "Sets cannot be negative"] },
    reps: { type: Number, default: 0, min: [0, "Reps cannot be negative"] },
    weight: { type: Number, default: 0, min: [0, "Weight cannot be negative"] },
    duration: { type: Number, default: 0, min: [0, "Duration cannot be negative"] },
    caloriesBurned: { type: Number, default: 0, min: [0, "Calories cannot be negative"] },
    distance: { type: Number, default: 0, min: [0, "Distance cannot be negative"] },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workout", workoutSchema);