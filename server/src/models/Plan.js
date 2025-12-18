import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  duration: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    required: true,
    default: 'monthly'
  },
  features: [{
    type: String,
    trim: true
  }],
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: function() {
      // gymId is required for all plans except those created by super admin for gym subscriptions
      // For now, we'll make it required but can be null for super admin's subscription plans
      return false; // Allow null for backward compatibility and super admin plans
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Plan', planSchema);

