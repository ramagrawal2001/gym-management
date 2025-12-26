import Expense from '../models/Expense.js';
import ExpenseCategory from '../models/ExpenseCategory.js';

// Get all expenses with filters
export const getExpenses = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            startDate,
            endDate,
            categoryId,
            approvalStatus,
            search
        } = req.query;

        const query = {
            gymId: req.gymId,
            isDeleted: false
        };

        // Date range filter
        if (startDate || endDate) {
            query.expenseDate = {};
            if (startDate) query.expenseDate.$gte = new Date(startDate);
            if (endDate) query.expenseDate.$lte = new Date(endDate);
        }

        // Category filter
        if (categoryId) {
            query.categoryId = categoryId;
        }

        // Approval status filter
        if (approvalStatus) {
            query.approvalStatus = approvalStatus;
        }

        // Search filter
        if (search) {
            query.$or = [
                { description: { $regex: search, $options: 'i' } },
                { vendor: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const expenses = await Expense.find(query)
            .populate('categoryId', 'name icon color')
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .sort({ expenseDate: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Expense.countDocuments(query);

        res.json({
            success: true,
            data: expenses,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expenses',
            error: error.message
        });
    }
};

// Get single expense
export const getExpense = async (req, res) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            gymId: req.gymId,
            isDeleted: false
        })
            .populate('categoryId', 'name icon color')
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email');

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.json({
            success: true,
            data: expense
        });
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expense',
            error: error.message
        });
    }
};

// Create expense
export const createExpense = async (req, res) => {
    try {
        const {
            amount,
            categoryId,
            description,
            expenseDate,
            paymentMethod,
            vendor,
            receiptUrl,
            notes
        } = req.body;

        // Verify category exists and belongs to gym
        const category = await ExpenseCategory.findOne({
            _id: categoryId,
            gymId: req.gymId
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Expense category not found'
            });
        }

        const expense = await Expense.create({
            amount,
            categoryId,
            description,
            expenseDate: expenseDate || Date.now(),
            paymentMethod,
            vendor,
            receiptUrl,
            notes,
            gymId: req.gymId,
            createdBy: req.user._id,
            approvalStatus: 'pending'
        });

        const populatedExpense = await Expense.findById(expense._id)
            .populate('categoryId', 'name icon color')
            .populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            data: populatedExpense
        });
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create expense',
            error: error.message
        });
    }
};

// Update expense
export const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            gymId: req.gymId,
            isDeleted: false
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Only allow update if pending or if user is owner/super admin
        if (expense.approvalStatus !== 'pending' && !['owner', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Cannot update approved/rejected expense'
            });
        }

        const {
            amount,
            categoryId,
            description,
            expenseDate,
            paymentMethod,
            vendor,
            receiptUrl,
            notes
        } = req.body;

        // Verify category if changed
        if (categoryId && categoryId !== expense.categoryId.toString()) {
            const category = await ExpenseCategory.findOne({
                _id: categoryId,
                gymId: req.gymId
            });

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Expense category not found'
                });
            }
        }

        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            {
                amount,
                categoryId,
                description,
                expenseDate,
                paymentMethod,
                vendor,
                receiptUrl,
                notes
            },
            { new: true, runValidators: true }
        )
            .populate('categoryId', 'name icon color')
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email');

        res.json({
            success: true,
            message: 'Expense updated successfully',
            data: updatedExpense
        });
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update expense',
            error: error.message
        });
    }
};

// Delete expense (soft delete)
export const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, gymId: req.gymId, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete expense',
            error: error.message
        });
    }
};

// Approve expense
export const approveExpense = async (req, res) => {
    try {
        const { approvalNotes } = req.body;

        const expense = await Expense.findOne({
            _id: req.params.id,
            gymId: req.gymId,
            isDeleted: false
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        if (expense.approvalStatus === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Expense is already approved'
            });
        }

        expense.approvalStatus = 'approved';
        expense.approvedBy = req.user._id;
        expense.approvalNotes = approvalNotes;
        expense.approvedAt = new Date();

        await expense.save();

        const updatedExpense = await Expense.findById(expense._id)
            .populate('categoryId', 'name icon color')
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email');

        res.json({
            success: true,
            message: 'Expense approved successfully',
            data: updatedExpense
        });
    } catch (error) {
        console.error('Error approving expense:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve expense',
            error: error.message
        });
    }
};

// Reject expense
export const rejectExpense = async (req, res) => {
    try {
        const { approvalNotes } = req.body;

        if (!approvalNotes) {
            return res.status(400).json({
                success: false,
                message: 'Rejection notes are required'
            });
        }

        const expense = await Expense.findOne({
            _id: req.params.id,
            gymId: req.gymId,
            isDeleted: false
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        if (expense.approvalStatus === 'rejected') {
            return res.status(400).json({
                success: false,
                message: 'Expense is already rejected'
            });
        }

        expense.approvalStatus = 'rejected';
        expense.approvedBy = req.user._id;
        expense.approvalNotes = approvalNotes;
        expense.approvedAt = new Date();

        await expense.save();

        const updatedExpense = await Expense.findById(expense._id)
            .populate('categoryId', 'name icon color')
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email');

        res.json({
            success: true,
            message: 'Expense rejected successfully',
            data: updatedExpense
        });
    } catch (error) {
        console.error('Error rejecting expense:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject expense',
            error: error.message
        });
    }
};

// Get expense statistics
export const getExpenseStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const query = {
            gymId: req.gymId,
            isDeleted: false,
            approvalStatus: 'approved'
        };

        if (startDate || endDate) {
            query.expenseDate = {};
            if (startDate) query.expenseDate.$gte = new Date(startDate);
            if (endDate) query.expenseDate.$lte = new Date(endDate);
        }

        // Total expenses
        const totalExpenses = await Expense.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        // Expenses by category
        const expensesByCategory = await Expense.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$categoryId',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'expensecategories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $project: {
                    categoryName: '$category.name',
                    categoryIcon: '$category.icon',
                    categoryColor: '$category.color',
                    total: 1,
                    count: 1
                }
            },
            { $sort: { total: -1 } }
        ]);

        // Pending approvals count
        const pendingCount = await Expense.countDocuments({
            gymId: req.gymId,
            isDeleted: false,
            approvalStatus: 'pending'
        });

        res.json({
            success: true,
            data: {
                total: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
                count: totalExpenses.length > 0 ? totalExpenses[0].count : 0,
                byCategory: expensesByCategory,
                pendingApprovals: pendingCount
            }
        });
    } catch (error) {
        console.error('Error fetching expense stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expense statistics',
            error: error.message
        });
    }
};

// Export expenses to CSV
export const exportExpenses = async (req, res) => {
    try {
        const { startDate, endDate, categoryId, approvalStatus } = req.query;

        const query = {
            gymId: req.gymId,
            isDeleted: false
        };

        if (startDate || endDate) {
            query.expenseDate = {};
            if (startDate) query.expenseDate.$gte = new Date(startDate);
            if (endDate) query.expenseDate.$lte = new Date(endDate);
        }

        if (categoryId) query.categoryId = categoryId;
        if (approvalStatus) query.approvalStatus = approvalStatus;

        const expenses = await Expense.find(query)
            .populate('categoryId', 'name')
            .populate('createdBy', 'name')
            .populate('approvedBy', 'name')
            .sort({ expenseDate: -1 });

        // Generate CSV
        const headers = [
            'Date',
            'Amount',
            'Category',
            'Description',
            'Vendor',
            'Payment Method',
            'Status',
            'Created By',
            'Approved By',
            'Approval Date',
            'Notes'
        ];

        const rows = expenses.map(exp => [
            new Date(exp.expenseDate).toLocaleDateString(),
            exp.amount,
            exp.categoryId?.name || '',
            exp.description,
            exp.vendor || '',
            exp.paymentMethod,
            exp.approvalStatus,
            exp.createdBy?.name || '',
            exp.approvedBy?.name || '',
            exp.approvedAt ? new Date(exp.approvedAt).toLocaleDateString() : '',
            exp.notes || ''
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=expenses_${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting expenses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export expenses',
            error: error.message
        });
    }
};

// Import expenses from CSV
export const importExpenses = async (req, res) => {
    try {
        // This is a placeholder - actual CSV parsing would require a library like csv-parser
        // For now, we'll accept JSON array in request body
        const { expenses } = req.body;

        if (!Array.isArray(expenses) || expenses.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid expenses data. Expected an array of expenses.'
            });
        }

        const imported = [];
        const errors = [];

        for (let i = 0; i < expenses.length; i++) {
            try {
                const expenseData = expenses[i];

                // Verify category exists
                const category = await ExpenseCategory.findOne({
                    name: expenseData.category,
                    gymId: req.gymId
                });

                if (!category) {
                    errors.push({
                        row: i + 1,
                        error: `Category "${expenseData.category}" not found`
                    });
                    continue;
                }

                const expense = await Expense.create({
                    amount: expenseData.amount,
                    categoryId: category._id,
                    description: expenseData.description,
                    expenseDate: new Date(expenseData.date),
                    paymentMethod: expenseData.paymentMethod || 'cash',
                    vendor: expenseData.vendor,
                    notes: expenseData.notes,
                    gymId: req.gymId,
                    createdBy: req.user._id,
                    approvalStatus: 'pending'
                });

                imported.push(expense);
            } catch (error) {
                errors.push({
                    row: i + 1,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Imported ${imported.length} expenses. ${errors.length} errors.`,
            data: {
                imported: imported.length,
                errors: errors
            }
        });
    } catch (error) {
        console.error('Error importing expenses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to import expenses',
            error: error.message
        });
    }
};
