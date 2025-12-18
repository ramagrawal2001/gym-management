import mongoose from 'mongoose';

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

// Auto-generate Member ID
memberSchema.pre('save', async function(next) {
  if (!this.memberId) {
    const count = await mongoose.model('Member')
      .countDocuments({ gymId: this.gymId });
    this.memberId = `M${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('Member', memberSchema);
