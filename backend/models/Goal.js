const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [100, 'Title must be under 100 characters'],
    },

    // ✅ Enum on type
    type: {
      type: String,
      enum: [
        'Weight Goal',
        'Strength Goal',
        'Cardio Goal',
        'Nutrition Goal',
        'Steps Goal',
        'Sleep Goal',
        'Water Goal',
        'Other',
      ],
      default: 'Other',
    },

    targetValue: {
      type: Number,
      min: [0, 'Target value cannot be negative'],
    },

    // ✅ Enum on unit
    unit: {
      type: String,
      enum: ['kg', 'lbs', 'km', 'miles', 'steps', 'hours', 'liters', 'reps', '%', 'Other'],
      default: 'Other',
    },

    currentProgress: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be negative'],
    },

    deadline: {
      type: Date,
    },

    // ✅ Added 'cancelled' status
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);