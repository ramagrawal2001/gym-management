import mongoose from 'mongoose';

const revenueSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount must be positive']
    },
    source: {
        type: String,
        enum: ['membership', 'pos_sale', 'personal_training', 'merchandise', 'classes', 'other'],
        required: [true, 'Revenue source is required'],
        default: 'other'
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
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for faster queries
revenueSchema.index({ gymId: 1, revenueDate: -1 });
revenueSchema.index({ gymId: 1, source: 1 });
revenueSchema.index({ isDeleted: 1 });

export default mongoose.model('Revenue', revenueSchema);
