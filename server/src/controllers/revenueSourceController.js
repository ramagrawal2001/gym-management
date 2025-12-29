import RevenueSource from '../models/RevenueSource.js';
import Revenue from '../models/Revenue.js';

// Get all revenue sources for a gym
export const getRevenueSources = async (req, res) => {
    try {
        const { includeInactive = false } = req.query;

        const query = {
            gymId: req.gymId,
            isDeleted: false
        };

        if (!includeInactive) {
            query.isActive = true;
        }

        const sources = await RevenueSource.find(query)
            .populate('createdBy', 'name email')
            .sort({ isSystemSource: -1, name: 1 }); // System sources first

        // Add usage count for each source
        const sourcesWithStats = await Promise.all(sources.map(async (source) => {
            const usageCount = await Revenue.countDocuments({
                sourceId: source._id,
                isDeleted: false
            });

            return {
                ...source.toObject(),
                usageCount
            };
        }));

        res.json({
            success: true,
            data: sourcesWithStats
        });
    } catch (error) {
        console.error('Error fetching revenue sources:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch revenue sources',
            error: error.message
        });
    }
};

// Get single revenue source
export const getRevenueSource = async (req, res) => {
    try {
        const source = await RevenueSource.findOne({
            _id: req.params.id,
            gymId: req.gymId,
            isDeleted: false
        }).populate('createdBy', 'name email');

        if (!source) {
            return res.status(404).json({
                success: false,
                message: 'Revenue source not found'
            });
        }

        // Get usage count
        const usageCount = await Revenue.countDocuments({
            sourceId: source._id,
            isDeleted: false
        });

        res.json({
            success: true,
            data: {
                ...source.toObject(),
                usageCount
            }
        });
    } catch (error) {
        console.error('Error fetching revenue source:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch revenue source',
            error: error.message
        });
    }
};

// Create custom revenue source
export const createRevenueSource = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            defaultAmount,
            gstApplicable,
            icon,
            color
        } = req.body;

        // Validate: Custom sources cannot be auto-generated
        // (Only system sources can auto-generate)
        const source = await RevenueSource.create({
            name,
            description,
            category: category || 'one-time',
            autoGenerate: false, // Custom sources are always manual
            linkedModule: null,
            defaultAmount,
            gstApplicable: gstApplicable || false,
            isSystemSource: false, // Custom source
            isActive: true,
            icon: icon || '💰',
            color: color || '#10b981',
            gymId: req.gymId,
            createdBy: req.user._id
        });

        const populatedSource = await RevenueSource.findById(source._id)
            .populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Revenue source created successfully',
            data: populatedSource
        });
    } catch (error) {
        console.error('Error creating revenue source:', error);

        // Handle duplicate name error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A revenue source with this name already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create revenue source',
            error: error.message
        });
    }
};

// Update revenue source
export const updateRevenueSource = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            defaultAmount,
            gstApplicable,
            icon,
            color
        } = req.body;

        const source = await RevenueSource.findOne({
            _id: req.params.id,
            gymId: req.gymId,
            isDeleted: false
        });

        if (!source) {
            return res.status(404).json({
                success: false,
                message: 'Revenue source not found'
            });
        }

        // Prevent modifying critical fields of system sources
        if (source.isSystemSource) {
            // Only allow updating: description, defaultAmount, icon, color, gstApplicable
            source.description = description !== undefined ? description : source.description;
            source.defaultAmount = defaultAmount !== undefined ? defaultAmount : source.defaultAmount;
            source.icon = icon !== undefined ? icon : source.icon;
            source.color = color !== undefined ? color : source.color;
            source.gstApplicable = gstApplicable !== undefined ? gstApplicable : source.gstApplicable;
        } else {
            // Custom sources: allow all fields
            source.name = name !== undefined ? name : source.name;
            source.description = description !== undefined ? description : source.description;
            source.category = category !== undefined ? category : source.category;
            source.defaultAmount = defaultAmount !== undefined ? defaultAmount : source.defaultAmount;
            source.gstApplicable = gstApplicable !== undefined ? gstApplicable : source.gstApplicable;
            source.icon = icon !== undefined ? icon : source.icon;
            source.color = color !== undefined ? color : source.color;
        }

        await source.save();

        const populatedSource = await RevenueSource.findById(source._id)
            .populate('createdBy', 'name email');

        res.json({
            success: true,
            message: 'Revenue source updated successfully',
            data: populatedSource
        });
    } catch (error) {
        console.error('Error updating revenue source:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update revenue source',
            error: error.message
        });
    }
};

// Toggle revenue source (enable/disable)
export const toggleRevenueSource = async (req, res) => {
    try {
        const source = await RevenueSource.findOne({
            _id: req.params.id,
            gymId: req.gymId,
            isDeleted: false
        });

        if (!source) {
            return res.status(404).json({
                success: false,
                message: 'Revenue source not found'
            });
        }

        source.isActive = !source.isActive;
        await source.save();

        res.json({
            success: true,
            message: `Revenue source ${source.isActive ? 'enabled' : 'disabled'} successfully`,
            data: source
        });
    } catch (error) {
        console.error('Error toggling revenue source:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle revenue source',
            error: error.message
        });
    }
};

// Delete revenue source (soft delete)
export const deleteRevenueSource = async (req, res) => {
    try {
        const source = await RevenueSource.findOne({
            _id: req.params.id,
            gymId: req.gymId,
            isDeleted: false
        });

        if (!source) {
            return res.status(404).json({
                success: false,
                message: 'Revenue source not found'
            });
        }

        // System sources cannot be deleted (enforced by model pre-hook)
        if (source.isSystemSource) {
            return res.status(400).json({
                success: false,
                message: 'System revenue sources cannot be deleted. You can disable them instead.'
            });
        }

        // Check if source is in use
        const usageCount = await Revenue.countDocuments({
            sourceId: source._id,
            isDeleted: false
        });

        if (usageCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete revenue source. It is used in ${usageCount} revenue entries.`,
                usageCount
            });
        }

        // Soft delete
        source.isDeleted = true;
        await source.save();

        res.json({
            success: true,
            message: 'Revenue source deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting revenue source:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete revenue source',
            error: error.message
        });
    }
};

// Get revenue source statistics
export const getRevenueSourceStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Total sources
        const totalSources = await RevenueSource.countDocuments({
            gymId: req.gymId,
            isDeleted: false
        });

        const activeSources = await RevenueSource.countDocuments({
            gymId: req.gymId,
            isActive: true,
            isDeleted: false
        });

        const autoSources = await RevenueSource.countDocuments({
            gymId: req.gymId,
            autoGenerate: true,
            isDeleted: false
        });

        // Revenue by source (with date filter if provided)
        const matchQuery = {
            gymId: req.gymId,
            isDeleted: false,
            isReversed: false
        };

        if (startDate || endDate) {
            matchQuery.revenueDate = {};
            if (startDate) matchQuery.revenueDate.$gte = new Date(startDate);
            if (endDate) matchQuery.revenueDate.$lte = new Date(endDate);
        }

        const revenueBySource = await Revenue.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$sourceId',
                    totalRevenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'revenuesources',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'source'
                }
            },
            { $unwind: '$source' },
            {
                $project: {
                    sourceId: '$_id',
                    sourceName: '$source.name',
                    category: '$source.category',
                    icon: '$source.icon',
                    color: '$source.color',
                    totalRevenue: 1,
                    count: 1
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                totalSources,
                activeSources,
                autoSources,
                revenueBySource
            }
        });
    } catch (error) {
        console.error('Error fetching revenue source stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch revenue source statistics',
            error: error.message
        });
    }
};
