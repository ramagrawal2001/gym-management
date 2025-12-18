import Plan from '../models/Plan.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';

// @desc    Get all plans
// @route   GET /api/v1/plans
// @access  Private
export const getPlans = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, gymId } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    
    // Filter by gymId based on user role
    if (req.user.role === 'super_admin') {
      // Super admin can see all plans or filter by specific gymId
      if (gymId) {
        query.gymId = gymId;
      }
      // If no gymId specified, show all plans (including null gymId for subscription plans)
    } else {
      // Owners and staff can only see plans for their gym
      query.gymId = req.user.gymId;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const plans = await Plan.find(query)
      .populate('gymId', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Plan.countDocuments(query);

    sendSuccess(res, 'Plans retrieved successfully', plans, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get plans', error.message);
  }
};

// @desc    Get single plan
// @route   GET /api/v1/plans/:id
// @access  Private
export const getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id)
      .populate('gymId', 'name');

    if (!plan) {
      return sendError(res, 404, 'Plan not found');
    }

    // Check gym scope for non-super-admin users
    if (req.user.role !== 'super_admin') {
      const planGymId = plan.gymId ? (plan.gymId._id ? plan.gymId._id.toString() : plan.gymId.toString()) : null;
      const userGymId = req.user.gymId ? req.user.gymId.toString() : null;
      
      if (!planGymId || planGymId !== userGymId) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
    }

    sendSuccess(res, 'Plan retrieved successfully', plan);
  } catch (error) {
    sendError(res, 500, 'Failed to get plan', error.message);
  }
};

// @desc    Create plan
// @route   POST /api/v1/plans
// @access  Private (Super Admin or Owner)
export const createPlan = async (req, res) => {
  try {
    // Set gymId based on user role
    const planData = { ...req.body };
    
    if (req.user.role === 'super_admin') {
      // Super admin can create plans for any gym or null (for subscription plans)
      // gymId can be provided in req.body or left null
      // If not provided, it will be null (for subscription plans)
    } else {
      // Owners can only create plans for their own gym
      // enforceGymScope middleware sets req.gymId, use it
      planData.gymId = req.gymId || req.user.gymId;
    }

    const plan = await Plan.create(planData);
    
    const populated = await plan.populate('gymId', 'name');
    
    sendCreated(res, 'Plan created successfully', populated);
  } catch (error) {
    sendError(res, 500, 'Failed to create plan', error.message);
  }
};

// @desc    Update plan
// @route   PUT /api/v1/plans/:id
// @access  Private (Super Admin or Owner)
export const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return sendError(res, 404, 'Plan not found');
    }

    // Check gym scope for non-super-admin users
    if (req.user.role !== 'super_admin') {
      const planGymId = plan.gymId ? plan.gymId.toString() : null;
      const userGymId = req.user.gymId ? req.user.gymId.toString() : null;
      
      if (!planGymId || planGymId !== userGymId) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
      // Prevent owners from changing gymId
      delete req.body.gymId;
    }

    const updatedPlan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('gymId', 'name');

    sendSuccess(res, 'Plan updated successfully', updatedPlan);
  } catch (error) {
    sendError(res, 500, 'Failed to update plan', error.message);
  }
};

// @desc    Delete plan
// @route   DELETE /api/v1/plans/:id
// @access  Private (Super Admin or Owner)
export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return sendError(res, 404, 'Plan not found');
    }

    // Check gym scope for non-super-admin users
    if (req.user.role !== 'super_admin') {
      // Owners can only delete plans that belong to their gym
      const planGymId = plan.gymId ? plan.gymId.toString() : null;
      const userGymId = req.user.gymId ? req.user.gymId.toString() : null;
      
      if (!planGymId || planGymId !== userGymId) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
    }

    // Check if plan is being used by any members
    const Member = (await import('../models/Member.js')).default;
    const membersUsingPlan = await Member.countDocuments({ planId: plan._id });
    
    if (membersUsingPlan > 0) {
      return sendError(res, 400, `Cannot delete plan: ${membersUsingPlan} member(s) are currently using this plan`);
    }

    await plan.deleteOne();

    sendSuccess(res, 'Plan deleted successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to delete plan', error.message);
  }
};

