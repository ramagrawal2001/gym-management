import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
  },
  checkIn: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkOut: {
    type: Date
  },
  duration: {
    type: Number // in minutes
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate duration before saving
attendanceSchema.pre('save', function(next) {
  if (this.checkOut && this.checkIn) {
    this.duration = Math.round((this.checkOut - this.checkIn) / 1000 / 60);
    this.status = 'completed';
  }
  next();
});

export default mongoose.model('Attendance', attendanceSchema);

