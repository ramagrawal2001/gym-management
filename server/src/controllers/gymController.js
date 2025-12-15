import Gym from '../models/Gym.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';

// @desc    Get all gyms (Super Admin only)
// @route   GET /api/v1/gyms
// @access  Private (Super Admin)
export const getGyms = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const gyms = await Gym.find(query)
      .populate('ownerId', 'email firstName lastName')
      .populate('planId', 'name price')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Gym.countDocuments(query);

    sendSuccess(res, 'Gyms retrieved successfully', gyms, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get gyms', error.message);
  }
};

// @desc    Get single gym
// @route   GET /api/v1/gyms/:id
// @access  Private
export const getGym = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id)
      .populate('ownerId', 'email firstName lastName')
      .populate('planId', 'name price duration features');

    if (!gym) {
      return sendError(res, 404, 'Gym not found');
    }

    sendSuccess(res, 'Gym retrieved successfully', gym);
  } catch (error) {
    sendError(res, 500, 'Failed to get gym', error.message);
  }
};

// @desc    Create gym
// @route   POST /api/v1/gyms
// @access  Private (Super Admin)
export const createGym = async (req, res) => {
  try {
    const { ownerEmail, ownerId, planId, ...gymData } = req.body;
    const User = (await import('../models/User.js')).default;
    
    // Clean up gymData - remove empty strings and convert to proper types
    const cleanedGymData = { ...gymData };
    
    // Handle planId - remove if empty string
    if (planId && planId.trim() !== '') {
      cleanedGymData.planId = planId;
    } else {
      delete cleanedGymData.planId;
    }
    
    let finalOwnerId = ownerId;
    
    // If ownerEmail is provided, find or create the user
    if (ownerEmail && !ownerId) {
      let owner = await User.findOne({ email: ownerEmail });
      
      if (!owner) {
        // Create gym first with super admin as temporary owner to get gymId
        const tempGym = await Gym.create({
          ...cleanedGymData,
          ownerId: req.user._id // Use super admin as temporary owner
        });
        
        // Now create owner user with the gymId
        // Generate random password (required by schema, but OTP login is used)
        const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
        owner = await User.create({
          email: ownerEmail,
          password: randomPassword, // Random password, OTP login is used
          role: 'owner',
          gymId: tempGym._id,
          firstName: gymData.name?.split(' ')[0] || 'Owner',
          lastName: gymData.name?.split(' ').slice(1).join(' ') || '',
          isActive: true
        });
        
        // Update gym with real ownerId
        tempGym.ownerId = owner._id;
        await tempGym.save();
        
        const populated = await Gym.findById(tempGym._id)
          .populate('ownerId', 'email firstName lastName')
          .populate('planId', 'name price');
        
        return sendCreated(res, 'Gym created successfully', populated);
      } else {
        // Update existing user to be owner if not already
        if (owner.role !== 'owner' && owner.role !== 'super_admin') {
          owner.role = 'owner';
          await owner.save();
        }
        
        finalOwnerId = owner._id;
      }
    }
    
    if (!finalOwnerId) {
      return sendError(res, 400, 'Owner ID or email is required');
    }
    
    // If owner already exists, create gym normally
    const gym = await Gym.create({
      ...cleanedGymData,
      ownerId: finalOwnerId
    });
    
    // Update owner's gymId if it doesn't have one
    const owner = await User.findById(finalOwnerId);
    if (owner && !owner.gymId) {
      owner.gymId = gym._id;
      await owner.save();
    }
    
    const populated = await Gym.findById(gym._id)
      .populate('ownerId', 'email firstName lastName')
      .populate('planId', 'name price');
    
    sendCreated(res, 'Gym created successfully', populated);
  } catch (error) {
    sendError(res, 500, 'Failed to create gym', error.message);
  }
};

// @desc    Update gym
// @route   PUT /api/v1/gyms/:id
// @access  Private (Super Admin or Owner)
export const updateGym = async (req, res) => {
  try {
    let gym = await Gym.findById(req.params.id);
    
    if (!gym) {
      return sendError(res, 404, 'Gym not found');
    }

    // Check if user is owner or super admin
    if (req.user.role !== 'super_admin' && gym.ownerId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized');
    }

    // Clean up update data - remove empty strings and convert to proper types
    const updateData = { ...req.body };
    
    // Handle planId - remove if empty string
    if (updateData.planId && updateData.planId.trim() === '') {
      delete updateData.planId;
    } else if (updateData.planId === '') {
      delete updateData.planId;
    }

    gym = await Gym.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    })
      .populate('ownerId', 'email firstName lastName')
      .populate('planId', 'name price');

    sendSuccess(res, 'Gym updated successfully', gym);
  } catch (error) {
    sendError(res, 500, 'Failed to update gym', error.message);
  }
};

// @desc    Update gym features
// @route   PUT /api/v1/gyms/:id/features
// @access  Private (Super Admin)
export const updateGymFeatures = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    
    if (!gym) {
      return sendError(res, 404, 'Gym not found');
    }

    gym.features = { ...gym.features, ...req.body };
    await gym.save();

    sendSuccess(res, 'Gym features updated successfully', gym);
  } catch (error) {
    sendError(res, 500, 'Failed to update gym features', error.message);
  }
};

// @desc    Update gym branding
// @route   PUT /api/v1/gyms/:id/branding
// @access  Private (Owner or Super Admin)
export const updateGymBranding = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    
    if (!gym) {
      return sendError(res, 404, 'Gym not found');
    }

    gym.branding = { ...gym.branding, ...req.body };
    await gym.save();

    sendSuccess(res, 'Gym branding updated successfully', gym);
  } catch (error) {
    sendError(res, 500, 'Failed to update gym branding', error.message);
  }
};

// @desc    Suspend or activate gym
// @route   PUT /api/v1/gyms/:id/suspend
// @access  Private (Super Admin only)
export const suspendGym = async (req, res) => {
  try {
    const { isActive } = req.body;
    const gym = await Gym.findById(req.params.id);
    
    if (!gym) {
      return sendError(res, 404, 'Gym not found');
    }

    gym.isActive = isActive !== undefined ? isActive : !gym.isActive;
    await gym.save();

    sendSuccess(res, `Gym ${gym.isActive ? 'activated' : 'suspended'} successfully`, gym);
  } catch (error) {
    sendError(res, 500, 'Failed to update gym status', error.message);
  }
};

// @desc    Delete gym
// @route   DELETE /api/v1/gyms/:id
// @access  Private (Super Admin only)
export const deleteGym = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    
    if (!gym) {
      return sendError(res, 404, 'Gym not found');
    }

    await gym.deleteOne();

    sendSuccess(res, 'Gym deleted successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to delete gym', error.message);
  }
};

// @desc    Get gym analytics
// @route   GET /api/v1/gyms/:id/analytics
// @access  Private (Super Admin only)
export const getGymAnalytics = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    
    if (!gym) {
      return sendError(res, 404, 'Gym not found');
    }

    const Member = (await import('../models/Member.js')).default;
    const Payment = (await import('../models/Payment.js')).default;
    const Attendance = (await import('../models/Attendance.js')).default;
    const Staff = (await import('../models/Staff.js')).default;

    // Get member count
    const totalMembers = await Member.countDocuments({ gymId: gym._id });
    const activeMembers = await Member.countDocuments({ gymId: gym._id, status: 'active' });

    // Get revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPayments = await Payment.find({
      gymId: gym._id,
      paidAt: { $gte: thirtyDaysAgo },
      status: 'completed'
    });
    const monthlyRevenue = recentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Get attendance (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentAttendance = await Attendance.countDocuments({
      gymId: gym._id,
      checkIn: { $gte: sevenDaysAgo }
    });

    // Get staff count
    const totalStaff = await Staff.countDocuments({ gymId: gym._id });

    sendSuccess(res, 'Gym analytics retrieved successfully', {
      gym: {
        id: gym._id,
        name: gym.name,
        isActive: gym.isActive
      },
      members: {
        total: totalMembers,
        active: activeMembers
      },
      revenue: {
        monthly: monthlyRevenue,
        currency: gym.settings?.currency || 'USD'
      },
      attendance: {
        last7Days: recentAttendance
      },
      staff: {
        total: totalStaff
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get gym analytics', error.message);
  }
};

// @desc    Get gym members
// @route   GET /api/v1/gyms/:id/members
// @access  Private (Super Admin only)
export const getGymMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const gym = await Gym.findById(req.params.id);
    
    if (!gym) {
      return sendError(res, 404, 'Gym not found');
    }

    const Member = (await import('../models/Member.js')).default;

    const members = await Member.find({ gymId: gym._id })
      .populate('userId', 'email firstName lastName phone avatar')
      .populate('planId', 'name price duration')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Member.countDocuments({ gymId: gym._id });

    sendSuccess(res, 'Gym members retrieved successfully', members, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get gym members', error.message);
  }
};

// @desc    Get gym staff
// @route   GET /api/v1/gyms/:id/staff
// @access  Private (Super Admin only)
export const getGymStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const gym = await Gym.findById(req.params.id);
    
    if (!gym) {
      return sendError(res, 404, 'Gym not found');
    }

    const Staff = (await import('../models/Staff.js')).default;

    const staff = await Staff.find({ gymId: gym._id })
      .populate('userId', 'email firstName lastName phone avatar')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Staff.countDocuments({ gymId: gym._id });

    sendSuccess(res, 'Gym staff retrieved successfully', staff, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get gym staff', error.message);
  }
};

