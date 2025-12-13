import mongoose from 'mongoose';

const gymSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Gym name is required'],
    trim: true
  },
  subdomain: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  },
  features: {
    crm: { type: Boolean, default: true },
    scheduling: { type: Boolean, default: true },
    attendance: { type: Boolean, default: true },
    inventory: { type: Boolean, default: true },
    staff: { type: Boolean, default: true },
    payments: { type: Boolean, default: true },
    reports: { type: Boolean, default: true }
  },
  branding: {
    logo: { type: String },
    primaryColor: { type: String, default: '#2563eb' },
    secondaryColor: { type: String, default: '#64748b' }
  },
  contact: {
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    website: { type: String }
  },
  settings: {
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'UTC' }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Gym', gymSchema);

