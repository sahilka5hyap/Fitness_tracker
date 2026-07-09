const mongoose = require('mongoose');

const exerciseDBSchema = mongoose.Schema(
  {
    name: { type: String, required: [true, 'Exercise name is required'], trim: true, maxlength: [100, 'Name must be under 100 characters'] },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: ['Strength', 'Cardio', 'Flexibility', 'Balance', 'HIIT', 'Yoga', 'Other'],
    },
    muscleGroup: {
      type: String,
      required: [true, 'Muscle group is required'],
      trim: true,
      enum: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body', 'Other'],
    },
    equipment: {
      type: String,
      trim: true,
      enum: ['None', 'Barbell', 'Dumbbell', 'Kettlebell', 'Resistance Band', 'Machine', 'Cable', 'Bodyweight', 'Other'],
      default: 'None',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExerciseDB', exerciseDBSchema);