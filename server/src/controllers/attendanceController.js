import Attendance from '../models/Attendance.js';
import Member from '../models/Member.js';
import AttendanceConfig from '../models/AttendanceConfig.js';
import AttendanceOverrideLog from '../models/AttendanceOverrideLog.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';
import crypto from 'crypto';

// Helper function to generate QR code string
const generateQRCodeString = (memberId, gymId, type = 'static') => {
  if (type === 'static') {
    // Static QR: Member ID + Gym ID hash
    return `GYM-${gymId}-MEM-${memberId}`;
  } else {
    // Dynamic QR: Include timestamp for expiry
    const timestamp = Date.now();
    const data = `${gymId}-${memberId}-${timestamp}`;
    const hash = crypto.createHash('sha256').update(data).digest('hex').substring(0, 12);
    return `GYM-${gymId}-MEM-${memberId}-${timestamp}-${hash}`;
  }
};

// Helper function to validate dynamic QR code
const validateDynamicQR = (qrCode, expiryMinutes = 1440) => {
  const parts = qrCode.split('-');
  if (parts.length < 6) return { valid: false, reason: 'Invalid QR format' };

  const timestamp = parseInt(parts[4]);
  const now = Date.now();
  const expiryMs = expiryMinutes * 60 * 1000;

  if (now - timestamp > expiryMs) {
    return { valid: false, reason: 'QR code has expired' };
  }

  // Verify hash
  const gymId = parts[1];
  const memberId = parts[3];
  const data = `${gymId}-${memberId}-${timestamp}`;
  const expectedHash = crypto.createHash('sha256').update(data).digest('hex').substring(0, 12);

  if (parts[5] !== expectedHash) {
    return { valid: false, reason: 'Invalid QR code' };
  }

  return { valid: true, gymId, memberId };
};

// @desc    Get member's own attendance
// @route   GET /api/v1/attendance/me
// @access  Private (Member)
export const getMyAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Find member record
    const MemberModel = (await import('../models/Member.js')).default;
    const member = await MemberModel.findOne({ userId: req.user._id });

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

    const { page = 1, limit = 10, memberId, date, status, method } = req.query;
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

    if (method) {
      query.method = method;
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

    // Get method breakdown
    const methodBreakdown = {
      qr: attendance.filter(a => a.method === 'qr').length,
      manual: attendance.filter(a => a.method === 'manual').length,
      nfc: attendance.filter(a => a.method === 'nfc').length,
      biometric: attendance.filter(a => a.method === 'biometric').length
    };

    sendSuccess(res, 'Today\'s attendance retrieved successfully', {
      attendance,
      stats: {
        present,
        active,
        total: attendance.length,
        methodBreakdown
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get today\'s attendance', error.message);
  }
};

// @desc    Check in member (manual)
// @route   POST /api/v1/attendance/checkin
// @access  Private (Staff or above, or member checking themselves in)
export const checkIn = async (req, res) => {
  try {
    let { memberId, notes } = req.body;
    const gymId = req.gymId || req.user.gymId;

    // If member is checking themselves in, use their memberId
    if (req.user.role === 'member') {
      const MemberModel = (await import('../models/Member.js')).default;
      const member = await MemberModel.findOne({ userId: req.user._id });
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

    // Check attendance config
    const config = await AttendanceConfig.findOne({ gymId });
    if (config && !config.isEnabled) {
      return sendError(res, 400, 'Attendance is disabled for this gym');
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

    // Check for multiple checkins setting
    if (config && !config.qrSettings?.allowMultipleCheckins) {
      const completedToday = await Attendance.findOne({
        memberId,
        gymId,
        checkIn: { $gte: today, $lt: tomorrow },
        status: 'completed'
      });
      if (completedToday) {
        return sendError(res, 400, 'Member has already checked in and out today. Multiple check-ins not allowed.');
      }
    }

    const attendance = await Attendance.create({
      memberId,
      gymId,
      checkIn: new Date(),
      status: 'active',
      method: 'manual',
      notes,
      deviceInfo: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const populated = await Attendance.findById(attendance._id)
      .populate('memberId', 'memberId')
      .populate('memberId.userId', 'firstName lastName email avatar');

    sendCreated(res, 'Check-in successful', populated);
  } catch (error) {
    sendError(res, 500, 'Failed to check in', error.message);
  }
};

// @desc    Check in with QR code
// @route   POST /api/v1/attendance/qr-checkin
// @access  Private
export const checkInWithQR = async (req, res) => {
  try {
    const { qrCode } = req.body;
    const gymId = req.gymId || req.user.gymId;

    if (!qrCode) {
      return sendError(res, 400, 'QR code is required');
    }

    // Check attendance config
    const config = await AttendanceConfig.findOne({ gymId });
    if (!config) {
      return sendError(res, 404, 'Attendance configuration not found');
    }
    if (!config.isEnabled) {
      return sendError(res, 400, 'Attendance is disabled for this gym');
    }
    if (config.activeMethod !== 'qr') {
      return sendError(res, 400, 'QR check-in is not the active method for this gym');
    }

    let memberId;

    // Parse QR code
    if (config.qrSettings?.type === 'dynamic') {
      const validation = validateDynamicQR(qrCode, config.qrSettings.expiryMinutes);
      if (!validation.valid) {
        return sendError(res, 400, validation.reason);
      }
      if (validation.gymId !== gymId.toString()) {
        return sendError(res, 400, 'QR code is not valid for this gym');
      }
      memberId = validation.memberId;
    } else {
      // Static QR format: GYM-{gymId}-MEM-{memberId}
      const parts = qrCode.split('-');
      if (parts.length < 4 || parts[0] !== 'GYM' || parts[2] !== 'MEM') {
        return sendError(res, 400, 'Invalid QR code format');
      }
      if (parts[1] !== gymId.toString()) {
        return sendError(res, 400, 'QR code is not valid for this gym');
      }
      memberId = parts[3];
    }

    // Check if member exists
    const member = await Member.findById(memberId);
    if (!member) {
      return sendError(res, 404, 'Member not found');
    }

    // Check for existing active check-in
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

    // Check for multiple checkins
    if (!config.qrSettings?.allowMultipleCheckins) {
      const completedToday = await Attendance.findOne({
        memberId,
        gymId,
        checkIn: { $gte: today, $lt: tomorrow },
        status: 'completed'
      });
      if (completedToday) {
        return sendError(res, 400, 'Member has already checked in and out today');
      }
    }

    const attendance = await Attendance.create({
      memberId,
      gymId,
      checkIn: new Date(),
      status: 'active',
      method: 'qr',
      qrCode,
      deviceInfo: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const populated = await Attendance.findById(attendance._id)
      .populate('memberId', 'memberId')
      .populate('memberId.userId', 'firstName lastName email avatar');

    sendCreated(res, 'QR Check-in successful', populated);
  } catch (error) {
    sendError(res, 500, 'Failed to check in with QR', error.message);
  }
};

// @desc    Generate QR code for member
// @route   GET /api/v1/attendance/qr/:memberId
// @access  Private
export const generateQRCode = async (req, res) => {
  try {
    const { memberId } = req.params;
    const gymId = req.gymId || req.user.gymId;

    // Check if member exists
    const member = await Member.findById(memberId);
    if (!member) {
      return sendError(res, 404, 'Member not found');
    }

    // Check attendance config
    const config = await AttendanceConfig.findOne({ gymId });
    const qrType = config?.qrSettings?.type || 'static';

    const qrCode = generateQRCodeString(memberId, gymId, qrType);

    sendSuccess(res, 'QR code generated successfully', {
      qrCode,
      type: qrType,
      expiresIn: qrType === 'dynamic' ? config?.qrSettings?.expiryMinutes || 1440 : null,
      member: {
        id: member._id,
        memberId: member.memberId
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to generate QR code', error.message);
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

// @desc    Staff override attendance
// @route   POST /api/v1/attendance/override
// @access  Private (Staff, Owner)
export const staffOverride = async (req, res) => {
  try {
    const { attendanceId, action, reason, checkIn, checkOut } = req.body;
    const gymId = req.gymId || req.user.gymId;

    if (!attendanceId) {
      return sendError(res, 400, 'Attendance ID is required');
    }
    if (!action) {
      return sendError(res, 400, 'Action is required');
    }
    if (!reason || reason.length < 10) {
      return sendError(res, 400, 'Reason is required and must be at least 10 characters');
    }

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return sendError(res, 404, 'Attendance record not found');
    }

    // Store previous values
    const previousValue = {
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      status: attendance.status,
      duration: attendance.duration
    };

    // Apply override based on action
    switch (action) {
      case 'manual_checkout':
      case 'force_checkout':
        attendance.checkOut = checkOut ? new Date(checkOut) : new Date();
        attendance.status = 'completed';
        break;
      case 'modify_time':
        if (checkIn) attendance.checkIn = new Date(checkIn);
        if (checkOut) {
          attendance.checkOut = new Date(checkOut);
          attendance.status = 'completed';
        }
        break;
      case 'delete':
        // Soft delete by marking as deleted (or you could actually delete)
        attendance.status = 'deleted';
        break;
      default:
        return sendError(res, 400, 'Invalid action');
    }

    // Mark as overridden
    attendance.staffOverride = {
      isOverridden: true,
      staffId: req.user._id,
      reason,
      overriddenAt: new Date()
    };

    await attendance.save();

    // Create override log
    await AttendanceOverrideLog.create({
      attendanceId: attendance._id,
      gymId,
      memberId: attendance.memberId,
      staffId: req.user._id,
      action,
      reason,
      previousValue,
      newValue: {
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        status: attendance.status,
        duration: attendance.duration
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    sendSuccess(res, 'Override applied successfully', attendance);
  } catch (error) {
    sendError(res, 500, 'Failed to apply override', error.message);
  }
};

// @desc    Get attendance reports
// @route   GET /api/v1/attendance/reports
// @access  Private (Staff, Owner)
export const getReports = async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;
    const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.user.gymId;

    let start, end;
    const now = new Date();

    switch (period) {
      case 'daily':
        start = new Date(startDate || now);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(end.getDate() + 1);
        break;
      case 'weekly':
        start = new Date(startDate || now);
        start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(end.getDate() + 7);
        break;
      case 'monthly':
        start = new Date(startDate || now);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        break;
      case 'custom':
        if (!startDate || !endDate) {
          return sendError(res, 400, 'Start and end dates required for custom period');
        }
        start = new Date(startDate);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        return sendError(res, 400, 'Invalid period. Use: daily, weekly, monthly, or custom');
    }

    // Get attendance data
    const attendance = await Attendance.find({
      gymId,
      checkIn: { $gte: start, $lt: end }
    }).populate('memberId', 'memberId');

    // Calculate statistics
    const totalCheckIns = attendance.length;
    const uniqueMembers = new Set(attendance.map(a => a.memberId?._id?.toString())).size;
    const completedSessions = attendance.filter(a => a.status === 'completed');
    const avgDuration = completedSessions.length > 0
      ? Math.round(completedSessions.reduce((sum, a) => sum + (a.duration || 0), 0) / completedSessions.length)
      : 0;

    // Method breakdown
    const methodBreakdown = {
      qr: attendance.filter(a => a.method === 'qr').length,
      manual: attendance.filter(a => a.method === 'manual').length,
      nfc: attendance.filter(a => a.method === 'nfc').length,
      biometric: attendance.filter(a => a.method === 'biometric').length
    };

    // Daily breakdown for charts
    const dailyBreakdown = {};
    attendance.forEach(a => {
      const dateKey = a.checkIn.toISOString().split('T')[0];
      if (!dailyBreakdown[dateKey]) {
        dailyBreakdown[dateKey] = { total: 0, completed: 0, avgDuration: 0, durations: [] };
      }
      dailyBreakdown[dateKey].total++;
      if (a.status === 'completed') {
        dailyBreakdown[dateKey].completed++;
        if (a.duration) dailyBreakdown[dateKey].durations.push(a.duration);
      }
    });

    // Calculate average duration per day
    Object.keys(dailyBreakdown).forEach(date => {
      const durations = dailyBreakdown[date].durations;
      dailyBreakdown[date].avgDuration = durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;
      delete dailyBreakdown[date].durations;
    });

    // Peak hours
    const hourlyCount = Array(24).fill(0);
    attendance.forEach(a => {
      const hour = a.checkIn.getHours();
      hourlyCount[hour]++;
    });
    const peakHour = hourlyCount.indexOf(Math.max(...hourlyCount));

    sendSuccess(res, 'Attendance reports generated successfully', {
      period,
      dateRange: { start, end },
      summary: {
        totalCheckIns,
        uniqueMembers,
        completedSessions: completedSessions.length,
        avgDuration: `${avgDuration} mins`,
        peakHour: `${peakHour}:00 - ${peakHour + 1}:00`
      },
      methodBreakdown,
      dailyBreakdown: Object.entries(dailyBreakdown).map(([date, data]) => ({
        date,
        ...data
      })).sort((a, b) => new Date(a.date) - new Date(b.date)),
      hourlyDistribution: hourlyCount.map((count, hour) => ({ hour, count }))
    });
  } catch (error) {
    sendError(res, 500, 'Failed to generate reports', error.message);
  }
};

// @desc    Export attendance to CSV
// @route   GET /api/v1/attendance/export
// @access  Private (Staff, Owner)
export const exportAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.user.gymId;

    const start = new Date(startDate || new Date().setMonth(new Date().getMonth() - 1));
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate || new Date());
    end.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      gymId,
      checkIn: { $gte: start, $lte: end }
    })
      .populate('memberId', 'memberId')
      .populate({
        path: 'memberId',
        populate: { path: 'userId', select: 'firstName lastName email' }
      })
      .sort({ checkIn: -1 });

    // Generate CSV
    const csvHeader = 'Member ID,Member Name,Email,Check In,Check Out,Duration (mins),Status,Method,Notes\n';
    const csvRows = attendance.map(a => {
      const memberName = a.memberId?.userId
        ? `${a.memberId.userId.firstName} ${a.memberId.userId.lastName}`
        : 'Unknown';
      const email = a.memberId?.userId?.email || '';
      return [
        a.memberId?.memberId || '',
        memberName,
        email,
        a.checkIn?.toISOString() || '',
        a.checkOut?.toISOString() || '',
        a.duration || '',
        a.status || '',
        a.method || '',
        (a.notes || '').replace(/,/g, ';')
      ].join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    sendError(res, 500, 'Failed to export attendance', error.message);
  }
};

// @desc    Import attendance from CSV
// @route   POST /api/v1/attendance/import
// @access  Private (Owner)
export const importAttendance = async (req, res) => {
  try {
    const { data } = req.body; // Array of attendance records
    const gymId = req.user.gymId;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return sendError(res, 400, 'No data provided. Expected array of attendance records.');
    }

    const results = {
      imported: 0,
      failed: 0,
      errors: []
    };

    for (const record of data) {
      try {
        // Find member by memberId
        const member = await Member.findOne({
          memberId: record.memberId,
          gymId
        });

        if (!member) {
          results.failed++;
          results.errors.push(`Member ${record.memberId} not found`);
          continue;
        }

        // Create attendance record
        await Attendance.create({
          memberId: member._id,
          gymId,
          checkIn: new Date(record.checkIn),
          checkOut: record.checkOut ? new Date(record.checkOut) : null,
          status: record.checkOut ? 'completed' : 'active',
          method: record.method || 'manual',
          notes: record.notes || 'Imported record'
        });

        results.imported++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Error importing record: ${err.message}`);
      }
    }

    sendSuccess(res, 'Import completed', results);
  } catch (error) {
    sendError(res, 500, 'Failed to import attendance', error.message);
  }
};

// @desc    Get override logs
// @route   GET /api/v1/attendance/override-logs
// @access  Private (Owner)
export const getOverrideLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, staffId, memberId } = req.query;
    const skip = (page - 1) * limit;
    const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.user.gymId;

    const query = { gymId };
    if (staffId) query.staffId = staffId;
    if (memberId) query.memberId = memberId;

    const logs = await AttendanceOverrideLog.find(query)
      .populate('staffId', 'firstName lastName email')
      .populate('memberId', 'memberId')
      .populate({
        path: 'memberId',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await AttendanceOverrideLog.countDocuments(query);

    sendSuccess(res, 'Override logs retrieved successfully', logs, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get override logs', error.message);
  }
};

// @desc    Get member attendance history
// @route   GET /api/v1/attendance/member/:memberId
// @access  Private
export const getMemberAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const MemberModel = (await import('../models/Member.js')).default;
    const member = await MemberModel.findById(req.params.memberId);

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

    // Calculate stats
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const thisMonthAttendance = await Attendance.countDocuments({
      memberId: req.params.memberId,
      checkIn: { $gte: thisMonth }
    });

    sendSuccess(res, 'Member attendance retrieved successfully', {
      attendance,
      stats: {
        totalVisits: total,
        thisMonth: thisMonthAttendance
      }
    }, {
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
