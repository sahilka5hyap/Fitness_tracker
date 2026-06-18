const mongoose = require('mongoose');

const foodSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      maxlength: [100, 'Name must be under 100 characters'],
    },

    servingSize: {
      type: String,
      trim: true,
      default: '1 serving',
    },

    // ✅ Min values to prevent negatives
    calories: {
      type: Number,
      required: [true, 'Calories is required'],
      min: [0, 'Calories cannot be negative'],
    },

    protein: {
      type: Number,
      required: [true, 'Protein is required'],
      min: [0, 'Protein cannot be negative'],
    },

    carbs: {
      type: Number,
      required: [true, 'Carbs is required'],
      min: [0, 'Carbs cannot be negative'],
    },

    fat: {
      type: Number,
      required: [true, 'Fat is required'],
      min: [0, 'Fat cannot be negative'],
    },

    // ✅ Enum on category
    category: {
      type: String,
      trim: true,
      enum: [
        'Fruits',
        'Vegetables',
        'Grains',
        'Protein',
        'Dairy',
        'Fats & Oils',
        'Snacks',
        'Beverages',
        'Other',
      ],
      default: 'Other',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Food', foodSchema);