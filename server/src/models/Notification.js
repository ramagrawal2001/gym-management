import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    // References
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    },

    // Notification content
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },

    // Type of notification
    type: {
        type: String,
        enum: [
            'membership_expiry_warning',
            'membership_expired',
            'payment_reminder',
            'payment_received',
            'welcome',
            'birthday',
            'announcement',
            'class_reminder',
            'otp',
            'general'
        ],
        default: 'general'
    },

    // Channel through which notification was sent
    channel: {
        type: String,
        enum: ['email', 'sms', 'whatsapp', 'in_app'],
        required: true
    },

    // Delivery status
    status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed', 'read'],
        default: 'pending'
    },

    // Timestamps for tracking
    sentAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    readAt: {
        type: Date
    },

    // Additional metadata (delivery reports, errors, etc.)
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // For in-app notifications
    isRead: {
        type: Boolean,
        default: false
    },

    // Action URL for clickable notifications
    actionUrl: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ gymId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ memberId: 1, isRead: 1 });
notificationSchema.index({ channel: 1, status: 1 });
notificationSchema.index({ type: 1 });

// Mark as read
notificationSchema.methods.markAsRead = async function () {
    this.isRead = true;
    this.readAt = new Date();
    this.status = 'read';
    return await this.save();
};

// Static: Get unread count for a user
notificationSchema.statics.getUnreadCount = async function (userId, gymId) {
    return await this.countDocuments({
        userId,
        gymId,
        channel: 'in_app',
        isRead: false
    });
};

// Static: Mark all as read for a user
notificationSchema.statics.markAllAsRead = async function (userId, gymId) {
    return await this.updateMany(
        { userId, gymId, channel: 'in_app', isRead: false },
        { isRead: true, readAt: new Date(), status: 'read' }
    );
};

export default mongoose.model('Notification', notificationSchema);
