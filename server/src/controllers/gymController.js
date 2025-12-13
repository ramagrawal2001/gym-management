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
    const { ownerEmail, ownerId, ...gymData } = req.body;
    
    let finalOwnerId = ownerId;
    
    // If ownerEmail is provided, find or create the user
    if (ownerEmail && !ownerId) {
      const User = (await import('../models/User.js')).default;
      let owner = await User.findOne({ email: ownerEmail });
      
      if (!owner) {
        // Create new owner user
        owner = await User.create({
          email: ownerEmail,
          password: 'TempPassword123!', // Temporary password, should be changed
          role: 'owner',
          firstName: gymData.name?.split(' ')[0] || 'Owner',
          lastName: gymData.name?.split(' ').slice(1).join(' ') || '',
          isActive: true
        });
      } else {
        // Update existing user to be owner if not already
        if (owner.role !== 'owner') {
          owner.role = 'owner';
          await owner.save();
        }
      }
      
      finalOwnerId = owner._id;
    }
    
    if (!finalOwnerId) {
      return sendError(res, 400, 'Owner ID or email is required');
    }
    
    const gym = await Gym.create({
      ...gymData,
      ownerId: finalOwnerId
    });
    
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

    gym = await Gym.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

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

