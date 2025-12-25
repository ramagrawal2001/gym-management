import mongoose from 'mongoose';
import crypto from 'crypto';

const subscriptionPlanSchema = new mongoose.Schema({
    // Required: Plan linked to specific gym
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: [true, 'Gym ID is required']
    },

    // Plan details
    name: {
        type: String,
        required: [true, 'Plan name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },

    // Custom pricing for this gym
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },

    // Duration
    duration: {
        type: String,
        enum: ['monthly', 'quarterly', 'yearly'],
        required: true,
        default: 'monthly'
    },

    // Duration in days (calculated based on duration type)
    durationDays: {
        type: Number,
        default: function () {
            switch (this.duration) {
                case 'monthly': return 30;
                case 'quarterly': return 90;
                case 'yearly': return 365;
                default: return 30;
            }
        }
    },

    // Plan feature limits
    features: {
        maxMembers: { type: Number, default: 100 },
        maxBranches: { type: Number, default: 1 },
        maxStorage: { type: Number, default: 1024 }, // in MB
        // Feature toggles
        crm: { type: Boolean, default: true },
        scheduling: { type: Boolean, default: true },
        attendance: { type: Boolean, default: true },
        inventory: { type: Boolean, default: true },
        staff: { type: Boolean, default: true },
        payments: { type: Boolean, default: true },
        reports: { type: Boolean, default: true }
    },

    // Trial days (0 = no trial)
    trialDays: {
        type: Number,
        default: 0,
        min: 0
    },

    // Shareable payment link token
    paymentLinkToken: {
        type: String,
        unique: true,
        sparse: true
    },

    // Status flags
    isActive: {
        type: Boolean,
        default: true
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: {
        type: Date
    },

    // Created by super admin
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Generate payment link token before saving
subscriptionPlanSchema.pre('save', function (next) {
    if (!this.paymentLinkToken) {
        this.paymentLinkToken = crypto.randomBytes(32).toString('hex');
    }
    next();
});

// Virtual for payment link URL
subscriptionPlanSchema.virtual('paymentLink').get(function () {
    return `/pay/${this.paymentLinkToken}`;
});

// Ensure virtuals are included in JSON output
subscriptionPlanSchema.set('toJSON', { virtuals: true });
subscriptionPlanSchema.set('toObject', { virtuals: true });

// Index for efficient queries
subscriptionPlanSchema.index({ gymId: 1 });
subscriptionPlanSchema.index({ paymentLinkToken: 1 });

export default mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
