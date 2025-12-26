import MemberAccessConfig from '../models/MemberAccessConfig.js';
import User from '../models/User.js';

// Get gym's default member access settings
export const getGymSettings = async (req, res) => {
    try {
        const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.user.gymId;

        if (!gymId) {
            return res.status(400).json({
                success: false,
                message: 'Gym ID is required'
            });
        }

        let config = await MemberAccessConfig.findOne({ gymId });

        // Create default config if doesn't exist
        if (!config) {
            config = await MemberAccessConfig.createDefaultConfig(gymId);
        }

        res.status(200).json({
            success: true,
            data: config
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching member access settings',
            error: error.message
        });
    }
};

// Update gym's default member access settings
export const updateGymSettings = async (req, res) => {
    try {
        const gymId = req.user.role === 'super_admin' ? req.body.gymId || req.query.gymId : req.user.gymId;

        if (!gymId) {
            return res.status(400).json({
                success: false,
                message: 'Gym ID is required'
            });
        }

        const { defaultFeatureAccess, permissionLevels } = req.body;

        let config = await MemberAccessConfig.findOne({ gymId });

        if (!config) {
            config = await MemberAccessConfig.createDefaultConfig(gymId);
        }

        if (defaultFeatureAccess) {
            config.defaultFeatureAccess = { ...config.defaultFeatureAccess, ...defaultFeatureAccess };
        }

        if (permissionLevels) {
            config.permissionLevels = { ...config.permissionLevels, ...permissionLevels };
        }

        await config.save();

        res.status(200).json({
            success: true,
            message: 'Member access settings updated successfully',
            data: config
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating member access settings',
            error: error.message
        });
    }
};

// Get individual member access settings
export const getMemberAccess = async (req, res) => {
    try {
        const { memberId } = req.params;
        const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.user.gymId;

        const user = await User.findById(memberId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Check if user belongs to the gym
        if (req.user.role !== 'super_admin' && user.gymId.toString() !== gymId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Get gym's default config
        const config = await MemberAccessConfig.findOne({ gymId: user.gymId });

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    canLogin: user.canLogin,
                    memberPermissionLevel: user.memberPermissionLevel,
                    accessRestrictions: user.accessRestrictions
                },
                gymDefaults: config?.defaultFeatureAccess || {},
                permissionLevels: config?.permissionLevels || {}
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching member access',
            error: error.message
        });
    }
};

// Update individual member access settings
export const updateMemberAccess = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { canLogin, memberPermissionLevel, accessRestrictions } = req.body;
        const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.user.gymId;

        const user = await User.findById(memberId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Check if user belongs to the gym
        if (req.user.role !== 'super_admin' && user.gymId.toString() !== gymId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Update fields
        if (typeof canLogin !== 'undefined') {
            user.canLogin = canLogin;
        }

        if (memberPermissionLevel) {
            user.memberPermissionLevel = memberPermissionLevel;
        }

        if (accessRestrictions) {
            user.accessRestrictions = { ...user.accessRestrictions, ...accessRestrictions };
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Member access updated successfully',
            data: {
                id: user._id,
                email: user.email,
                canLogin: user.canLogin,
                memberPermissionLevel: user.memberPermissionLevel,
                accessRestrictions: user.accessRestrictions
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating member access',
            error: error.message
        });
    }
};

// Bulk update member access
export const bulkUpdateMemberAccess = async (req, res) => {
    try {
        const { memberIds, updates } = req.body;
        const gymId = req.user.role === 'super_admin' ? req.body.gymId || req.query.gymId : req.user.gymId;

        if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Member IDs array is required'
            });
        }

        if (!updates) {
            return res.status(400).json({
                success: false,
                message: 'Updates object is required'
            });
        }

        // Build update object
        const updateObj = {};
        if (typeof updates.canLogin !== 'undefined') {
            updateObj.canLogin = updates.canLogin;
        }
        if (updates.memberPermissionLevel) {
            updateObj.memberPermissionLevel = updates.memberPermissionLevel;
        }
        if (updates.accessRestrictions) {
            updateObj.accessRestrictions = updates.accessRestrictions;
        }

        // Update members
        const result = await User.updateMany(
            {
                _id: { $in: memberIds },
                gymId: gymId,
                role: 'member'
            },
            { $set: updateObj }
        );

        res.status(200).json({
            success: true,
            message: `Updated ${result.modifiedCount} members successfully`,
            data: {
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error bulk updating member access',
            error: error.message
        });
    }
};
