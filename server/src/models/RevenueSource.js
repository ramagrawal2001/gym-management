import mongoose from 'mongoose';

const revenueSourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Source name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['recurring', 'one-time'],
        required: [true, 'Category is required'],
        default: 'one-time'
    },
    autoGenerate: {
        type: Boolean,
        default: false,
        comment: 'If true, revenue is auto-created by system, manual entry blocked'
    },
    linkedModule: {
        type: String,
        enum: ['membership', 'pt', 'cardio', 'class', 'pos', 'admission', null],
        default: null,
        comment: 'Which module auto-generates this revenue'
    },
    defaultAmount: {
        type: Number,
        min: 0,
        comment: 'Optional default amount for this source'
    },
    gstApplicable: {
        type: Boolean,
        default: false,
        comment: 'Whether GST/tax applies to this revenue source'
    },
    isSystemSource: {
        type: Boolean,
        default: false,
        comment: 'System sources cannot be deleted, only disabled'
    },
    isActive: {
        type: Boolean,
        default: true,
        comment: 'Enable/disable this revenue source'
    },
    icon: {
        type: String,
        default: '💰',
        comment: 'Emoji icon for UI display'
    },
    color: {
        type: String,
        default: '#10b981',
        match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        comment: 'Hex color code for UI display'
    },
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for faster queries
revenueSourceSchema.index({ gymId: 1, isActive: 1 });
revenueSourceSchema.index({ gymId: 1, isSystemSource: 1 });
revenueSourceSchema.index({ gymId: 1, linkedModule: 1 });
revenueSourceSchema.index({ isDeleted: 1 });

// Compound index for unique source names per gym
revenueSourceSchema.index({ gymId: 1, name: 1 }, { unique: true });

// Pre-delete validation: prevent deletion of system sources
revenueSourceSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();

    if (update.isDeleted === true || update.$set?.isDeleted === true) {
        const doc = await this.model.findOne(this.getQuery());
        if (doc && doc.isSystemSource) {
            throw new Error('Cannot delete system revenue sources. You can disable them instead.');
        }
    }
    next();
});

export default mongoose.model('RevenueSource', revenueSourceSchema);
