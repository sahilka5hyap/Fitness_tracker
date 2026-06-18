const mongoose = require('mongoose');

const bodyStatSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    date: {
      type: Date,
      default: Date.now,
    },

    // Biometrics
    weight: {
      type: Number,
      min: [1, 'Weight cannot be less than 1kg'],
      max: [500, 'Weight cannot exceed 500kg'],
    },

    bodyFat: {
      type: Number,
      min: [0, 'Body fat cannot be negative'],
      max: [100, 'Body fat cannot exceed 100%'],
    },

    muscleMass: {
      type: Number,
      min: [0, 'Muscle mass cannot be negative'],
      max: [100, 'Muscle mass cannot exceed 100%'],
    },

    // Daily Tracking
    steps: {
      type: Number,
      min: [0, 'Steps cannot be negative'],
      max: [100000, 'Steps cannot exceed 100,000'],
    },

    sleep: {
      type: Number, // hours
      min: [0, 'Sleep cannot be negative'],
      max: [24, 'Sleep cannot exceed 24 hours'],
    },

    water: {
      type: Number, // liters
      min: [0, 'Water cannot be negative'],
      max: [20, 'Water cannot exceed 20 liters'],
    },

    // Measurements (cm)
    waist: { type: Number, min: [0, 'Cannot be negative'] },
    chest: { type: Number, min: [0, 'Cannot be negative'] },
    arms:  { type: Number, min: [0, 'Cannot be negative'] },
    legs:  { type: Number, min: [0, 'Cannot be negative'] },

    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes must be under 300 characters'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BodyStat', bodyStatSchema);