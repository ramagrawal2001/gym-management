import Plan from '../models/Plan.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';

// @desc    Get all plans
// @route   GET /api/v1/plans
// @access  Private
export const getPlans = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const plans = await Plan.find(query)
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
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return sendError(res, 404, 'Plan not found');
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
    const plan = await Plan.create(req.body);
    
    sendCreated(res, 'Plan created successfully', plan);
  } catch (error) {
    sendError(res, 500, 'Failed to create plan', error.message);
  }
};

// @desc    Update plan
// @route   PUT /api/v1/plans/:id
// @access  Private (Super Admin or Owner)
export const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!plan) {
      return sendError(res, 404, 'Plan not found');
    }

    sendSuccess(res, 'Plan updated successfully', plan);
  } catch (error) {
    sendError(res, 500, 'Failed to update plan', error.message);
  }
};

// @desc    Delete plan
// @route   DELETE /api/v1/plans/:id
// @access  Private (Super Admin)
export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return sendError(res, 404, 'Plan not found');
    }

    await plan.deleteOne();

    sendSuccess(res, 'Plan deleted successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to delete plan', error.message);
  }
};

