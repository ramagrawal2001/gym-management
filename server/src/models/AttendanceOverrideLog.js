import mongoose from 'mongoose';

const attendanceOverrideLogSchema = new mongoose.Schema({
    attendanceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attendance',
        required: true
    },
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['manual_checkin', 'manual_checkout', 'force_checkout', 'modify_time', 'delete', 'restore'],
        required: true
    },
    reason: {
        type: String,
        required: [true, 'Reason is required for all overrides'],
        trim: true,
        minlength: [10, 'Reason must be at least 10 characters']
    },
    previousValue: {
        checkIn: Date,
        checkOut: Date,
        status: String,
        duration: Number
    },
    newValue: {
        checkIn: Date,
        checkOut: Date,
        status: String,
        duration: Number
    },
    // Additional metadata
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
attendanceOverrideLogSchema.index({ gymId: 1, createdAt: -1 });
attendanceOverrideLogSchema.index({ staffId: 1, createdAt: -1 });
attendanceOverrideLogSchema.index({ memberId: 1, createdAt: -1 });
attendanceOverrideLogSchema.index({ attendanceId: 1 });

export default mongoose.model('AttendanceOverrideLog', attendanceOverrideLogSchema);
