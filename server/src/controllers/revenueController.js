import Revenue from '../models/Revenue.js';

// Get all revenues with filters
export const getRevenues = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            startDate,
            endDate,
            source,
            search
        } = req.query;

        const query = {
            gymId: req.gymId,
            isDeleted: false
        };

        // Date range filter
        if (startDate || endDate) {
            query.revenueDate = {};
            if (startDate) query.revenueDate.$gte = new Date(startDate);
            if (endDate) query.revenueDate.$lte = new Date(endDate);
        }

        // Source filter
        if (source) {
            query.source = source;
        }

        // Search filter
        if (search) {
            query.$or = [
                { description: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const revenues = await Revenue.find(query)
            .populate('paymentId')
            .populate('memberId', 'name email')
            .populate('createdBy', 'name email')
            .sort({ revenueDate: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Revenue.countDocuments(query);

        res.json({
            success: true,
            data: revenues,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching revenues:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch revenues',
            error: error.message
        });
    }
};

// Get single revenue
export const getRevenue = async (req, res) => {
    try {
        const revenue = await Revenue.findOne({
            _id: req.params.id,
            gymId: req.gymId,
            isDeleted: false
        })
            .populate('paymentId')
            .populate('memberId', 'name email')
            .populate('createdBy', 'name email');

        if (!revenue) {
            return res.status(404).json({
                success: false,
                message: 'Revenue not found'
            });
        }

        res.json({
            success: true,
            data: revenue
        });
    } catch (error) {
        console.error('Error fetching revenue:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch revenue',
            error: error.message
        });
    }
};

// Create revenue
export const createRevenue = async (req, res) => {
    try {
        const {
            amount,
            source,
            description,
            revenueDate,
            notes,
            paymentId,
            memberId
        } = req.body;

        const revenue = await Revenue.create({
            amount,
            source,
            description,
            revenueDate: revenueDate || Date.now(),
            notes,
            paymentId,
            memberId,
            gymId: req.gymId,
            createdBy: req.user._id
        });

        const populatedRevenue = await Revenue.findById(revenue._id)
            .populate('paymentId')
            .populate('memberId', 'name email')
            .populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Revenue created successfully',
            data: populatedRevenue
        });
    } catch (error) {
        console.error('Error creating revenue:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create revenue',
            error: error.message
        });
    }
};

// Update revenue
export const updateRevenue = async (req, res) => {
    try {
        const {
            amount,
            source,
            description,
            revenueDate,
            notes,
            paymentId,
            memberId
        } = req.body;

        const revenue = await Revenue.findOneAndUpdate(
            { _id: req.params.id, gymId: req.gymId, isDeleted: false },
            {
                amount,
                source,
                description,
                revenueDate,
                notes,
                paymentId,
                memberId
            },
            { new: true, runValidators: true }
        )
            .populate('paymentId')
            .populate('memberId', 'name email')
            .populate('createdBy', 'name email');

        if (!revenue) {
            return res.status(404).json({
                success: false,
                message: 'Revenue not found'
            });
        }

        res.json({
            success: true,
            message: 'Revenue updated successfully',
            data: revenue
        });
    } catch (error) {
        console.error('Error updating revenue:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update revenue',
            error: error.message
        });
    }
};

// Delete revenue (soft delete)
export const deleteRevenue = async (req, res) => {
    try {
        const revenue = await Revenue.findOneAndUpdate(
            { _id: req.params.id, gymId: req.gymId, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );

        if (!revenue) {
            return res.status(404).json({
                success: false,
                message: 'Revenue not found'
            });
        }

        res.json({
            success: true,
            message: 'Revenue deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting revenue:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete revenue',
            error: error.message
        });
    }
};

// Get revenue statistics
export const getRevenueStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const query = {
            gymId: req.gymId,
            isDeleted: false
        };

        if (startDate || endDate) {
            query.revenueDate = {};
            if (startDate) query.revenueDate.$gte = new Date(startDate);
            if (endDate) query.revenueDate.$lte = new Date(endDate);
        }

        // Total revenue
        const totalRevenue = await Revenue.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        // Revenue by source
        const revenueBySource = await Revenue.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$source',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                total: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
                count: totalRevenue.length > 0 ? totalRevenue[0].count : 0,
                bySource: revenueBySource
            }
        });
    } catch (error) {
        console.error('Error fetching revenue stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch revenue statistics',
            error: error.message
        });
    }
};
