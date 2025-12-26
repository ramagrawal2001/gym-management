/**
 * SMS Service using 2Factor.in API
 * Documentation: https://2factor.in/API-Docs/
 */

const BASE_URL = 'https://2factor.in/API/V1';

/**
 * Send OTP via 2Factor.in
 * @param {string} phone - Phone number (with country code)
 * @param {string} otp - OTP to send
 * @param {string} templateName - OTP template name (optional)
 */
export const sendOTP = async (phone, otp, templateName = 'GYMOTP') => {
    const apiKey = process.env.TWOFACTOR_API_KEY;

    if (!apiKey) {
        console.log(`[SMS Service] API key not configured. OTP: ${otp} for ${phone}`);
        return { success: true, simulated: true };
    }

    try {
        // Clean phone number (remove +91 if present, keep only digits)
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);

        const response = await fetch(
            `${BASE_URL}/${apiKey}/SMS/${cleanPhone}/${otp}/${templateName}`,
            { method: 'GET' }
        );

        const data = await response.json();

        if (data.Status === 'Success') {
            console.log(`✅ OTP SMS sent to ${cleanPhone}: ${data.Details}`);
            return {
                success: true,
                sessionId: data.Details,
                message: 'OTP sent successfully'
            };
        } else {
            console.error(`❌ SMS failed: ${data.Details}`);
            return {
                success: false,
                error: data.Details
            };
        }
    } catch (error) {
        console.error('❌ SMS Service Error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Verify OTP via 2Factor.in
 * @param {string} sessionId - Session ID from sendOTP response
 * @param {string} otp - OTP entered by user
 */
export const verifyOTP = async (sessionId, otp) => {
    const apiKey = process.env.TWOFACTOR_API_KEY;

    if (!apiKey) {
        console.log(`[SMS Service] API key not configured. Simulating OTP verification.`);
        return { success: true, simulated: true };
    }

    try {
        const response = await fetch(
            `${BASE_URL}/${apiKey}/SMS/VERIFY/${sessionId}/${otp}`,
            { method: 'GET' }
        );

        const data = await response.json();

        if (data.Status === 'Success' && data.Details === 'OTP Matched') {
            return { success: true, verified: true };
        } else {
            return { success: false, verified: false, error: data.Details };
        }
    } catch (error) {
        console.error('❌ OTP Verification Error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send Transactional SMS via 2Factor.in
 * @param {string} phone - Phone number
 * @param {string} templateName - Registered DLT template name
 * @param {object} variables - Template variables (VAR1, VAR2, etc.)
 */
export const sendTransactionalSMS = async (phone, templateName, variables = {}) => {
    const apiKey = process.env.TWOFACTOR_API_KEY;
    const senderId = process.env.TWOFACTOR_SENDER_ID || 'GYMOTP';

    if (!apiKey) {
        console.log(`[SMS Service] API key not configured. Would send: ${templateName} to ${phone}`);
        console.log('Variables:', variables);
        return { success: true, simulated: true };
    }

    try {
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);

        const response = await fetch(
            `${BASE_URL}/${apiKey}/ADDON_SERVICES/SEND/TSMS`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    From: senderId,
                    To: cleanPhone,
                    TemplateName: templateName,
                    ...variables
                })
            }
        );

        const data = await response.json();

        if (data.Status === 'Success') {
            console.log(`✅ Transactional SMS sent to ${cleanPhone}`);
            return {
                success: true,
                messageId: data.Details
            };
        } else {
            console.error(`❌ SMS failed: ${data.Details}`);
            return {
                success: false,
                error: data.Details
            };
        }
    } catch (error) {
        console.error('❌ SMS Service Error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send SMS with custom message (for promotional or alerts)
 * @param {string} phone - Phone number
 * @param {string} message - Message text
 * @param {string} templateId - DLT Template ID
 */
export const sendSMS = async (phone, message, templateId = null) => {
    const apiKey = process.env.TWOFACTOR_API_KEY;
    const senderId = process.env.TWOFACTOR_SENDER_ID || 'GYMOTP';

    if (!apiKey) {
        console.log(`[SMS Service] Would send SMS to ${phone}: ${message}`);
        return { success: true, simulated: true };
    }

    try {
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);

        // Use the appropriate endpoint based on whether we have a template ID
        const endpoint = templateId
            ? `${BASE_URL}/${apiKey}/ADDON_SERVICES/SEND/TSMS`
            : `${BASE_URL}/${apiKey}/SMS/${cleanPhone}/${encodeURIComponent(message)}`;

        const response = await fetch(endpoint, { method: 'GET' });
        const data = await response.json();

        if (data.Status === 'Success') {
            console.log(`✅ SMS sent to ${cleanPhone}`);
            return { success: true, messageId: data.Details };
        } else {
            console.error(`❌ SMS failed: ${data.Details}`);
            return { success: false, error: data.Details };
        }
    } catch (error) {
        console.error('❌ SMS Service Error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Check SMS balance/credits
 */
export const checkBalance = async () => {
    const apiKey = process.env.TWOFACTOR_API_KEY;

    if (!apiKey) {
        return { success: false, error: 'API key not configured' };
    }

    try {
        const response = await fetch(
            `${BASE_URL}/${apiKey}/BAL/SMS`,
            { method: 'GET' }
        );

        const data = await response.json();

        if (data.Status === 'Success') {
            return {
                success: true,
                balance: data.Details
            };
        } else {
            return { success: false, error: data.Details };
        }
    } catch (error) {
        console.error('❌ Balance Check Error:', error.message);
        return { success: false, error: error.message };
    }
};

export default {
    sendOTP,
    verifyOTP,
    sendTransactionalSMS,
    sendSMS,
    checkBalance
};
