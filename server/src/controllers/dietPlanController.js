import DietPlan from '../models/DietPlan.js';
import Member from '../models/Member.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';
import mongoose from 'mongoose';

// @desc    Get all diet plans for a gym
// @route   GET /api/v1/diet-plans
// @access  Private (Owner/Staff)
export const getDietPlans = async (req, res) => {
    try {
        const plans = await DietPlan.find({ gymId: req.gymId || req.user.gymId }).sort({ createdAt: -1 });
        sendSuccess(res, 'Diet plans retrieved successfully', plans);
    } catch (error) {
        sendError(res, 500, 'Failed to get diet plans', error.message);
    }
};

// @desc    Get a single diet plan
// @route   GET /api/v1/diet-plans/:id
// @access  Private (Owner/Staff)
export const getDietPlan = async (req, res) => {
    try {
        const plan = await DietPlan.findOne({ _id: req.params.id, gymId: req.gymId || req.user.gymId });
        if (!plan) {
            return sendError(res, 404, 'Diet plan not found');
        }
        sendSuccess(res, 'Diet plan retrieved successfully', plan);
    } catch (error) {
        sendError(res, 500, 'Failed to get diet plan', error.message);
    }
};

// @desc    Create a diet plan
// @route   POST /api/v1/diet-plans
// @access  Private (Owner/Staff)
export const createDietPlan = async (req, res) => {
    try {
        const planData = {
            ...req.body,
            gymId: req.gymId || req.user.gymId,
            createdBy: req.user._id
        };

        const plan = await DietPlan.create(planData);
        sendCreated(res, 'Diet plan created successfully', plan);
    } catch (error) {
        sendError(res, 500, 'Failed to create diet plan', error.message);
    }
};

// @desc    Update a diet plan
// @route   PUT /api/v1/diet-plans/:id
// @access  Private (Owner/Staff)
export const updateDietPlan = async (req, res) => {
    try {
        const plan = await DietPlan.findOneAndUpdate(
            { _id: req.params.id, gymId: req.gymId || req.user.gymId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!plan) {
            return sendError(res, 404, 'Diet plan not found');
        }

        // Handle isDefault logic
        if (req.body.isDefault === true) {
            await DietPlan.updateMany(
                { gymId: req.gymId || req.user.gymId, _id: { $ne: plan._id } },
                { $set: { isDefault: false } }
            );
        }

        sendSuccess(res, 'Diet plan updated successfully', plan);
    } catch (error) {
        sendError(res, 500, 'Failed to update diet plan', error.message);
    }
};

// @desc    Delete a diet plan
// @route   DELETE /api/v1/diet-plans/:id
// @access  Private (Owner/Staff)
export const deleteDietPlan = async (req, res) => {
    try {
        const plan = await DietPlan.findOne({ _id: req.params.id, gymId: req.gymId || req.user.gymId });

        if (!plan) {
            return sendError(res, 404, 'Diet plan not found');
        }

        // Unassign this plan from any members who have it
        await Member.updateMany(
            { gymId: req.gymId || req.user.gymId, assignedDietPlan: plan._id },
            { $unset: { assignedDietPlan: 1 } }
        );

        await plan.deleteOne();
        sendSuccess(res, 'Diet plan deleted successfully');
    } catch (error) {
        sendError(res, 500, 'Failed to delete diet plan', error.message);
    }
};

// @desc    Assign a diet plan to members
// @route   POST /api/v1/diet-plans/:id/assign
// @access  Private (Owner/Staff)
export const assignDietPlan = async (req, res) => {
    try {
        const { memberIds } = req.body;

        if (!memberIds || !Array.isArray(memberIds)) {
            return sendError(res, 400, 'Please provide an array of memberIds');
        }

        const plan = await DietPlan.findOne({ _id: req.params.id, gymId: req.gymId || req.user.gymId });
        if (!plan) {
            return sendError(res, 404, 'Diet plan not found');
        }

        await Member.updateMany(
            { _id: { $in: memberIds }, gymId: req.gymId || req.user.gymId },
            { $set: { assignedDietPlan: plan._id } }
        );

        sendSuccess(res, 'Diet plan assigned successfully');
    } catch (error) {
        sendError(res, 500, 'Failed to assign diet plan', error.message);
    }
};

// @desc    Get the assigned or default diet plan for the logged in member
// @route   GET /api/v1/diet-plans/my-plan
// @access  Private (Member)
export const getMyDietPlan = async (req, res) => {
    try {
        const member = await Member.findOne({ userId: req.user._id, gymId: req.gymId || req.user.gymId });
        if (!member) {
            return sendError(res, 404, 'Member record not found');
        }

        let plan = null;

        if (member.assignedDietPlan) {
            plan = await DietPlan.findById(member.assignedDietPlan);
        }

        if (!plan) {
            plan = await DietPlan.findOne({ gymId: req.gymId || req.user.gymId, isDefault: true });
        }

        if (!plan) {
            return sendSuccess(res, 'No diet plan assigned', null);
        }

        sendSuccess(res, 'Diet plan retrieved successfully', plan);
    } catch (error) {
        sendError(res, 500, 'Failed to get my diet plan', error.message);
    }
};
