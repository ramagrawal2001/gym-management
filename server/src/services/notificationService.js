import Notification from '../models/Notification.js';
import NotificationTemplate from '../models/NotificationTemplate.js';
import NotificationSettings from '../models/NotificationSettings.js';
import { sendEmail } from './emailService.js';
import smsService from './smsService.js';
import inAppService from './inAppNotificationService.js';
import wapiService from './wapiService.js';
import SystemSettings from '../models/SystemSettings.js';

/**
 * Central Notification Orchestrator
 * Sends notifications through appropriate channels based on settings
 */

/**
 * Send a notification through all enabled channels
 * @param {object} options - Notification options
 * @param {string} options.gymId - Gym ID
 * @param {string} options.type - Notification type (e.g., 'membership_expiry_warning')
 * @param {object} options.recipient - { userId?, memberId?, email?, phone?, name? }
 * @param {object} options.data - Template variables
 * @param {string[]} options.channels - Override channels (optional)
 */
export const sendNotification = async ({
    gymId,
    type,
    recipient,
    data,
    channels = null
}) => {
    const results = {
        success: true,
        channels: {}
    };

    try {
        // Get notification settings and system settings
        const [settings, sysSettings] = await Promise.all([
            NotificationSettings.getOrCreate(gymId),
            SystemSettings.getSettings()
        ]);

        // Get template for this notification type
        const template = await NotificationTemplate.getTemplate(type, gymId);

        if (!template) {
            console.log(`⚠️ No template found for type: ${type}`);
            // Use default message if no template exists
        }

        // Determine which channels to use
        const enabledChannels = channels || getEnabledChannels(settings, type, sysSettings);

        // Send through each enabled channel
        for (const channel of enabledChannels) {
            try {
                const result = await sendViaChannel(channel, {
                    gymId,
                    type,
                    recipient,
                    data,
                    template,
                    settings
                });
                results.channels[channel] = result;

                // Track usage
                if (result.success) {
                    await settings.incrementUsage(channel);
                }
            } catch (error) {
                results.channels[channel] = {
                    success: false,
                    error: error.message
                };
            }
        }

        // Log notification
        await logNotification(gymId, type, recipient, results);

        return results;
    } catch (error) {
        console.error('❌ Notification error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Get enabled channels for a notification type
 */
const getEnabledChannels = (settings, type, sysSettings) => {
    const channels = [];

    if (settings.isChannelEnabled('email', type)) channels.push('email');
    if (settings.isChannelEnabled('inApp', type)) channels.push('in_app');

    // For SMS, we check if super admin has allowed this event
    if (settings.isChannelEnabled('sms', type)) {
        const allowedSmsEvents = settings.channels?.sms?.allowedEvents || [];
        if (allowedSmsEvents.includes(type)) {
            channels.push('sms');
        }
    }

    // For WhatsApp, we check if global feature is enabled and super admin has allowed this event
    if (sysSettings?.whatsappFeatureEnabled && settings.isChannelEnabled('whatsapp', type)) {
        const allowedEvents = settings.channels?.whatsapp?.allowedEvents || [];
        if (allowedEvents.includes(type)) {
            channels.push('whatsapp');
        }
    }

    return channels;
};

/**
 * Send notification via specific channel
 */
const sendViaChannel = async (channel, { gymId, type, recipient, data, template, settings }) => {
    switch (channel) {
        case 'email':
            return await sendEmailNotification(recipient, data, template);

        case 'sms':
            return await sendSMSNotification(recipient, data, template, settings);

        case 'in_app':
            return await sendInAppNotification(gymId, recipient, data, template, type);

        case 'whatsapp':
            return await sendWhatsAppNotification(recipient, data, template);

        default:
            return { success: false, error: `Unknown channel: ${channel}` };
    }
};

/**
 * Send email notification
 */
const sendEmailNotification = async (recipient, data, template) => {
    if (!recipient.email) {
        return { success: false, error: 'No email provided' };
    }

    let subject, body;

    if (template) {
        const rendered = template.render('email', data);
        subject = rendered.subject;
        body = rendered.body;
    } else {
        // Fallback to basic message
        subject = data.subject || 'Notification from GymOS';
        body = data.message || 'You have a new notification.';
        if (data.actionUrl) {
            body += `<br><br><a href="${data.actionUrl}">Click here to view</a>`;
        }
    }

    const result = await sendEmail(recipient.email, subject, body);
    return {
        success: result.success,
        messageId: result.messageId,
        error: result.error
    };
};

/**
 * Send SMS notification
 */
const sendSMSNotification = async (recipient, data, template, settings) => {
    if (!recipient.phone) {
        return { success: false, error: 'No phone number provided' };
    }

    // Check quota
    if (!settings.canSend('sms')) {
        return { success: false, error: 'SMS quota exceeded' };
    }

    let message, templateId;

    if (template && template.sms) {
        const rendered = template.render('sms', data);
        message = rendered.body;
        templateId = rendered.templateId;
    } else {
        message = data.message || 'You have a notification from GymOS.';
        if (data.actionUrl) {
            message += `\nLink: ${data.actionUrl}`;
        }
    }

    // Use transactional SMS if we have a template ID
    if (templateId) {
        return await smsService.sendTransactionalSMS(
            recipient.phone,
            templateId,
            data
        );
    } else {
        return await smsService.sendSMS(recipient.phone, message);
    }
};

/**
 * Send in-app notification
 */
const sendInAppNotification = async (gymId, recipient, data, template, type) => {
    let title, message;

    if (template && template.inApp) {
        const rendered = template.render('in_app', data);
        title = rendered.title;
        message = rendered.body;
    } else {
        title = data.title || 'Notification';
        message = data.message || 'You have a new notification.';
    }

    return await inAppService.createNotification({
        gymId,
        userId: recipient.userId,
        memberId: recipient.memberId,
        title,
        message,
        type,
        actionUrl: data.actionUrl,
        metadata: data.metadata
    });
};

/**
 * Send WhatsApp notification
 */
const sendWhatsAppNotification = async (recipient, data, template) => {
    if (!recipient.phone) {
        return { success: false, error: 'No phone number provided' };
    }

    let message;

    if (template && template.whatsapp && template.whatsapp.body) {
        const rendered = template.render('whatsapp', data);
        message = rendered.body;
    } else {
        message = data.message || 'You have a notification from GymOS.';
        if (data.actionUrl) {
            message += `\nLink: ${data.actionUrl}`;
        }
    }

    return await wapiService.sendMessage(recipient.phone, message);
};

/**
 * Log notification for tracking
 */
const logNotification = async (gymId, type, recipient, results) => {
    // Log is handled by individual channel sends creating Notification records
    console.log(`📧 Notification sent: ${type} to ${recipient.email || recipient.phone || recipient.userId}`);
    console.log('Results:', JSON.stringify(results.channels, null, 2));
};

/**
 * Send OTP via SMS and/or Email
 */
export const sendOTP = async (gymId, recipient, otp, role = null) => {
    const results = { channels: {} };

    // Send via SMS
    if (recipient.phone) {
        results.channels.sms = await smsService.sendOTP(recipient.phone, otp);
    }

    // Send via Email 
    if (recipient.email) {
        const { sendOtpEmail } = await import('./emailService.js');
        results.channels.email = await sendOtpEmail(recipient.email, otp, role);
    }

    results.success = Object.values(results.channels).some(r => r.success);
    return results;
};

/**
 * Send membership expiry warning
 */
export const sendMembershipExpiryWarning = async (gymId, member, daysRemaining) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return await sendNotification({
        gymId,
        type: 'membership_expiry_warning',
        recipient: {
            memberId: member._id,
            email: member.email,
            phone: member.phone,
            name: member.name
        },
        data: {
            memberName: member.name,
            daysRemaining,
            expiryDate: member.membershipEndDate,
            gymName: member.gym?.name || 'Your Gym',
            actionUrl: `${clientUrl}/member/dashboard` // Or payments to renew
        }
    });
};

/**
 * Send payment received notification
 */
export const sendPaymentReceived = async (gymId, member, amount, paymentId) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return await sendNotification({
        gymId,
        type: 'payment_received',
        recipient: {
            memberId: member._id,
            email: member.email,
            phone: member.phone,
            name: member.name
        },
        data: {
            memberName: member.name,
            amount: `₹${amount}`,
            paymentId,
            date: new Date().toLocaleDateString('en-IN'),
            actionUrl: `${clientUrl}/member/payments`
        }
    });
};

/**
 * Send payment reminder notification
 */
export const sendPaymentReminder = async (gymId, member, dueDate, amountDue) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return await sendNotification({
        gymId,
        type: 'payment_reminder',
        recipient: {
            memberId: member._id,
            email: member.email,
            phone: member.phone,
            name: member.name
        },
        data: {
            memberName: member.name,
            gymName: member.gym?.name || 'Your Gym',
            dueDate: new Date(dueDate).toLocaleDateString('en-IN'),
            amountDue: `₹${amountDue}`,
            actionUrl: `${clientUrl}/login`
        }
    });
};

/**
 * Send welcome notification
 */
export const sendWelcomeNotification = async (gymId, member) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return await sendNotification({
        gymId,
        type: 'welcome',
        recipient: {
            memberId: member._id,
            email: member.email,
            phone: member.phone,
            name: member.name
        },
        data: {
            memberName: member.name,
            gymName: member.gym?.name || 'Your Gym',
            actionUrl: `${clientUrl}/login`
        }
    });
};

/**
 * Send subscription purchased notification
 */
export const sendSubscriptionPurchased = async (gymId, member, details) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return await sendNotification({
        gymId,
        type: 'subscription_purchased',
        recipient: {
            memberId: member._id,
            email: member.email,
            phone: member.phone,
            name: member.name
        },
        data: {
            memberName: member.name,
            gymName: member.gym?.name || 'Your Gym',
            planName: details.planName || 'your new plan',
            amount: `₹${details.amount}`,
            endDate: details.endDate,
            actionUrl: `${clientUrl}/member/payments`
        }
    });
};

export default {
    sendNotification,
    sendOTP,
    sendMembershipExpiryWarning,
    sendPaymentReceived,
    sendPaymentReminder,
    sendWelcomeNotification,
    sendSubscriptionPurchased
};
