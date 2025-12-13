import Staff from '../models/Staff.js';
import User from '../models/User.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';

// @desc    Get all staff
// @route   GET /api/v1/staff
// @access  Private
export const getStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const skip = (page - 1) * limit;
    const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.user.gymId;

    const query = { gymId };
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const staff = await Staff.find(query)
      .populate('userId', 'email firstName lastName phone avatar')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Staff.countDocuments(query);

    // Filter by search if provided
    let filteredStaff = staff;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredStaff = staff.filter(s => {
        const user = s.userId;
        return (
          user?.email?.toLowerCase().includes(searchLower) ||
          user?.firstName?.toLowerCase().includes(searchLower) ||
          user?.lastName?.toLowerCase().includes(searchLower) ||
          s.specialty?.toLowerCase().includes(searchLower)
        );
      });
    }

    sendSuccess(res, 'Staff retrieved successfully', filteredStaff, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: search ? filteredStaff.length : total,
        pages: Math.ceil((search ? filteredStaff.length : total) / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get staff', error.message);
  }
};

// @desc    Get single staff
// @route   GET /api/v1/staff/:id
// @access  Private
export const getStaffMember = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('userId', 'email firstName lastName phone avatar')
      .populate('gymId', 'name');

    if (!staff) {
      return sendError(res, 404, 'Staff member not found');
    }

    sendSuccess(res, 'Staff member retrieved successfully', staff);
  } catch (error) {
    sendError(res, 500, 'Failed to get staff member', error.message);
  }
};

// @desc    Create staff
// @route   POST /api/v1/staff
// @access  Private (Owner or Super Admin)
export const createStaff = async (req, res) => {
  try {
    const { userId, specialty, certifications, schedule, hourlyRate } = req.body;
    const gymId = req.user.gymId;

    // Check if user exists and has staff role
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (user.role !== 'staff') {
      return sendError(res, 400, 'User must have staff role');
    }

    const staff = await Staff.create({
      userId,
      gymId,
      specialty,
      certifications,
      schedule,
      hourlyRate
    });

    const populated = await Staff.findById(staff._id)
      .populate('userId', 'email firstName lastName phone avatar');

    sendCreated(res, 'Staff created successfully', populated);
  } catch (error) {
    sendError(res, 500, 'Failed to create staff', error.message);
  }
};

// @desc    Update staff
// @route   PUT /api/v1/staff/:id
// @access  Private (Owner or Super Admin)
export const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('userId', 'email firstName lastName phone avatar');

    if (!staff) {
      return sendError(res, 404, 'Staff member not found');
    }

    sendSuccess(res, 'Staff updated successfully', staff);
  } catch (error) {
    sendError(res, 500, 'Failed to update staff', error.message);
  }
};

// @desc    Delete staff
// @route   DELETE /api/v1/staff/:id
// @access  Private (Owner or Super Admin)
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return sendError(res, 404, 'Staff member not found');
    }

    await staff.deleteOne();

    sendSuccess(res, 'Staff deleted successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to delete staff', error.message);
  }
};

