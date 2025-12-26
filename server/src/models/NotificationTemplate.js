import mongoose from 'mongoose';

const notificationTemplateSchema = new mongoose.Schema({
    // Optional gym reference (null = system default template)
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym'
    },

    // Template name/identifier
    name: {
        type: String,
        required: true,
        trim: true
    },

    // Template type
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
        required: true
    },

    // Is this template active?
    isActive: {
        type: Boolean,
        default: true
    },

    // Channels this template is enabled for
    channels: [{
        type: String,
        enum: ['email', 'sms', 'in_app']
    }],

    // Email template
    email: {
        subject: {
            type: String,
            trim: true
        },
        body: {
            type: String
        }
    },

    // SMS template (limited to 160 chars per segment)
    sms: {
        body: {
            type: String,
            maxlength: 640 // Max 4 segments
        },
        templateId: {
            type: String, // DLT Template ID for 2Factor
            trim: true
        }
    },

    // In-app notification template
    inApp: {
        title: {
            type: String,
            trim: true
        },
        body: {
            type: String
        }
    },

    // Available variables for this template
    variables: [{
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        example: {
            type: String
        }
    }],

    // Is this a system default template?
    isSystemDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index for unique template per type per gym
notificationTemplateSchema.index({ gymId: 1, type: 1 });
notificationTemplateSchema.index({ isSystemDefault: 1, type: 1 });

// Static: Get template for a specific type and gym
notificationTemplateSchema.statics.getTemplate = async function (type, gymId) {
    // First try gym-specific template
    let template = await this.findOne({
        gymId,
        type,
        isActive: true
    });

    // Fall back to system default
    if (!template) {
        template = await this.findOne({
            isSystemDefault: true,
            type,
            isActive: true
        });
    }

    return template;
};

// Replace variables in template text
notificationTemplateSchema.methods.render = function (channel, data) {
    let content = {};

    if (channel === 'email' && this.email) {
        content.subject = this.replaceVariables(this.email.subject, data);
        content.body = this.replaceVariables(this.email.body, data);
    } else if (channel === 'sms' && this.sms) {
        content.body = this.replaceVariables(this.sms.body, data);
        content.templateId = this.sms.templateId;
    } else if (channel === 'in_app' && this.inApp) {
        content.title = this.replaceVariables(this.inApp.title, data);
        content.body = this.replaceVariables(this.inApp.body, data);
    }

    return content;
};

// Helper to replace {{variable}} placeholders
notificationTemplateSchema.methods.replaceVariables = function (text, data) {
    if (!text) return '';
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] !== undefined ? data[key] : match;
    });
};

export default mongoose.model('NotificationTemplate', notificationTemplateSchema);
