import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Gym from '../models/Gym.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';

// @desc    Get all subscription plans (Super Admin only)
// @route   GET /api/v1/subscription-plans
// @access  Private (Super Admin)
export const getPlans = async (req, res) => {
    try {
        const { page = 1, limit = 20, gymId, isPaid, isActive } = req.query;
        const skip = (page - 1) * limit;

        const query = {};

        if (gymId) {
            query.gymId = gymId;
        }
        if (isPaid !== undefined) {
            query.isPaid = isPaid === 'true';
        }
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const plans = await SubscriptionPlan.find(query)
            .populate('gymId', 'name contact.email')
            .populate('createdBy', 'firstName lastName email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await SubscriptionPlan.countDocuments(query);

        sendSuccess(res, 'Subscription plans retrieved successfully', plans, {
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        sendError(res, 500, 'Failed to get subscription plans', error.message);
    }
};

// @desc    Get my gym's subscription plans (Gym Owner)
// @route   GET /api/v1/subscription-plans/my
// @access  Private (Owner)
export const getMyPlans = async (req, res) => {
    try {
        if (!req.user.gymId) {
            return sendError(res, 400, 'Gym ID not found for this user');
        }

        const plans = await SubscriptionPlan.find({
            gymId: req.user.gymId,
            isActive: true
        })
            .populate('gymId', 'name')
            .sort({ createdAt: -1 });

        sendSuccess(res, 'Your subscription plans retrieved successfully', plans);
    } catch (error) {
        sendError(res, 500, 'Failed to get subscription plans', error.message);
    }
};

// @desc    Get single subscription plan
// @route   GET /api/v1/subscription-plans/:id
// @access  Private
export const getPlan = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id)
            .populate('gymId', 'name contact.email branding')
            .populate('createdBy', 'firstName lastName');

        if (!plan) {
            return sendError(res, 404, 'Subscription plan not found');
        }

        // Non-super admins can only view their own gym's plans
        if (req.user.role !== 'super_admin') {
            if (plan.gymId._id.toString() !== req.user.gymId?.toString()) {
                return sendError(res, 403, 'Access denied');
            }
        }

        sendSuccess(res, 'Subscription plan retrieved successfully', plan);
    } catch (error) {
        sendError(res, 500, 'Failed to get subscription plan', error.message);
    }
};

// @desc    Get plan by payment link token (Public)
// @route   GET /api/v1/subscription-plans/link/:token
// @access  Public
export const getPlanByToken = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findOne({
            paymentLinkToken: req.params.token,
            isActive: true
        })
            .populate('gymId', 'name branding contact');

        if (!plan) {
            return sendError(res, 404, 'Payment link not found or expired');
        }

        if (plan.isPaid) {
            return sendError(res, 400, 'This plan has already been paid');
        }

        sendSuccess(res, 'Plan retrieved successfully', plan);
    } catch (error) {
        sendError(res, 500, 'Failed to get plan', error.message);
    }
};

// @desc    Create subscription plan for a gym
// @route   POST /api/v1/subscription-plans
// @access  Private (Super Admin)
export const createPlan = async (req, res) => {
    try {
        const { gymId, name, description, price, duration, features, trialDays } = req.body;

        // Verify gym exists
        const gym = await Gym.findById(gymId);
        if (!gym) {
            return sendError(res, 404, 'Gym not found');
        }

        const plan = await SubscriptionPlan.create({
            gymId,
            name,
            description,
            price,
            duration,
            features,
            trialDays,
            createdBy: req.user._id
        });

        const populated = await SubscriptionPlan.findById(plan._id)
            .populate('gymId', 'name contact.email')
            .populate('createdBy', 'firstName lastName');

        sendCreated(res, 'Subscription plan created successfully', populated);
    } catch (error) {
        sendError(res, 500, 'Failed to create subscription plan', error.message);
    }
};

// @desc    Update subscription plan
// @route   PUT /api/v1/subscription-plans/:id
// @access  Private (Super Admin)
export const updatePlan = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);

        if (!plan) {
            return sendError(res, 404, 'Subscription plan not found');
        }

        // Cannot update paid plans (except to deactivate)
        if (plan.isPaid && !req.body.isActive === false) {
            return sendError(res, 400, 'Cannot modify a paid plan');
        }

        const updated = await SubscriptionPlan.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('gymId', 'name contact.email')
            .populate('createdBy', 'firstName lastName');

        sendSuccess(res, 'Subscription plan updated successfully', updated);
    } catch (error) {
        sendError(res, 500, 'Failed to update subscription plan', error.message);
    }
};

// @desc    Delete subscription plan
// @route   DELETE /api/v1/subscription-plans/:id
// @access  Private (Super Admin)
export const deletePlan = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);

        if (!plan) {
            return sendError(res, 404, 'Subscription plan not found');
        }

        if (plan.isPaid) {
            return sendError(res, 400, 'Cannot delete a paid plan');
        }

        await plan.deleteOne();

        sendSuccess(res, 'Subscription plan deleted successfully');
    } catch (error) {
        sendError(res, 500, 'Failed to delete subscription plan', error.message);
    }
};

// @desc    Regenerate payment link for a plan
// @route   POST /api/v1/subscription-plans/:id/regenerate-link
// @access  Private (Super Admin)
export const regeneratePaymentLink = async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);

        if (!plan) {
            return sendError(res, 404, 'Subscription plan not found');
        }

        if (plan.isPaid) {
            return sendError(res, 400, 'Cannot regenerate link for a paid plan');
        }

        // Generate new token
        const crypto = await import('crypto');
        plan.paymentLinkToken = crypto.randomBytes(32).toString('hex');
        await plan.save();

        sendSuccess(res, 'Payment link regenerated successfully', {
            paymentLink: plan.paymentLink,
            paymentLinkToken: plan.paymentLinkToken
        });
    } catch (error) {
        sendError(res, 500, 'Failed to regenerate payment link', error.message);
    }
};
