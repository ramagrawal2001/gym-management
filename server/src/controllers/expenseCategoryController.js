import ExpenseCategory from '../models/ExpenseCategory.js';

// Get all expense categories for a gym
export const getExpenseCategories = async (req, res) => {
    try {
        const categories = await ExpenseCategory.find({
            gymId: req.gymId,
            isActive: true
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching expense categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expense categories',
            error: error.message
        });
    }
};

// Get single expense category
export const getExpenseCategory = async (req, res) => {
    try {
        const category = await ExpenseCategory.findOne({
            _id: req.params.id,
            gymId: req.gymId
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Expense category not found'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error fetching expense category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expense category',
            error: error.message
        });
    }
};

// Create expense category
export const createExpenseCategory = async (req, res) => {
    try {
        const { name, description, icon, color } = req.body;

        const category = await ExpenseCategory.create({
            name,
            description,
            icon,
            color,
            gymId: req.gymId
        });

        res.status(201).json({
            success: true,
            message: 'Expense category created successfully',
            data: category
        });
    } catch (error) {
        console.error('Error creating expense category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create expense category',
            error: error.message
        });
    }
};

// Update expense category
export const updateExpenseCategory = async (req, res) => {
    try {
        const { name, description, icon, color, isActive } = req.body;

        const category = await ExpenseCategory.findOneAndUpdate(
            { _id: req.params.id, gymId: req.gymId },
            { name, description, icon, color, isActive },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Expense category not found'
            });
        }

        res.json({
            success: true,
            message: 'Expense category updated successfully',
            data: category
        });
    } catch (error) {
        console.error('Error updating expense category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update expense category',
            error: error.message
        });
    }
};

// Delete expense category
export const deleteExpenseCategory = async (req, res) => {
    try {
        // Check if category is used in any expenses
        const Expense = (await import('../models/Expense.js')).default;
        const expenseCount = await Expense.countDocuments({
            categoryId: req.params.id,
            gymId: req.gymId,
            isDeleted: false
        });

        if (expenseCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. It is used in ${expenseCount} expense(s). Please reassign expenses to another category first.`
            });
        }

        const category = await ExpenseCategory.findOneAndDelete({
            _id: req.params.id,
            gymId: req.gymId
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Expense category not found'
            });
        }

        res.json({
            success: true,
            message: 'Expense category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting expense category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete expense category',
            error: error.message
        });
    }
};
