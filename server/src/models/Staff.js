import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
  },
  specialty: {
    type: String,
    trim: true
  },
  certifications: [{
    name: { type: String },
    issuer: { type: String },
    date: { type: Date }
  }],
  schedule: {
    type: String,
    trim: true
  },
  hourlyRate: {
    type: Number,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Staff', staffSchema);

