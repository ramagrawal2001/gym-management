// Middleware to check member access control
import MemberAccessConfig from '../models/MemberAccessConfig.js';

// Check if member has login access
export const checkMemberLoginAccess = async (req, res, next) => {
    try {
        // Only apply to members
        if (req.user?.role !== 'member') {
            return next();
        }

        // Check canLogin flag
        if (req.user.canLogin === false) {
            return res.status(403).json({
                success: false,
                message: 'Your login access has been disabled. Please contact your gym administrator.'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking member access',
            error: error.message
        });
    }
};

// Check if member has access to specific feature
export const checkFeatureAccess = (feature) => {
    return async (req, res, next) => {
        try {
            // Only apply to members
            if (req.user?.role !== 'member') {
                return next();
            }

            const userId = req.user._id;
            const gymId = req.user.gymId;

            // Get gym's config
            const config = await MemberAccessConfig.findOne({ gymId });

            if (!config) {
                // If no config exists, allow access (default behavior)
                return next();
            }

            // Check individual access restrictions first (overrides)
            if (req.user.accessRestrictions && req.user.accessRestrictions[feature] !== null) {
                if (req.user.accessRestrictions[feature] === false) {
                    return res.status(403).json({
                        success: false,
                        message: `You don't have access to ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()}`
                    });
                }
                return next();
            }

            // Check permission level settings
            const permissionLevel = req.user.memberPermissionLevel || 'premium';
            const levelSettings = config.permissionLevels[permissionLevel];

            if (levelSettings && levelSettings[feature] === false) {
                return res.status(403).json({
                    success: false,
                    message: `Your membership level does not include access to ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()}`
                });
            }

            // Check default feature access
            if (config.defaultFeatureAccess[feature] === false) {
                return res.status(403).json({
                    success: false,
                    message: `This feature is currently disabled`
                });
            }

            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error checking feature access',
                error: error.message
            });
        }
    };
};

// Get effective permissions for a member
export const getMemberEffectivePermissions = async (userId, gymId) => {
    try {
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(userId);

        if (!user || user.role !== 'member') {
            return null;
        }

        const config = await MemberAccessConfig.findOne({ gymId });

        if (!config) {
            // Return default permissions
            return {
                viewProfile: true,
                editProfile: true,
                viewAttendance: true,
                viewClasses: true,
                bookClasses: true,
                viewPayments: true,
                viewInvoices: true,
                viewWorkoutPlan: true,
                viewDietPlan: true
            };
        }

        const permissionLevel = user.memberPermissionLevel || 'premium';
        const levelSettings = config.permissionLevels[permissionLevel] || {};
        const defaults = config.defaultFeatureAccess;
        const overrides = user.accessRestrictions || {};

        // Merge permissions: overrides > level settings > defaults
        const permissions = {};
        const features = ['viewProfile', 'editProfile', 'viewAttendance', 'viewClasses', 'bookClasses',
            'viewPayments', 'viewInvoices', 'viewWorkoutPlan', 'viewDietPlan'];

        features.forEach(feature => {
            if (overrides[feature] !== null && overrides[feature] !== undefined) {
                permissions[feature] = overrides[feature];
            } else if (levelSettings[feature] !== undefined) {
                permissions[feature] = levelSettings[feature];
            } else {
                permissions[feature] = defaults[feature] !== undefined ? defaults[feature] : true;
            }
        });

        return permissions;
    } catch (error) {
        console.error('Error getting member permissions:', error);
        return null;
    }
};
