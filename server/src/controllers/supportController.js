import SupportTicket from '../models/SupportTicket.js';
import User from '../models/User.js';

// Create a new support ticket
export const createTicket = async (req, res) => {
    try {
        const { subject, description, category, priority, attachments } = req.body;
        const gymId = req.user.gymId;
        const userId = req.user._id;

        const ticket = await SupportTicket.create({
            gymId,
            userId,
            subject,
            description,
            category: category || 'other',
            priority: priority || 'medium',
            attachments: attachments || []
        });

        await ticket.populate('userId', 'firstName lastName email');

        res.status(201).json({
            success: true,
            message: 'Support ticket created successfully',
            data: ticket
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating support ticket',
            error: error.message
        });
    }
};

// Get all tickets (with filters)
export const getTickets = async (req, res) => {
    try {
        const { status, priority, category, assignedTo, userId } = req.query;
        const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.user.gymId;

        const filter = { gymId };

        // If member role, only show their tickets
        if (req.user.role === 'member') {
            filter.userId = req.user._id;
        } else if (userId) {
            // Owners/staff can filter by userId
            filter.userId = userId;
        }

        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (category) filter.category = category;
        if (assignedTo) filter.assignedTo = assignedTo;

        const tickets = await SupportTicket.find(filter)
            .populate('userId', 'firstName lastName email')
            .populate('assignedTo', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching support tickets',
            error: error.message
        });
    }
};

// Get single ticket by ID
export const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        const gymId = req.user.gymId;

        const ticket = await SupportTicket.findById(id)
            .populate('userId', 'firstName lastName email avatar')
            .populate('assignedTo', 'firstName lastName email avatar')
            .populate('replies.userId', 'firstName lastName email avatar role');

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found'
            });
        }

        // Check access
        if (req.user.role === 'member' && ticket.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (req.user.role !== 'super_admin' && ticket.gymId.toString() !== gymId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.status(200).json({
            success: true,
            data: ticket
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching support ticket',
            error: error.message
        });
    }
};

// Update ticket (status, assignee, etc.)
export const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, priority, assignedTo } = req.body;
        const gymId = req.user.gymId;

        const ticket = await SupportTicket.findById(id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found'
            });
        }

        // Check access
        if (req.user.role !== 'super_admin' && ticket.gymId.toString() !== gymId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Members can't update tickets (except through replies)
        if (req.user.role === 'member') {
            return res.status(403).json({
                success: false,
                message: 'Members cannot update ticket status'
            });
        }

        if (status) ticket.status = status;
        if (priority) ticket.priority = priority;
        if (assignedTo !== undefined) ticket.assignedTo = assignedTo;

        await ticket.save();
        await ticket.populate('userId', 'firstName lastName email');
        await ticket.populate('assignedTo', 'firstName lastName email');

        res.status(200).json({
            success: true,
            message: 'Ticket updated successfully',
            data: ticket
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating support ticket',
            error: error.message
        });
    }
};

// Add reply to ticket
export const addReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const gymId = req.user.gymId;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Reply message is required'
            });
        }

        const ticket = await SupportTicket.findById(id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found'
            });
        }

        // Check access
        if (req.user.role === 'member' && ticket.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (req.user.role !== 'super_admin' && ticket.gymId.toString() !== gymId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const isStaff = ['owner', 'staff', 'super_admin'].includes(req.user.role);

        ticket.replies.push({
            userId: req.user._id,
            message: message.trim(),
            isStaff
        });

        // If member replies to resolved/closed ticket, reopen it
        if (!isStaff && ['resolved', 'closed'].includes(ticket.status)) {
            ticket.status = 'open';
        }

        await ticket.save();
        await ticket.populate('replies.userId', 'firstName lastName email avatar role');

        res.status(200).json({
            success: true,
            message: 'Reply added successfully',
            data: ticket
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding reply to ticket',
            error: error.message
        });
    }
};

// Assign ticket to staff
export const assignTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedTo } = req.body;
        const gymId = req.user.gymId;

        const ticket = await SupportTicket.findById(id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found'
            });
        }

        // Check access - only owner/super_admin can assign
        if (!['owner', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Only owners can assign tickets'
            });
        }

        if (req.user.role !== 'super_admin' && ticket.gymId.toString() !== gymId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Verify assignee is staff/owner in same gym
        if (assignedTo) {
            const assignee = await User.findById(assignedTo);
            if (!assignee || !['owner', 'staff'].includes(assignee.role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Can only assign to staff or owner'
                });
            }
            if (assignee.gymId.toString() !== ticket.gymId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot assign to staff from different gym'
                });
            }
        }

        ticket.assignedTo = assignedTo || null;
        if (assignedTo && ticket.status === 'open') {
            ticket.status = 'in_progress';
        }

        await ticket.save();
        await ticket.populate('assignedTo', 'firstName lastName email');

        res.status(200).json({
            success: true,
            message: 'Ticket assigned successfully',
            data: ticket
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error assigning ticket',
            error: error.message
        });
    }
};

// Get ticket statistics
export const getTicketStats = async (req, res) => {
    try {
        const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.user.gymId;

        const stats = await SupportTicket.aggregate([
            { $match: { gymId: mongoose.Types.ObjectId(gymId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStats = {
            open: 0,
            in_progress: 0,
            resolved: 0,
            closed: 0,
            total: 0
        };

        stats.forEach(stat => {
            formattedStats[stat._id] = stat.count;
            formattedStats.total += stat.count;
        });

        res.status(200).json({
            success: true,
            data: formattedStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching ticket statistics',
            error: error.message
        });
    }
};
