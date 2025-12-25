import mongoose from 'mongoose';

const attendanceConfigSchema = new mongoose.Schema({
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true,
        unique: true
    },
    // Available methods assigned by super_admin
    availableMethods: [{
        type: String,
        enum: ['qr', 'manual', 'nfc', 'biometric'],
        default: ['manual']
    }],
    // Currently active methods selected by gym owner (can be multiple)
    activeMethods: [{
        type: String,
        enum: ['qr', 'manual', 'nfc', 'biometric'],
        default: ['manual']
    }],
    // Enable/disable attendance for this gym
    isEnabled: {
        type: Boolean,
        default: true
    },
    // QR-specific settings
    qrSettings: {
        // Static QR (one per member) or dynamic (regenerated)
        type: {
            type: String,
            enum: ['static', 'dynamic'],
            default: 'static'
        },
        // For dynamic QR, expiry in minutes
        expiryMinutes: {
            type: Number,
            default: 1440 // 24 hours
        },
        // Allow multiple check-ins per day
        allowMultipleCheckins: {
            type: Boolean,
            default: false
        }
    },
    // Auto checkout settings
    autoCheckout: {
        enabled: {
            type: Boolean,
            default: false
        },
        // Auto checkout after X hours
        afterHours: {
            type: Number,
            default: 4
        },
        // Fixed time for auto checkout (e.g., "22:00")
        fixedTime: {
            type: String
        }
    },
    // Working hours for attendance
    workingHours: {
        enabled: {
            type: Boolean,
            default: false
        },
        start: {
            type: String, // "06:00"
            default: '06:00'
        },
        end: {
            type: String, // "22:00"
            default: '22:00'
        }
    }
}, {
    timestamps: true
});

// Index for faster lookups
attendanceConfigSchema.index({ gymId: 1 });

export default mongoose.model('AttendanceConfig', attendanceConfigSchema);
