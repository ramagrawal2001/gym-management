import PlatformLead from '../models/PlatformLead.js';
import Gym from '../models/Gym.js';

// @desc    Create a new platform lead
// @route   POST /api/super-admin/leads
// @access  Private (Super Admin only)
export const createLead = async (req, res, next) => {
    try {
        const lead = await PlatformLead.create(req.body);

        // Initial note if provided in body? If not, do nothing.
        if (req.body.initialNote) {
            lead.notes.push({
                text: req.body.initialNote,
                addedBy: req.user._id
            });
            await lead.save();
        }

        res.status(201).json({
            success: true,
            data: lead
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all platform leads
// @route   GET /api/super-admin/leads
// @access  Private (Super Admin only)
export const getLeads = async (req, res, next) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Parse back
        const parsedQuery = JSON.parse(queryStr);

        // Add search functionality
        if (req.query.search) {
            parsedQuery.$or = [
                { businessName: { $regex: req.query.search, $options: 'i' } },
                { contactName: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Finding resource
        query = PlatformLead.find(parsedQuery).populate('notes.addedBy', 'firstName lastName email');

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 100;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await PlatformLead.countDocuments(parsedQuery);

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const leads = await query;

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: leads.length,
            pagination,
            data: leads
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single platform lead
// @route   GET /api/super-admin/leads/:id
// @access  Private (Super Admin only)
export const getLead = async (req, res, next) => {
    try {
        const lead = await PlatformLead.findById(req.params.id)
            .populate('convertedToGym', 'name email phone')
            .populate('notes.addedBy', 'firstName lastName email');

        if (!lead) {
            return res.status(404).json({ success: false, message: `Lead not found with id of ${req.params.id}` });
        }

        res.status(200).json({
            success: true,
            data: lead
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a platform lead
// @route   PUT /api/super-admin/leads/:id
// @access  Private (Super Admin only)
export const updateLead = async (req, res, next) => {
    try {
        let lead = await PlatformLead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({ success: false, message: `Lead not found with id of ${req.params.id}` });
        }

        // Prevent direct status update here if we want to add notes automatically, 
        // but for flexibility we allow standard updates. Note that addNote is better for status changes.

        lead = await PlatformLead.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('notes.addedBy', 'firstName lastName email');

        res.status(200).json({
            success: true,
            data: lead
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a platform lead
// @route   DELETE /api/super-admin/leads/:id
// @access  Private (Super Admin only)
export const deleteLead = async (req, res, next) => {
    try {
        const lead = await PlatformLead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({ success: false, message: `Lead not found with id of ${req.params.id}` });
        }

        await lead.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add a note to a platform lead (and optionally update status)
// @route   POST /api/super-admin/leads/:id/notes
// @access  Private (Super Admin only)
export const addLeadNote = async (req, res, next) => {
    try {
        const lead = await PlatformLead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({ success: false, message: `Lead not found with id of ${req.params.id}` });
        }

        const { text, status } = req.body;

        if (!text && !status) {
            return res.status(400).json({ success: false, message: 'Please provide a note or a status change' });
        }

        let noteText = text;

        // If status is changed, reflect it in the note too
        if (status && lead.status !== status) {
            noteText = noteText ? `Status changed to ${status}: ${noteText}` : `Status changed to ${status}`;
            lead.status = status;

            // Handle conversion logic loosely
            if (status === 'Converted' && !lead.convertedAt) {
                lead.convertedAt = Date.now();
            }
        }

        if (noteText) {
            lead.notes.push({
                text: noteText,
                addedBy: req.user._id
            });
        }

        await lead.save();

        // Re-fetch to populate user
        const updatedLead = await PlatformLead.findById(req.params.id).populate('notes.addedBy', 'firstName lastName email');

        res.status(200).json({
            success: true,
            data: updatedLead
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get super admin lead stats
// @route   GET /api/super-admin/leads/stats/overview
// @access  Private (Super Admin only)
export const getLeadStats = async (req, res, next) => {
    try {
        const totalLeads = await PlatformLead.countDocuments();
        const newLeads = await PlatformLead.countDocuments({ status: 'New' });
        const convertedLeads = await PlatformLead.countDocuments({ status: 'Converted' });

        // Calculate conversion rate
        const conversionRate = totalLeads === 0 ? 0 : ((convertedLeads / totalLeads) * 100).toFixed(2);

        // Group by status
        const leadsByStatus = await PlatformLead.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format for easier frontend parsing
        const statusCounts = {};
        leadsByStatus.forEach(item => {
            statusCounts[item._id] = item.count;
        });

        res.status(200).json({
            success: true,
            data: {
                totalLeads,
                newLeads,
                convertedLeads,
                conversionRate,
                leadsByStatus: statusCounts
            }
        });
    } catch (error) {
        next(error);
    }
};
