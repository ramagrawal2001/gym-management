import Attendance from '../models/Attendance.js';
import Member from '../models/Member.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';

// @desc    Get member's own attendance
// @route   GET /api/v1/attendance/me
// @access  Private (Member)
export const getMyAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Find member record
    const Member = (await import('../models/Member.js')).default;
    const member = await Member.findOne({ userId: req.user._id });
    
    if (!member) {
      return sendError(res, 404, 'Member profile not found');
    }

    const attendance = await Attendance.find({ memberId: member._id })
      .populate('memberId', 'memberId')
      .populate('memberId.userId', 'firstName lastName email avatar')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ checkIn: -1 });

    const total = await Attendance.countDocuments({ memberId: member._id });

    sendSuccess(res, 'Attendance retrieved successfully', attendance, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get attendance', error.message);
  }
};

// @desc    Get all attendance records
// @route   GET /api/v1/attendance
// @access  Private
export const getAttendance = async (req, res) => {
  try {
    // Members can only see their own attendance
    if (req.user.role === 'member') {
      return getMyAttendance(req, res);
    }

    const { page = 1, limit = 10, memberId, date, status } = req.query;
    const skip = (page - 1) * limit;
    const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.gymId || req.user.gymId;

    const query = { gymId };
    
    if (memberId) {
      query.memberId = memberId;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.checkIn = { $gte: startDate, $lte: endDate };
    }

    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .populate('memberId', 'memberId')
      .populate('memberId.userId', 'firstName lastName email avatar')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ checkIn: -1 });

    const total = await Attendance.countDocuments(query);

    sendSuccess(res, 'Attendance retrieved successfully', attendance, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get attendance', error.message);
  }
};

// @desc    Get today's attendance
// @route   GET /api/v1/attendance/today
// @access  Private
export const getTodayAttendance = async (req, res) => {
  try {
    const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.user.gymId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.find({
      gymId,
      checkIn: { $gte: today, $lt: tomorrow }
    })
      .populate('memberId', 'memberId')
      .populate('memberId.userId', 'firstName lastName email avatar')
      .sort({ checkIn: -1 });

    const present = attendance.filter(a => a.status === 'completed').length;
    const active = attendance.filter(a => a.status === 'active').length;

    sendSuccess(res, 'Today\'s attendance retrieved successfully', {
      attendance,
      stats: {
        present,
        active,
        total: attendance.length
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get today\'s attendance', error.message);
  }
};

// @desc    Check in member
// @route   POST /api/v1/attendance/checkin
// @access  Private (Staff or above, or member checking themselves in)
export const checkIn = async (req, res) => {
  try {
    let { memberId } = req.body;
    const gymId = req.gymId || req.user.gymId;

    // If member is checking themselves in, use their memberId
    if (req.user.role === 'member') {
      const Member = (await import('../models/Member.js')).default;
      const member = await Member.findOne({ userId: req.user._id });
      if (!member) {
        return sendError(res, 404, 'Member profile not found');
      }
      memberId = member._id;
    } else if (!memberId) {
      return sendError(res, 400, 'Member ID is required');
    }

    // Check if member exists
    const member = await Member.findById(memberId);
    if (!member) {
      return sendError(res, 404, 'Member not found');
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCheckIn = await Attendance.findOne({
      memberId,
      gymId,
      checkIn: { $gte: today, $lt: tomorrow },
      status: 'active'
    });

    if (existingCheckIn) {
      return sendError(res, 400, 'Member already checked in today');
    }

    const attendance = await Attendance.create({
      memberId,
      gymId,
      checkIn: new Date(),
      status: 'active'
    });

    const populated = await Attendance.findById(attendance._id)
      .populate('memberId', 'memberId')
      .populate('memberId.userId', 'firstName lastName email avatar');

    sendCreated(res, 'Check-in successful', populated);
  } catch (error) {
    sendError(res, 500, 'Failed to check in', error.message);
  }
};

// @desc    Check out member
// @route   PUT /api/v1/attendance/checkout/:id
// @access  Private
export const checkOut = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return sendError(res, 404, 'Attendance record not found');
    }

    if (attendance.status === 'completed') {
      return sendError(res, 400, 'Member already checked out');
    }

    attendance.checkOut = new Date();
    attendance.status = 'completed';
    await attendance.save();

    const populated = await Attendance.findById(attendance._id)
      .populate('memberId', 'memberId')
      .populate('memberId.userId', 'firstName lastName email avatar');

    sendSuccess(res, 'Check-out successful', populated);
  } catch (error) {
    sendError(res, 500, 'Failed to check out', error.message);
  }
};

// @desc    Get member attendance history
// @route   GET /api/v1/attendance/member/:memberId
// @access  Private
export const getMemberAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const Member = (await import('../models/Member.js')).default;
    const member = await Member.findById(req.params.memberId);

    if (!member) {
      return sendError(res, 404, 'Member not found');
    }

    // Members can only view their own attendance
    if (req.user.role === 'member') {
      if (member.userId.toString() !== req.user._id.toString()) {
        return sendError(res, 403, 'Access denied: Cannot view other members\' attendance');
      }
    }

    // Staff/Owner can only view attendance for members in their gym
    if (req.user.role !== 'super_admin' && req.user.role !== 'member') {
      if (member.gymId.toString() !== req.user.gymId.toString()) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
    }

    const attendance = await Attendance.find({ memberId: req.params.memberId })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ checkIn: -1 });

    const total = await Attendance.countDocuments({ memberId: req.params.memberId });

    sendSuccess(res, 'Member attendance retrieved successfully', attendance, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get member attendance', error.message);
  }
};

