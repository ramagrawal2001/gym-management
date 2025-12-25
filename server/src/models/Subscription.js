import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    // Gym and plan references
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: [true, 'Gym ID is required']
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: [true, 'Plan ID is required']
    },

    // Subscription status
    status: {
        type: String,
        enum: ['trial', 'active', 'expired', 'cancelled', 'suspended', 'pending'],
        default: 'pending'
    },

    // Dates
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    trialEndsAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    },

    // Razorpay subscription ID (for future recurring payments)
    razorpaySubscriptionId: {
        type: String,
        trim: true
    },

    // Auto-renewal flag
    autoRenew: {
        type: Boolean,
        default: false
    },

    // Notes
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Virtual to check if subscription is currently active
subscriptionSchema.virtual('isCurrentlyActive').get(function () {
    const now = new Date();
    if (this.status === 'active' && this.endDate && this.endDate > now) {
        return true;
    }
    if (this.status === 'trial' && this.trialEndsAt && this.trialEndsAt > now) {
        return true;
    }
    return false;
});

// Virtual for days remaining
subscriptionSchema.virtual('daysRemaining').get(function () {
    const now = new Date();
    let endDate = null;

    if (this.status === 'trial' && this.trialEndsAt) {
        endDate = this.trialEndsAt;
    } else if (this.status === 'active' && this.endDate) {
        endDate = this.endDate;
    }

    if (!endDate) return 0;

    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
});

// Ensure virtuals are included
subscriptionSchema.set('toJSON', { virtuals: true });
subscriptionSchema.set('toObject', { virtuals: true });

// Index for efficient queries
subscriptionSchema.index({ gymId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });

// Static method to check and update expired subscriptions
subscriptionSchema.statics.updateExpiredSubscriptions = async function () {
    const now = new Date();

    // Update expired active subscriptions
    await this.updateMany(
        {
            status: 'active',
            endDate: { $lt: now }
        },
        { status: 'expired' }
    );

    // Update expired trials
    await this.updateMany(
        {
            status: 'trial',
            trialEndsAt: { $lt: now }
        },
        { status: 'expired' }
    );
};

export default mongoose.model('Subscription', subscriptionSchema);
