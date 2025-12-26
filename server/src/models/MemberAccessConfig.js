import mongoose from 'mongoose';

const memberAccessConfigSchema = new mongoose.Schema({
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true,
        unique: true
    },

    // Default member portal features
    defaultFeatureAccess: {
        viewProfile: { type: Boolean, default: true },
        editProfile: { type: Boolean, default: true },
        viewAttendance: { type: Boolean, default: true },
        viewClasses: { type: Boolean, default: true },
        bookClasses: { type: Boolean, default: true },
        viewPayments: { type: Boolean, default: true },
        viewInvoices: { type: Boolean, default: true },
        viewWorkoutPlan: { type: Boolean, default: true },
        viewDietPlan: { type: Boolean, default: true }
    },

    // Permission levels configuration
    permissionLevels: {
        basic: {
            viewProfile: { type: Boolean, default: true },
            editProfile: { type: Boolean, default: false },
            viewAttendance: { type: Boolean, default: true },
            viewClasses: { type: Boolean, default: true },
            bookClasses: { type: Boolean, default: false },
            viewPayments: { type: Boolean, default: true },
            viewInvoices: { type: Boolean, default: true },
            viewWorkoutPlan: { type: Boolean, default: true },
            viewDietPlan: { type: Boolean, default: true }
        },
        premium: {
            viewProfile: { type: Boolean, default: true },
            editProfile: { type: Boolean, default: true },
            viewAttendance: { type: Boolean, default: true },
            viewClasses: { type: Boolean, default: true },
            bookClasses: { type: Boolean, default: true },
            viewPayments: { type: Boolean, default: true },
            viewInvoices: { type: Boolean, default: true },
            viewWorkoutPlan: { type: Boolean, default: true },
            viewDietPlan: { type: Boolean, default: true }
        },
        vip: {
            viewProfile: { type: Boolean, default: true },
            editProfile: { type: Boolean, default: true },
            viewAttendance: { type: Boolean, default: true },
            viewClasses: { type: Boolean, default: true },
            bookClasses: { type: Boolean, default: true },
            viewPayments: { type: Boolean, default: true },
            viewInvoices: { type: Boolean, default: true },
            viewWorkoutPlan: { type: Boolean, default: true },
            viewDietPlan: { type: Boolean, default: true }
        }
    }
}, {
    timestamps: true
});

// Create default config when gym is created
memberAccessConfigSchema.statics.createDefaultConfig = async function (gymId) {
    const config = await this.findOne({ gymId });
    if (!config) {
        return await this.create({ gymId });
    }
    return config;
};

export default mongoose.model('MemberAccessConfig', memberAccessConfigSchema);
