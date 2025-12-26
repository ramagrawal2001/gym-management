import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    ticketNumber: {
        type: String,
        unique: true,
        required: true
    },

    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: 200
    },

    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },

    category: {
        type: String,
        enum: ['membership', 'payments', 'classes', 'technical', 'complaint', 'other'],
        default: 'other'
    },

    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },

    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open'
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    replies: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
            required: true
        },
        isStaff: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    attachments: [{
        fileName: String,
        fileUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    resolvedAt: {
        type: Date
    },

    closedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Generate unique ticket number
supportTicketSchema.pre('save', async function (next) {
    if (!this.ticketNumber) {
        const count = await mongoose.model('SupportTicket').countDocuments({ gymId: this.gymId });
        this.ticketNumber = `TICKET-${Date.now().toString(36).toUpperCase()}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
});

// Update resolved/closed timestamps
supportTicketSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        if (this.status === 'resolved' && !this.resolvedAt) {
            this.resolvedAt = new Date();
        }
        if (this.status === 'closed' && !this.closedAt) {
            this.closedAt = new Date();
        }
    }
    next();
});

// Indexes
supportTicketSchema.index({ gymId: 1, status: 1 });
supportTicketSchema.index({ gymId: 1, userId: 1 });
supportTicketSchema.index({ gymId: 1, assignedTo: 1 });

export default mongoose.model('SupportTicket', supportTicketSchema);
