import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        // If null, it's a global FAQ visible to all gyms
        default: null
    },

    question: {
        type: String,
        required: [true, 'Question is required'],
        trim: true
    },

    answer: {
        type: String,
        required: [true, 'Answer is required'],
        trim: true
    },

    category: {
        type: String,
        enum: ['membership', 'payments', 'classes', 'technical', 'general'],
        default: 'general'
    },

    isGlobal: {
        type: Boolean,
        default: false
    },

    order: {
        type: Number,
        default: 0
    },

    isActive: {
        type: Boolean,
        default: true
    },

    views: {
        type: Number,
        default: 0
    },

    helpful: {
        type: Number,
        default: 0
    },

    notHelpful: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
faqSchema.index({ gymId: 1, isActive: 1, order: 1 });
faqSchema.index({ category: 1, isActive: 1 });
faqSchema.index({ isGlobal: 1, isActive: 1 });

export default mongoose.model('FAQ', faqSchema);
