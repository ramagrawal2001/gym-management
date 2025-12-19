import mongoose from 'mongoose';
import crypto from 'crypto';

const memberSchema = new mongoose.Schema({
  profileImage: {
    url: { type: String },
    publicId: { type: String }
  },
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
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },

  memberId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },

  subscriptionStart: {
    type: Date,
    required: true
  },
  subscriptionEnd: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ['active', 'expired', 'suspended', 'cancelled'],
    default: 'active'
  },

  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },

  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    trim: true
  },

  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true }
  },

  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relation: { type: String }
  },

  medicalInfo: {
    conditions: [String],
    medications: [String],
    allergies: [String]
  },

  workoutPlan: {
    type: String,
    trim: true
  },
  dietPlan: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }

}, {
  timestamps: true
});

// Auto-generate Member ID using timestamp + random for fast, unique generation
memberSchema.pre('save', async function(next) {
  if (!this.memberId) {
    // Generate unique ID: M + timestamp (base36, shorter) + random hex
    // Format: M + [timestamp in base36] + [4 random hex chars]
    // Example: M1234567890ABCD
    const timestamp = Date.now().toString(36).toUpperCase(); // Base36 for shorter length
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase(); // 4 hex chars
    this.memberId = `M${timestamp}${randomHex}`;
  }
  next();
});

export default mongoose.model('Member', memberSchema);
