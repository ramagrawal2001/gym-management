import mongoose from 'mongoose';

const subscriptionPaymentSchema = new mongoose.Schema({
    // References
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionInvoice',
        required: true
    },
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: true
    },

    // Razorpay payment details
    razorpayOrderId: {
        type: String,
        required: true,
        trim: true
    },
    razorpayPaymentId: {
        type: String,
        trim: true
    },
    razorpaySignature: {
        type: String,
        trim: true
    },

    // Amount
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR',
        trim: true
    },

    // Payment status
    status: {
        type: String,
        enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
        default: 'created'
    },

    // Payment method details from Razorpay
    method: {
        type: String,
        trim: true
    },
    bank: {
        type: String,
        trim: true
    },
    wallet: {
        type: String,
        trim: true
    },
    vpa: {
        type: String,
        trim: true
    },

    // Error details (if failed)
    errorCode: {
        type: String,
        trim: true
    },
    errorDescription: {
        type: String,
        trim: true
    },

    // Paid at (when payment was captured)
    paidAt: {
        type: Date
    },

    // Notes
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
subscriptionPaymentSchema.index({ razorpayOrderId: 1 });
subscriptionPaymentSchema.index({ razorpayPaymentId: 1 });
subscriptionPaymentSchema.index({ gymId: 1 });
subscriptionPaymentSchema.index({ status: 1 });

export default mongoose.model('SubscriptionPayment', subscriptionPaymentSchema);
