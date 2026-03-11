import mongoose from 'mongoose';

const platformLeadSchema = new mongoose.Schema({
    businessName: {
        type: String,
        required: [true, 'Business Name is required'],
        trim: true
    },
    contactName: {
        type: String,
        required: [true, 'Contact Name is required'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Demo Scheduled', 'Negotiation', 'Converted', 'Lost'],
        default: 'New'
    },
    source: {
        type: String,
        enum: ['Website Inbound', 'Referral', 'Cold Call', 'Social Media', 'Other'],
        default: 'Website Inbound'
    },
    expectedValue: {
        type: Number,
        default: 0
    },
    nextFollowUp: {
        type: Date
    },
    planInterest: {
        type: String,
        trim: true
    },
    notes: [{
        text: {
            type: String,
            required: true
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    convertedToGym: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym'
    },
    convertedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Search index for easy querying
platformLeadSchema.index({ businessName: 'text', contactName: 'text', email: 'text' });
platformLeadSchema.index({ status: 1 });
platformLeadSchema.index({ nextFollowUp: 1 });

export default mongoose.model('PlatformLead', platformLeadSchema);
