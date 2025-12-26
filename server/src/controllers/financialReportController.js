import Expense from '../models/Expense.js';
import Revenue from '../models/Revenue.js';
import Payment from '../models/Payment.js';

// Get profit & loss report
export const getProfitLossReport = async (req, res) => {
    try {
        const { startDate, endDate, period = 'monthly' } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Query for expenses (only approved)
        const expenseQuery = {
            gymId: req.gymId,
            isDeleted: false,
            approvalStatus: 'approved',
            expenseDate: { $gte: start, $lte: end }
        };

        // Query for revenues
        const revenueQuery = {
            gymId: req.gymId,
            isDeleted: false,
            revenueDate: { $gte: start, $lte: end }
        };

        // Get total expenses
        const totalExpensesData = await Expense.aggregate([
            { $match: expenseQuery },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Get total revenues
        const totalRevenuesData = await Revenue.aggregate([
            { $match: revenueQuery },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Also include membership payments as revenue
        const paymentQuery = {
            gymId: req.gymId,
            status: 'completed',
            paidAt: { $gte: start, $lte: end }
        };

        const totalPaymentsData = await Payment.aggregate([
            { $match: paymentQuery },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalExpenses = totalExpensesData.length > 0 ? totalExpensesData[0].total : 0;
        const totalRevenues = totalRevenuesData.length > 0 ? totalRevenuesData[0].total : 0;
        const totalPayments = totalPaymentsData.length > 0 ? totalPaymentsData[0].total : 0;
        const totalIncome = totalRevenues + totalPayments;
        const netProfit = totalIncome - totalExpenses;

        // Get period-wise breakdown
        let groupBy;
        switch (period) {
            case 'daily':
                groupBy = {
                    year: { $year: '$expenseDate' },
                    month: { $month: '$expenseDate' },
                    day: { $dayOfMonth: '$expenseDate' }
                };
                break;
            case 'weekly':
                groupBy = {
                    year: { $year: '$expenseDate' },
                    week: { $week: '$expenseDate' }
                };
                break;
            case 'monthly':
            default:
                groupBy = {
                    year: { $year: '$expenseDate' },
                    month: { $month: '$expenseDate' }
                };
                break;
        }

        // Expenses by period
        const expensesByPeriod = await Expense.aggregate([
            { $match: expenseQuery },
            {
                $group: {
                    _id: groupBy,
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
        ]);

        // Revenues by period (adjust groupBy for revenue collection)
        const revenueGroupBy = JSON.parse(JSON.stringify(groupBy).replace(/expenseDate/g, 'revenueDate'));
        const revenuesByPeriod = await Revenue.aggregate([
            { $match: revenueQuery },
            {
                $group: {
                    _id: revenueGroupBy,
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
        ]);

        // Payments by period
        const paymentGroupBy = JSON.parse(JSON.stringify(groupBy).replace(/expenseDate/g, 'paidAt'));
        const paymentsByPeriod = await Payment.aggregate([
            { $match: paymentQuery },
            {
                $group: {
                    _id: paymentGroupBy,
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
        ]);

        res.json({
            success: true,
            data: {
                summary: {
                    totalIncome,
                    totalExpenses,
                    netProfit,
                    profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0
                },
                breakdown: {
                    membershipRevenue: totalPayments,
                    otherRevenue: totalRevenues,
                    expenses: totalExpenses
                },
                trends: {
                    expenses: expensesByPeriod,
                    revenues: revenuesByPeriod,
                    payments: paymentsByPeriod
                }
            }
        });
    } catch (error) {
        console.error('Error generating P&L report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate profit & loss report',
            error: error.message
        });
    }
};

// Get expense trends
export const getExpenseTrends = async (req, res) => {
    try {
        const { startDate, endDate, period = 'monthly' } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const query = {
            gymId: req.gymId,
            isDeleted: false,
            approvalStatus: 'approved',
            expenseDate: { $gte: start, $lte: end }
        };

        let groupBy;
        switch (period) {
            case 'daily':
                groupBy = {
                    year: { $year: '$expenseDate' },
                    month: { $month: '$expenseDate' },
                    day: { $dayOfMonth: '$expenseDate' }
                };
                break;
            case 'weekly':
                groupBy = {
                    year: { $year: '$expenseDate' },
                    week: { $week: '$expenseDate' }
                };
                break;
            case 'monthly':
            default:
                groupBy = {
                    year: { $year: '$expenseDate' },
                    month: { $month: '$expenseDate' }
                };
                break;
        }

        const trends = await Expense.aggregate([
            { $match: query },
            {
                $group: {
                    _id: groupBy,
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                    average: { $avg: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
        ]);

        res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        console.error('Error fetching expense trends:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch expense trends',
            error: error.message
        });
    }
};

// Get revenue trends
export const getRevenueTrends = async (req, res) => {
    try {
        const { startDate, endDate, period = 'monthly' } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const query = {
            gymId: req.gymId,
            isDeleted: false,
            revenueDate: { $gte: start, $lte: end }
        };

        let groupBy;
        switch (period) {
            case 'daily':
                groupBy = {
                    year: { $year: '$revenueDate' },
                    month: { $month: '$revenueDate' },
                    day: { $dayOfMonth: '$revenueDate' }
                };
                break;
            case 'weekly':
                groupBy = {
                    year: { $year: '$revenueDate' },
                    week: { $week: '$revenueDate' }
                };
                break;
            case 'monthly':
            default:
                groupBy = {
                    year: { $year: '$revenueDate' },
                    month: { $month: '$revenueDate' }
                };
                break;
        }

        const trends = await Revenue.aggregate([
            { $match: query },
            {
                $group: {
                    _id: groupBy,
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                    average: { $avg: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
        ]);

        res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        console.error('Error fetching revenue trends:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch revenue trends',
            error: error.message
        });
    }
};

// Get expense category breakdown
export const getCategoryBreakdown = async (req, res) => {
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

        const breakdown = await Expense.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$categoryId',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                    average: { $avg: '$amount' }
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
                    count: 1,
                    average: 1
                }
            },
            { $sort: { total: -1 } }
        ]);

        res.json({
            success: true,
            data: breakdown
        });
    } catch (error) {
        console.error('Error fetching category breakdown:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category breakdown',
            error: error.message
        });
    }
};

// Get financial summary (dashboard widget)
export const getFinancialSummary = async (req, res) => {
    try {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Current month expenses
        const currentMonthExpenses = await Expense.aggregate([
            {
                $match: {
                    gymId: req.gymId,
                    isDeleted: false,
                    approvalStatus: 'approved',
                    expenseDate: { $gte: currentMonthStart, $lte: currentMonthEnd }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Last month expenses
        const lastMonthExpenses = await Expense.aggregate([
            {
                $match: {
                    gymId: req.gymId,
                    isDeleted: false,
                    approvalStatus: 'approved',
                    expenseDate: { $gte: lastMonthStart, $lte: lastMonthEnd }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Current month revenue
        const currentMonthRevenue = await Revenue.aggregate([
            {
                $match: {
                    gymId: req.gymId,
                    isDeleted: false,
                    revenueDate: { $gte: currentMonthStart, $lte: currentMonthEnd }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Current month payments
        const currentMonthPayments = await Payment.aggregate([
            {
                $match: {
                    gymId: req.gymId,
                    status: 'completed',
                    paidAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const currentExpenses = currentMonthExpenses.length > 0 ? currentMonthExpenses[0].total : 0;
        const lastExpenses = lastMonthExpenses.length > 0 ? lastMonthExpenses[0].total : 0;
        const currentRevenue = currentMonthRevenue.length > 0 ? currentMonthRevenue[0].total : 0;
        const currentPayments = currentMonthPayments.length > 0 ? currentMonthPayments[0].total : 0;
        const currentIncome = currentRevenue + currentPayments;
        const currentProfit = currentIncome - currentExpenses;

        // Calculate percentage changes
        const expenseChange = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses * 100).toFixed(2) : 0;

        // Pending approvals
        const pendingApprovals = await Expense.countDocuments({
            gymId: req.gymId,
            isDeleted: false,
            approvalStatus: 'pending'
        });

        res.json({
            success: true,
            data: {
                currentMonth: {
                    income: currentIncome,
                    expenses: currentExpenses,
                    profit: currentProfit,
                    profitMargin: currentIncome > 0 ? ((currentProfit / currentIncome) * 100).toFixed(2) : 0
                },
                trends: {
                    expenseChange: parseFloat(expenseChange)
                },
                pendingApprovals
            }
        });
    } catch (error) {
        console.error('Error fetching financial summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch financial summary',
            error: error.message
        });
    }
};
