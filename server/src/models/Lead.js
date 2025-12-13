import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'trial', 'negotiation', 'converted', 'lost'],
    default: 'new'
  },
  source: {
    type: String,
    enum: ['walk-in', 'website', 'instagram', 'facebook', 'referral', 'other'],
    default: 'walk-in'
  },
  notes: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  convertedToMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  convertedAt: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Lead', leadSchema);

