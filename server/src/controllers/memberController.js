import Member from '../models/Member.js';
import User from '../models/User.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';

// @desc    Get member's own profile
// @route   GET /api/v1/members/me
// @access  Private (Member)
export const getMyProfile = async (req, res) => {
  try {
    // Find member record by userId
    const member = await Member.findOne({ userId: req.user._id })
      .populate('userId', 'email firstName lastName phone avatar')
      .populate('planId', 'name price duration features')
      .populate('gymId', 'name');

    if (!member) {
      return sendError(res, 404, 'Member profile not found');
    }

    sendSuccess(res, 'Member profile retrieved successfully', member);
  } catch (error) {
    sendError(res, 500, 'Failed to get member profile', error.message);
  }
};

// @desc    Get all members
// @route   GET /api/v1/members
// @access  Private
export const getMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (page - 1) * limit;
    
    // Members can only see their own data
    if (req.user.role === 'member') {
      const member = await Member.findOne({ userId: req.user._id })
        .populate('userId', 'email firstName lastName phone avatar')
        .populate('planId', 'name price duration');
      
      if (!member) {
        return sendError(res, 404, 'Member profile not found');
      }
      
      return sendSuccess(res, 'Member retrieved successfully', [member], {
        pagination: {
          page: 1,
          limit: 1,
          total: 1,
          pages: 1
        }
      });
    }
    
    // Build query - super admin can see all or filter by gymId
    const query = {};
    if (req.user.role === 'super_admin') {
      if (req.query.gymId) {
        query.gymId = req.query.gymId;
      }
      // If no gymId provided, query will be empty and return all members
    } else {
      query.gymId = req.user.gymId;
    }
    
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
      .populate('gymId', 'name')
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

    // Members can only access their own data
    if (req.user.role === 'member') {
      if (member.userId._id.toString() !== req.user._id.toString()) {
        return sendError(res, 403, 'Access denied: Cannot access other members\' data');
      }
    }

    // Staff/Owner can only access members from their gym
    if (req.user.role !== 'super_admin' && req.user.role !== 'member') {
      if (member.gymId._id.toString() !== req.user.gymId.toString()) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
    }

    sendSuccess(res, 'Member retrieved successfully', member);
  } catch (error) {
    sendError(res, 500, 'Failed to get member', error.message);
  }
};

// @desc    Create member
// @route   POST /api/v1/members
// @access  Private (Staff or above, not members)
export const createMember = async (req, res) => {
  try {
    // Members cannot create other members
    if (req.user.role === 'member') {
      return sendError(res, 403, 'Access denied: Members cannot create member records');
    }

    const { email, firstName, lastName, phone, planId, subscriptionStart, subscriptionEnd, ...otherData } = req.body;
    const gymId = req.gymId || req.user.gymId;

    if (!email || !firstName || !lastName) {
      return sendError(res, 400, 'Email, firstName, and lastName are required.');
    }
    
    // Check if user with this email already exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists, check if they are already a member of THIS gym
      const existingMemberInGym = await Member.findOne({ userId: user._id, gymId });
      if (existingMemberInGym) {
        return sendError(res, 409, 'This user is already a member of your gym.');
      }
    } else {
      // If user doesn't exist, create a new user record for them
       const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
      user = await User.create({
        email,
        firstName,
        lastName,
        phone,
        password: randomPassword, // OTP login is used, so this is a placeholder
        role: 'member',
        gymId, // Associate user with the gym
      });
    }

    // Now, create the member record
    const member = await Member.create({
      userId: user._id,
      gymId,
      planId,
      subscriptionStart: subscriptionStart || new Date(),
      subscriptionEnd: subscriptionEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      status: 'active',
      ...otherData
    });

    const populated = await member.populate([
      { path: 'userId', select: 'email firstName lastName phone avatar' },
      { path: 'planId', select: 'name price duration' }
    ]);

    sendCreated(res, 'Member created successfully', populated);
  } catch (error) {
    // Catch duplicate email error from User model
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return sendError(res, 409, 'A user with this email already exists but could not be added.');
    }
    // Catch validation errors
    if (error.name === 'ValidationError') {
      return sendError(res, 400, 'Validation failed', Object.values(error.errors).map(e => e.message).join(', '));
    }
    sendError(res, 500, 'Failed to create member', error.message);
  }
};

// @desc    Update member
// @route   PUT /api/v1/members/:id
// @access  Private (Staff or above, or member updating own profile)
export const updateMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('userId', 'email firstName lastName phone avatar');

    if (!member) {
      return sendError(res, 404, 'Member not found');
    }

    // Members can only update their own profile (limited fields)
    if (req.user.role === 'member') {
      if (member.userId._id.toString() !== req.user._id.toString()) {
        return sendError(res, 403, 'Access denied: Cannot update other members\' data');
      }
      // Members can only update certain fields (via user profile)
      // Remove restricted fields
      delete req.body.planId;
      delete req.body.subscriptionStart;
      delete req.body.subscriptionEnd;
      delete req.body.status;
      delete req.body.gymId;
    } else {
      // Staff/Owner can only update members from their gym
      if (req.user.role !== 'super_admin') {
        if (member.gymId.toString() !== req.user.gymId.toString()) {
          return sendError(res, 403, 'Access denied: Invalid gym scope');
        }
      }
    }

    const updated = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('userId', 'email firstName lastName phone avatar')
      .populate('planId', 'name price duration');

    sendSuccess(res, 'Member updated successfully', updated);
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

    // Verify gym scope for non-super-admin
    if (req.user.role !== 'super_admin') {
      if (member.gymId.toString() !== req.user.gymId.toString()) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
    }

    await member.deleteOne();

    sendSuccess(res, 'Member deleted successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to delete member', error.message);
  }
};

