import SystemSettings from '../models/SystemSettings.js';
import { sendSuccess, sendError } from '../utils/responseFormatter.js';

// @desc    Get system settings
// @route   GET /api/v1/system-settings
// @access  Public (or authenticated for some)
export const getSystemSettings = async (req, res) => {
    try {
        const settings = await SystemSettings.getSettings();
        sendSuccess(res, 'System settings retrieved', settings);
    } catch (error) {
        sendError(res, 500, 'Failed to get system settings', error.message);
    }
};

// @desc    Update system settings
// @route   PUT /api/v1/system-settings
// @access  Private (Super Admin)
export const updateSystemSettings = async (req, res) => {
    try {
        const { whatsappFeatureEnabled } = req.body;
        
        let settings = await SystemSettings.getSettings();
        
        if (typeof whatsappFeatureEnabled !== 'undefined') {
            settings.whatsappFeatureEnabled = whatsappFeatureEnabled;
        }

        await settings.save();
        sendSuccess(res, 'System settings updated', settings);
    } catch (error) {
        sendError(res, 500, 'Failed to update system settings', error.message);
    }
};
