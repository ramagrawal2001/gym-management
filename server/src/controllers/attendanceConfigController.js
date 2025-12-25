import AttendanceConfig from '../models/AttendanceConfig.js';
import Gym from '../models/Gym.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';

// @desc    Get attendance configuration for a gym
// @route   GET /api/v1/attendance-config
// @access  Private (Owner, Staff)
export const getConfig = async (req, res) => {
    try {
        const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.user.gymId;

        if (!gymId) {
            return sendError(res, 400, 'Gym ID is required');
        }

        let config = await AttendanceConfig.findOne({ gymId });

        // Create default config if none exists
        if (!config) {
            config = await AttendanceConfig.create({
                gymId,
                availableMethods: ['manual'],
                activeMethods: ['manual'],
                isEnabled: true
            });

            // Link config to gym
            await Gym.findByIdAndUpdate(gymId, { attendanceConfigId: config._id });
        }

        sendSuccess(res, 'Attendance configuration retrieved successfully', config);
    } catch (error) {
        sendError(res, 500, 'Failed to get attendance configuration', error.message);
    }
};

// @desc    Update attendance configuration
// @route   PUT /api/v1/attendance-config
// @access  Private (Owner)
export const updateConfig = async (req, res) => {
    try {
        const gymId = req.user.gymId;
        const { activeMethods, qrSettings, autoCheckout, workingHours, isEnabled } = req.body;

        let config = await AttendanceConfig.findOne({ gymId });

        if (!config) {
            return sendError(res, 404, 'Attendance configuration not found');
        }

        // Validate that all activeMethods are in availableMethods
        if (activeMethods && Array.isArray(activeMethods)) {
            const invalidMethods = activeMethods.filter(m => !config.availableMethods.includes(m));
            if (invalidMethods.length > 0) {
                return sendError(res, 400, `Methods '${invalidMethods.join(', ')}' are not available for this gym. Available methods: ${config.availableMethods.join(', ')}`);
            }
            if (activeMethods.length === 0) {
                return sendError(res, 400, 'At least one active method is required');
            }
            config.activeMethods = activeMethods;
        }

        // Update config
        if (qrSettings !== undefined) config.qrSettings = { ...config.qrSettings.toObject?.() || config.qrSettings, ...qrSettings };
        if (autoCheckout !== undefined) config.autoCheckout = { ...config.autoCheckout.toObject?.() || config.autoCheckout, ...autoCheckout };
        if (workingHours !== undefined) config.workingHours = { ...config.workingHours.toObject?.() || config.workingHours, ...workingHours };
        if (isEnabled !== undefined) config.isEnabled = isEnabled;

        await config.save();

        sendSuccess(res, 'Attendance configuration updated successfully', config);
    } catch (error) {
        sendError(res, 500, 'Failed to update attendance configuration', error.message);
    }
};


// @desc    Assign available attendance methods to a gym
// @route   PUT /api/v1/attendance-config/methods
// @access  Private (Super Admin only)
export const assignMethods = async (req, res) => {
    try {
        const { gymId, methods } = req.body;

        if (!gymId) {
            return sendError(res, 400, 'Gym ID is required');
        }

        if (!methods || !Array.isArray(methods) || methods.length === 0) {
            return sendError(res, 400, 'At least one method must be provided');
        }

        // Validate methods
        const validMethods = ['qr', 'manual', 'nfc', 'biometric'];
        const invalidMethods = methods.filter(m => !validMethods.includes(m));
        if (invalidMethods.length > 0) {
            return sendError(res, 400, `Invalid methods: ${invalidMethods.join(', ')}. Valid methods: ${validMethods.join(', ')}`);
        }

        let config = await AttendanceConfig.findOne({ gymId });

        if (!config) {
            // Create new config with first available method as active
            config = await AttendanceConfig.create({
                gymId,
                availableMethods: methods,
                activeMethods: [methods[0]], // Default to first method
                isEnabled: true
            });

            // Link config to gym
            await Gym.findByIdAndUpdate(gymId, { attendanceConfigId: config._id });
        } else {
            // Update existing config
            config.availableMethods = methods;

            // Remove any activeMethods that are no longer available
            config.activeMethods = config.activeMethods.filter(m => methods.includes(m));

            // If no active methods remain, set to first available
            if (config.activeMethods.length === 0) {
                config.activeMethods = [methods[0]];
            }

            await config.save();
        }

        sendSuccess(res, 'Attendance methods assigned successfully', config);
    } catch (error) {
        sendError(res, 500, 'Failed to assign attendance methods', error.message);
    }
};

// @desc    Toggle attendance enable/disable
// @route   PUT /api/v1/attendance-config/toggle
// @access  Private (Owner)
export const toggleAttendance = async (req, res) => {
    try {
        const gymId = req.user.gymId;
        const { isEnabled } = req.body;

        if (typeof isEnabled !== 'boolean') {
            return sendError(res, 400, 'isEnabled must be a boolean');
        }

        let config = await AttendanceConfig.findOne({ gymId });

        if (!config) {
            return sendError(res, 404, 'Attendance configuration not found');
        }

        config.isEnabled = isEnabled;
        await config.save();

        sendSuccess(res, `Attendance ${isEnabled ? 'enabled' : 'disabled'} successfully`, config);
    } catch (error) {
        sendError(res, 500, 'Failed to toggle attendance', error.message);
    }
};

// @desc    Get attendance configuration for super admin (any gym)
// @route   GET /api/v1/attendance-config/:gymId
// @access  Private (Super Admin)
export const getConfigByGymId = async (req, res) => {
    try {
        const { gymId } = req.params;

        let config = await AttendanceConfig.findOne({ gymId });

        if (!config) {
            // Create default config
            config = await AttendanceConfig.create({
                gymId,
                availableMethods: ['manual'],
                activeMethods: ['manual'],
                isEnabled: true
            });

            await Gym.findByIdAndUpdate(gymId, { attendanceConfigId: config._id });
        }

        sendSuccess(res, 'Attendance configuration retrieved successfully', config);
    } catch (error) {
        sendError(res, 500, 'Failed to get attendance configuration', error.message);
    }
};
