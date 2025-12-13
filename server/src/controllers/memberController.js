import Member from '../models/Member.js';
import User from '../models/User.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';

// @desc    Get all members
// @route   GET /api/v1/members
// @access  Private
export const getMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (page - 1) * limit;
    const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.user.gymId;

    const query = { gymId };
    
    if (status) {
      query.status = status;
    }

    if (search) {
      const members = await Member.find(query)
        .populate('userId', 'email firstName lastName phone avatar')
        .populate('planId', 'name price duration');
      
      const filtered = members.filter(m => {
        const user = m.userId;
        const searchLower = search.toLowerCase();
        return (
          user?.email?.toLowerCase().includes(searchLower) ||
          user?.firstName?.toLowerCase().includes(searchLower) ||
          user?.lastName?.toLowerCase().includes(searchLower) ||
          m.memberId?.toLowerCase().includes(searchLower)
        );
      });

      const paginated = filtered.slice(skip, skip + parseInt(limit));

      return sendSuccess(res, 'Members retrieved successfully', paginated, {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filtered.length,
          pages: Math.ceil(filtered.length / limit)
        }
      });
    }

    const members = await Member.find(query)
      .populate('userId', 'email firstName lastName phone avatar')
      .populate('planId', 'name price duration')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Member.countDocuments(query);

    sendSuccess(res, 'Members retrieved successfully', members, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get members', error.message);
  }
};

// @desc    Get single member
// @route   GET /api/v1/members/:id
// @access  Private
export const getMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('userId', 'email firstName lastName phone avatar')
      .populate('planId', 'name price duration features')
      .populate('gymId', 'name');

    if (!member) {
      return sendError(res, 404, 'Member not found');
    }

    sendSuccess(res, 'Member retrieved successfully', member);
  } catch (error) {
    sendError(res, 500, 'Failed to get member', error.message);
  }
};

// @desc    Create member
// @route   POST /api/v1/members
// @access  Private (Staff or above)
export const createMember = async (req, res) => {
  try {
    const { userId, planId, subscriptionStart, subscriptionEnd, ...otherData } = req.body;
    const gymId = req.user.gymId;

    const member = await Member.create({
      userId,
      gymId,
      planId,
      subscriptionStart: subscriptionStart || new Date(),
      subscriptionEnd: subscriptionEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      ...otherData
    });

    const populated = await Member.findById(member._id)
      .populate('userId', 'email firstName lastName phone avatar')
      .populate('planId', 'name price duration');

    sendCreated(res, 'Member created successfully', populated);
  } catch (error) {
    sendError(res, 500, 'Failed to create member', error.message);
  }
};

// @desc    Update member
// @route   PUT /api/v1/members/:id
// @access  Private (Staff or above)
export const updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('userId', 'email firstName lastName phone avatar')
      .populate('planId', 'name price duration');

    if (!member) {
      return sendError(res, 404, 'Member not found');
    }

    sendSuccess(res, 'Member updated successfully', member);
  } catch (error) {
    sendError(res, 500, 'Failed to update member', error.message);
  }
};

// @desc    Renew member subscription
// @route   PUT /api/v1/members/:id/renew
// @access  Private (Staff or above)
export const renewMember = async (req, res) => {
  try {
    const { planId, duration } = req.body; // duration in days
    const member = await Member.findById(req.params.id);

    if (!member) {
      return sendError(res, 404, 'Member not found');
    }

    const now = new Date();
    const startDate = member.subscriptionEnd > now ? member.subscriptionEnd : now;
    const endDate = new Date(startDate.getTime() + (duration || 30) * 24 * 60 * 60 * 1000);

    member.planId = planId || member.planId;
    member.subscriptionStart = startDate;
    member.subscriptionEnd = endDate;
    member.status = 'active';
    await member.save();

    const populated = await Member.findById(member._id)
      .populate('userId', 'email firstName lastName phone avatar')
      .populate('planId', 'name price duration');

    sendSuccess(res, 'Member subscription renewed successfully', populated);
  } catch (error) {
    sendError(res, 500, 'Failed to renew member', error.message);
  }
};

// @desc    Delete member
// @route   DELETE /api/v1/members/:id
// @access  Private (Owner or Super Admin)
export const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return sendError(res, 404, 'Member not found');
    }

    await member.deleteOne();

    sendSuccess(res, 'Member deleted successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to delete member', error.message);
  }
};

