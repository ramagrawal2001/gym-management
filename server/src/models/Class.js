import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schedule: {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6 // 0 = Sunday, 6 = Saturday
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true
    }
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  bookings: [{
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    bookedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isRecurring: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    required: [true, 'Class start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date,
    // Optional: if it's not recurring, this could just be the start date
    // If it is recurring, it could have an expiration date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Class', classSchema);

