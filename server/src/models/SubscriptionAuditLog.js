import mongoose from 'mongoose';

const subscriptionAuditLogSchema = new mongoose.Schema({
    // References
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan'
    },
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true
    },

    // Action type
    action: {
        type: String,
        enum: [
            'plan_created',
            'plan_updated',
            'plan_deleted',
            'subscription_created',
            'subscription_activated',
            'subscription_expired',
            'subscription_cancelled',
            'subscription_upgraded',
            'subscription_downgraded',
            'payment_initiated',
            'payment_completed',
            'payment_failed',
            'payment_refunded',
            'manual_payment_approved',
            'manual_payment_rejected',
            'invoice_created',
            'invoice_paid',
            'link_generated',
            'link_accessed'
        ],
        required: true
    },

    // Details
    description: {
        type: String,
        required: true
    },

    // Before/After state for changes
    previousState: {
        type: mongoose.Schema.Types.Mixed
    },
    newState: {
        type: mongoose.Schema.Types.Mixed
    },

    // Metadata
    metadata: {
        paymentId: String,
        invoiceId: String,
        amount: Number,
        currency: String,
        method: String,
        ipAddress: String,
        userAgent: String
    },

    // Who performed the action
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    performedByRole: {
        type: String,
        enum: ['super_admin', 'owner', 'staff', 'system']
    }
}, {
    timestamps: true
});

// Index for efficient queries
subscriptionAuditLogSchema.index({ gymId: 1, createdAt: -1 });
subscriptionAuditLogSchema.index({ subscriptionId: 1 });
subscriptionAuditLogSchema.index({ action: 1 });

// Static method to create audit log
subscriptionAuditLogSchema.statics.log = async function (data) {
    return await this.create(data);
};

export default mongoose.model('SubscriptionAuditLog', subscriptionAuditLogSchema);
