import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['super_admin', 'owner', 'staff', 'member'],
    required: true,
    default: 'member'
  },
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: function () {
      return this.role !== 'super_admin';
    }
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },

  // Member Access Control fields
  canLogin: {
    type: Boolean,
    default: true
  },
  memberPermissionLevel: {
    type: String,
    enum: ['basic', 'premium', 'vip'],
    default: 'premium'
  },
  accessRestrictions: {
    viewProfile: { type: Boolean, default: null },
    editProfile: { type: Boolean, default: null },
    viewAttendance: { type: Boolean, default: null },
    viewClasses: { type: Boolean, default: null },
    bookClasses: { type: Boolean, default: null },
    viewPayments: { type: Boolean, default: null },
    viewInvoices: { type: Boolean, default: null },
    viewWorkoutPlan: { type: Boolean, default: null },
    viewDietPlan: { type: Boolean, default: null }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);

