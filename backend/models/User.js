const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      // ✅ Basic email format validation
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },

    // Profile Data
    age: {
      type: Number,
      // ✅ Sensible min/max
      min: [1, 'Age must be at least 1'],
      max: [120, 'Age must be under 120'],
    },
    height: {
      type: Number, // cm
      min: [50, 'Height must be at least 50cm'],
      max: [300, 'Height must be under 300cm'],
    },
    weight: {
      type: Number, // kg
      min: [1, 'Weight must be at least 1kg'],
      max: [500, 'Weight must be under 500kg'],
    },

    // ✅ Enum on gender
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },

    // ✅ Enum on fitnessGoal
    fitnessGoal: {
      type: String,
      enum: [
        'General Health',
        'Weight Loss',
        'Muscle Gain',
        'Endurance',
        'Flexibility',
        'Athletic Performance',
      ],
      default: 'General Health',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);