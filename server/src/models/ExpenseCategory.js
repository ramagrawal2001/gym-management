import mongoose from 'mongoose';

const expenseCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    icon: {
        type: String,
        default: '💰'
    },
    color: {
        type: String,
        default: '#3b82f6'
    },
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
expenseCategorySchema.index({ gymId: 1, isActive: 1 });

export default mongoose.model('ExpenseCategory', expenseCategorySchema);
