import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount must be positive']
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExpenseCategory',
        required: [true, 'Category is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    expenseDate: {
        type: Date,
        required: [true, 'Expense date is required'],
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'bank_transfer', 'online', 'check', 'other'],
        default: 'cash'
    },
    vendor: {
        type: String,
        trim: true
    },
    receiptUrl: {
        type: String,
        trim: true
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvalNotes: {
        type: String,
        trim: true
    },
    approvedAt: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for faster queries
expenseSchema.index({ gymId: 1, expenseDate: -1 });
expenseSchema.index({ gymId: 1, approvalStatus: 1 });
expenseSchema.index({ gymId: 1, categoryId: 1 });
expenseSchema.index({ isDeleted: 1 });

// Virtual for category details (populated)
expenseSchema.virtual('category', {
    ref: 'ExpenseCategory',
    localField: 'categoryId',
    foreignField: '_id',
    justOne: true
});

export default mongoose.model('Expense', expenseSchema);
