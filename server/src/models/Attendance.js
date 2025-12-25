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
  },
  // New fields for attendance system
  method: {
    type: String,
    enum: ['qr', 'manual', 'nfc', 'biometric'],
    default: 'manual'
  },
  // QR code used for check-in (if applicable)
  qrCode: {
    type: String,
    trim: true
  },
  // Staff override tracking
  staffOverride: {
    isOverridden: {
      type: Boolean,
      default: false
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      trim: true
    },
    overriddenAt: {
      type: Date
    }
  },
  // Device/IP information for validation
  deviceInfo: {
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    deviceId: {
      type: String
    }
  }
}, {
  timestamps: true
});

// Calculate duration before saving
attendanceSchema.pre('save', function (next) {
  if (this.checkOut && this.checkIn) {
    this.duration = Math.round((this.checkOut - this.checkIn) / 1000 / 60);
    this.status = 'completed';
  }
  next();
});

// Indexes for efficient querying
attendanceSchema.index({ gymId: 1, checkIn: -1 });
attendanceSchema.index({ memberId: 1, checkIn: -1 });
attendanceSchema.index({ gymId: 1, status: 1 });
attendanceSchema.index({ qrCode: 1 });

export default mongoose.model('Attendance', attendanceSchema);


