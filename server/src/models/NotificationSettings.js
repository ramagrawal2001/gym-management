import mongoose from 'mongoose';

const notificationSettingsSchema = new mongoose.Schema({
    // Gym reference
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true,
        unique: true
    },

    // Channel configurations
    channels: {
        email: {
            enabled: {
                type: Boolean,
                default: true
            },
            // Use system default or custom SMTP
            useSystemDefault: {
                type: Boolean,
                default: true
            },
            // Custom SMTP settings (optional)
            smtp: {
                host: String,
                port: Number,
                user: String,
                password: String,
                fromEmail: String,
                fromName: String
            }
        },
        sms: {
            enabled: {
                type: Boolean,
                default: false
            },
            provider: {
                type: String,
                enum: ['2factor', 'msg91', 'twilio'],
                default: '2factor'
            },
            // 2Factor.in credentials
            credentials: {
                apiKey: String,
                senderId: String
            }
        },
        inApp: {
            enabled: {
                type: Boolean,
                default: true
            }
        }
    },

    // Notification type settings
    notificationTypes: {
        membership_expiry_warning: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            inApp: { type: Boolean, default: true },
            daysBeforeExpiry: { type: Number, default: 7 }
        },
        membership_expired: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            inApp: { type: Boolean, default: true }
        },
        payment_reminder: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            inApp: { type: Boolean, default: true }
        },
        payment_received: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
            inApp: { type: Boolean, default: true }
        },
        welcome: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            inApp: { type: Boolean, default: true }
        },
        birthday: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            inApp: { type: Boolean, default: true }
        },
        otp: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            inApp: { type: Boolean, default: false }
        }
    },

    // Usage quotas (for tracking)
    quotas: {
        sms: {
            monthlyLimit: { type: Number, default: 0 }, // 0 = unlimited
            used: { type: Number, default: 0 },
            resetDate: { type: Date }
        },
        email: {
            dailyLimit: { type: Number, default: 0 }, // 0 = unlimited
            used: { type: Number, default: 0 },
            resetDate: { type: Date }
        }
    }
}, {
    timestamps: true
});

// Get or create settings for a gym
notificationSettingsSchema.statics.getOrCreate = async function (gymId) {
    let settings = await this.findOne({ gymId });

    if (!settings) {
        settings = await this.create({ gymId });
    }

    return settings;
};

// Check if a channel is enabled for a notification type
notificationSettingsSchema.methods.isChannelEnabled = function (channel, notificationType) {
    // Check if channel is globally enabled
    if (!this.channels[channel]?.enabled) {
        return false;
    }

    // Check if channel is enabled for this notification type
    const typeSettings = this.notificationTypes[notificationType];
    if (typeSettings && typeSettings[channel] !== undefined) {
        return typeSettings[channel];
    }

    return true; // Default to enabled if not specified
};

// Increment usage counter
notificationSettingsSchema.methods.incrementUsage = async function (channel) {
    if (channel === 'sms') {
        this.quotas.sms.used += 1;
    } else if (channel === 'email') {
        this.quotas.email.used += 1;
    }
    return await this.save();
};

// Check if quota allows sending
notificationSettingsSchema.methods.canSend = function (channel) {
    if (channel === 'sms' && this.quotas.sms.monthlyLimit > 0) {
        return this.quotas.sms.used < this.quotas.sms.monthlyLimit;
    }
    if (channel === 'email' && this.quotas.email.dailyLimit > 0) {
        return this.quotas.email.used < this.quotas.email.dailyLimit;
    }
    return true;
};

export default mongoose.model('NotificationSettings', notificationSettingsSchema);
