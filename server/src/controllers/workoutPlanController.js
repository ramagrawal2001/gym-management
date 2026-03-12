import WorkoutPlan from '../models/WorkoutPlan.js';
import Member from '../models/Member.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';
import mongoose from 'mongoose';

// @desc    Get all workout plans for a gym
// @route   GET /api/v1/workout-plans
// @access  Private (Owner/Staff)
export const getWorkoutPlans = async (req, res) => {
    try {
        const plans = await WorkoutPlan.find({ gymId: req.gymId || req.user.gymId }).sort({ createdAt: -1 });
        sendSuccess(res, 'Workout plans retrieved successfully', plans);
    } catch (error) {
        sendError(res, 500, 'Failed to get workout plans', error.message);
    }
};

// @desc    Get a single workout plan
// @route   GET /api/v1/workout-plans/:id
// @access  Private (Owner/Staff)
export const getWorkoutPlan = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findOne({ _id: req.params.id, gymId: req.gymId || req.user.gymId });
        if (!plan) {
            return sendError(res, 404, 'Workout plan not found');
        }
        sendSuccess(res, 'Workout plan retrieved successfully', plan);
    } catch (error) {
        sendError(res, 500, 'Failed to get workout plan', error.message);
    }
};

// @desc    Create a workout plan
// @route   POST /api/v1/workout-plans
// @access  Private (Owner/Staff)
export const createWorkoutPlan = async (req, res) => {
    try {
        const planData = {
            ...req.body,
            gymId: req.gymId || req.user.gymId,
            createdBy: req.user._id
        };

        const plan = await WorkoutPlan.create(planData);
        sendCreated(res, 'Workout plan created successfully', plan);
    } catch (error) {
        sendError(res, 500, 'Failed to create workout plan', error.message);
    }
};

// @desc    Update a workout plan
// @route   PUT /api/v1/workout-plans/:id
// @access  Private (Owner/Staff)
export const updateWorkoutPlan = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findOneAndUpdate(
            { _id: req.params.id, gymId: req.gymId || req.user.gymId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!plan) {
            return sendError(res, 404, 'Workout plan not found');
        }

        // If it was modified to be default, the pre-save hook won't run on findOneAndUpdate
        // So we handle it manually here:
        if (req.body.isDefault === true) {
            await WorkoutPlan.updateMany(
                { gymId: req.gymId || req.user.gymId, _id: { $ne: plan._id } },
                { $set: { isDefault: false } }
            );
        }

        sendSuccess(res, 'Workout plan updated successfully', plan);
    } catch (error) {
        sendError(res, 500, 'Failed to update workout plan', error.message);
    }
};

// @desc    Delete a workout plan
// @route   DELETE /api/v1/workout-plans/:id
// @access  Private (Owner/Staff)
export const deleteWorkoutPlan = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findOne({ _id: req.params.id, gymId: req.gymId || req.user.gymId });

        if (!plan) {
            return sendError(res, 404, 'Workout plan not found');
        }

        // Unassign this plan from any members who have it
        await Member.updateMany(
            { gymId: req.gymId || req.user.gymId, assignedWorkoutPlan: plan._id },
            { $unset: { assignedWorkoutPlan: 1 } }
        );

        await plan.deleteOne();
        sendSuccess(res, 'Workout plan deleted successfully');
    } catch (error) {
        sendError(res, 500, 'Failed to delete workout plan', error.message);
    }
};

// @desc    Assign a workout plan to members
// @route   POST /api/v1/workout-plans/:id/assign
// @access  Private (Owner/Staff)
export const assignWorkoutPlan = async (req, res) => {
    try {
        const { memberIds } = req.body;

        if (!memberIds || !Array.isArray(memberIds)) {
            return sendError(res, 400, 'Please provide an array of memberIds');
        }

        const plan = await WorkoutPlan.findOne({ _id: req.params.id, gymId: req.gymId || req.user.gymId });
        if (!plan) {
            return sendError(res, 404, 'Workout plan not found');
        }

        await Member.updateMany(
            { _id: { $in: memberIds }, gymId: req.gymId || req.user.gymId },
            { $set: { assignedWorkoutPlan: plan._id } }
        );

        sendSuccess(res, 'Workout plan assigned successfully');
    } catch (error) {
        sendError(res, 500, 'Failed to assign workout plan', error.message);
    }
};

// @desc    Get the assigned or default workout plan for the logged in member
// @route   GET /api/v1/workout-plans/my-plan
// @access  Private (Member)
export const getMyWorkoutPlan = async (req, res) => {
    try {
        // Find the member record
        const member = await Member.findOne({ userId: req.user._id, gymId: req.gymId || req.user.gymId });
        if (!member) {
            return sendError(res, 404, 'Member record not found');
        }

        let plan = null;

        // Check if member has a specifically assigned plan
        if (member.assignedWorkoutPlan) {
            plan = await WorkoutPlan.findById(member.assignedWorkoutPlan);
        }

        // Fallback to default plan
        if (!plan) {
            plan = await WorkoutPlan.findOne({ gymId: req.gymId || req.user.gymId, isDefault: true });
        }

        if (!plan) {
            // Send empty object instead of 404 so UI can handle it gracefully
            return sendSuccess(res, 'No workout plan assigned', null);
        }

        sendSuccess(res, 'Workout plan retrieved successfully', plan);
    } catch (error) {
        sendError(res, 500, 'Failed to get my workout plan', error.message);
    }
};
