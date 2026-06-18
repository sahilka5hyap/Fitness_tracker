const mongoose = require('mongoose');

const mealSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    mealType: {
      type: String,
      required: [true, 'Meal type is required'],
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
      default: 'Breakfast',
    },

    foodName: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      maxlength: [100, 'Food name must be under 100 characters'],
    },

    calories: {
      type: Number,
      default: 0,
      min: [0, 'Calories cannot be negative'],
    },

    protein: {
      type: Number,
      default: 0,
      min: [0, 'Protein cannot be negative'],
    },

    carbs: {
      type: Number,
      default: 0,
      min: [0, 'Carbs cannot be negative'],
    },

    fat: {
      type: Number,
      default: 0,
      min: [0, 'Fat cannot be negative'],
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meal', mealSchema);