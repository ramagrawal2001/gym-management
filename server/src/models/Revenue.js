import mongoose from 'mongoose';

const revenueSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount must be positive']
    },
    // NEW: Reference to RevenueSource instead of enum
    sourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RevenueSource',
        required: [true, 'Revenue source is required']
    },
    // Legacy field - kept for backward compatibility during migration
    source: {
        type: String,
        enum: ['membership', 'pos_sale', 'personal_training', 'merchandise', 'classes', 'other'],
        comment: 'DEPRECATED: Use sourceId instead. Kept for migration only.'
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    revenueDate: {
        type: Date,
        required: [true, 'Revenue date is required'],
        default: Date.now
    },
    notes: {
        type: String,
        trim: true
    },
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // NEW: Automation tracking
    generatedBy: {
        type: String,
        enum: ['system', 'manual'],
        default: 'manual',
        comment: 'Tracks if revenue was auto-created by system or manually entered'
    },
    referenceType: {
        type: String,
        enum: ['invoice', 'payment', 'class', 'pt_session', 'membership', null],
        default: null,
        comment: 'Type of entity that triggered this revenue (for auto-generated)'
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        comment: 'ID of the triggering entity (invoice/payment/class/etc)'
    },
    // NEW: Reversal support for refunds
    isReversed: {
        type: Boolean,
        default: false,
        comment: 'True if this revenue was reversed due to refund'
    },
    reversedAt: {
        type: Date,
        comment: 'Timestamp when revenue was reversed'
    },
    reversalReason: {
        type: String,
        trim: true,
        comment: 'Reason for revenue reversal (refund, chargeback, etc.)'
    },
    reversalRevenueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Revenue',
        comment: 'Link to the reversal revenue entry (negative amount)'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for faster queries
revenueSchema.index({ gymId: 1, revenueDate: -1 });
revenueSchema.index({ gymId: 1, sourceId: 1 });
revenueSchema.index({ gymId: 1, generatedBy: 1 });
revenueSchema.index({ gymId: 1, referenceType: 1, referenceId: 1 });
revenueSchema.index({ isDeleted: 1 });
revenueSchema.index({ isReversed: 1 });

// Virtual to populate source details
revenueSchema.virtual('sourceDetails', {
    ref: 'RevenueSource',
    localField: 'sourceId',
    foreignField: '_id',
    justOne: true
});

// Enable virtuals in JSON
revenueSchema.set('toJSON', { virtuals: true });
revenueSchema.set('toObject', { virtuals: true });

export default mongoose.model('Revenue', revenueSchema);
