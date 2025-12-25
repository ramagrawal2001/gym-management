import mongoose from 'mongoose';

const subscriptionInvoiceSchema = new mongoose.Schema({
    // Invoice number (auto-generated)
    invoiceNumber: {
        type: String,
        unique: true
    },

    // References
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
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

    // Amount details
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },

    // Currency
    currency: {
        type: String,
        default: 'INR',
        trim: true
    },

    // Dates
    dueDate: {
        type: Date,
        required: true
    },
    paidAt: {
        type: Date
    },

    // Status
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
        default: 'pending'
    },

    // Description/notes
    description: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Generate invoice number before saving
subscriptionInvoiceSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        const count = await mongoose.model('SubscriptionInvoice').countDocuments();
        const year = new Date().getFullYear();
        this.invoiceNumber = `SUB-${year}-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

// Index for efficient queries
subscriptionInvoiceSchema.index({ gymId: 1 });
subscriptionInvoiceSchema.index({ status: 1 });
subscriptionInvoiceSchema.index({ invoiceNumber: 1 });

export default mongoose.model('SubscriptionInvoice', subscriptionInvoiceSchema);
