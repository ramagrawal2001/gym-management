import axios from 'axios';

/**
 * Service to handle sending WhatsApp messages via WAPI Cloud
 */
class WapiService {
    constructor() {
        this.baseUrl = process.env.WAPI_BASE_URL || 'https://wa.wapi.pro';
        this.token = process.env.WAPI_TOKEN;
        this.instanceId = process.env.WAPI_INSTANCE_ID;
    }

    /**
     * Check if WAPI is configured
     */
    isConfigured() {
        return !!this.token && !!this.instanceId;
    }

    /**
     * Format phone number for WhatsApp (remove +, spaces, ensure country code)
     */
    formatPhoneNumber(phone) {
        if (!phone) return null;
        // Remove spaces, dashes, parentheses, or '+'
        let cleaned = phone.replace(/[\s\-()+]/g, '');
        
        // Ensure India country code by default if length is 10 digits
        if (cleaned.length === 10) {
            cleaned = `91${cleaned}`;
        }
        
        return cleaned;
    }

    /**
     * Send a WhatsApp message text
     * @param {string} phone - Recipient phone number
     * @param {string} message - Message body
     */
    async sendMessage(phone, message) {
        if (!this.isConfigured()) {
            console.error('⚠️ WAPI Cloud is not fully configured (missing token or instanceId)');
            return { success: false, error: 'WAPI credentials missing' };
        }

        const formattedPhone = this.formatPhoneNumber(phone);
        if (!formattedPhone) {
            return { success: false, error: 'Invalid phone number' };
        }

        try {
            // Documented WAPI send message URL: {baseUrl}/instances/{instanceId}/client/action/send-message
            const url = `${this.baseUrl}/instances/${this.instanceId}/client/action/send-message`;
            
            const response = await axios.post(url, {
                phone: formattedPhone,
                message: message
            }, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.status === 'success') {
                return { success: true, response: response.data };
            } else {
                return { success: false, error: response.data?.message || 'WAPI Error' };
            }
        } catch (error) {
            console.error('❌ WAPI send message error:', error?.response?.data || error.message);
            return { success: false, error: error?.response?.data?.message || error.message };
        }
    }
}

export default new WapiService();
