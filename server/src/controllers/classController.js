import Class from '../models/Class.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';

// @desc    Get all classes
// @route   GET /api/v1/classes
// @access  Private
export const getClasses = async (req, res) => {
  try {
    const { page = 1, limit = 10, trainerId, dayOfWeek } = req.query;
    const skip = (page - 1) * limit;
    const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.user.gymId;

    const query = { gymId, isActive: true };
    
    if (trainerId) {
      query.trainerId = trainerId;
    }

    if (dayOfWeek !== undefined) {
      query['schedule.dayOfWeek'] = parseInt(dayOfWeek);
    }

    const classes = await Class.find(query)
      .populate('trainerId', 'firstName lastName email')
      .populate('bookings.memberId', 'memberId')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'schedule.dayOfWeek': 1, 'schedule.startTime': 1 });

    const total = await Class.countDocuments(query);

    sendSuccess(res, 'Classes retrieved successfully', classes, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get classes', error.message);
  }
};

// @desc    Get single class
// @route   GET /api/v1/classes/:id
// @access  Private
export const getClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('trainerId', 'firstName lastName email')
      .populate('bookings.memberId', 'memberId userId')
      .populate('bookings.memberId.userId', 'firstName lastName email');

    if (!classItem) {
      return sendError(res, 404, 'Class not found');
    }

    sendSuccess(res, 'Class retrieved successfully', classItem);
  } catch (error) {
    sendError(res, 500, 'Failed to get class', error.message);
  }
};

// @desc    Create class
// @route   POST /api/v1/classes
// @access  Private (Staff or above)
export const createClass = async (req, res) => {
  try {
    const gymId = req.user.gymId;
    const classItem = await Class.create({ ...req.body, gymId });
    
    const populated = await Class.findById(classItem._id)
      .populate('trainerId', 'firstName lastName email');

    sendCreated(res, 'Class created successfully', populated);
  } catch (error) {
    sendError(res, 500, 'Failed to create class', error.message);
  }
};

// @desc    Update class
// @route   PUT /api/v1/classes/:id
// @access  Private (Staff or above)
export const updateClass = async (req, res) => {
  try {
    const classItem = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('trainerId', 'firstName lastName email');

    if (!classItem) {
      return sendError(res, 404, 'Class not found');
    }

    sendSuccess(res, 'Class updated successfully', classItem);
  } catch (error) {
    sendError(res, 500, 'Failed to update class', error.message);
  }
};

// @desc    Book class
// @route   POST /api/v1/classes/:id/book
// @access  Private
export const bookClass = async (req, res) => {
  try {
    const { memberId } = req.body;
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return sendError(res, 404, 'Class not found');
    }

    // Check capacity
    if (classItem.bookings.length >= classItem.capacity) {
      return sendError(res, 400, 'Class is full');
    }

    // Check if already booked
    const alreadyBooked = classItem.bookings.some(
      booking => booking.memberId.toString() === memberId
    );

    if (alreadyBooked) {
      return sendError(res, 400, 'Member already booked for this class');
    }

    classItem.bookings.push({ memberId, bookedAt: new Date() });
    await classItem.save();

    const populated = await Class.findById(classItem._id)
      .populate('trainerId', 'firstName lastName email')
      .populate('bookings.memberId', 'memberId');

    sendSuccess(res, 'Class booked successfully', populated);
  } catch (error) {
    sendError(res, 500, 'Failed to book class', error.message);
  }
};

// @desc    Cancel booking
// @route   DELETE /api/v1/classes/:id/book/:bookingId
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return sendError(res, 404, 'Class not found');
    }

    classItem.bookings = classItem.bookings.filter(
      booking => booking._id.toString() !== req.params.bookingId
    );
    await classItem.save();

    sendSuccess(res, 'Booking cancelled successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to cancel booking', error.message);
  }
};

// @desc    Delete class
// @route   DELETE /api/v1/classes/:id
// @access  Private (Staff or above)
export const deleteClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return sendError(res, 404, 'Class not found');
    }

    await classItem.deleteOne();

    sendSuccess(res, 'Class deleted successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to delete class', error.message);
  }
};

