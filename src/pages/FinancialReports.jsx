import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchProfitLossReport,
    fetchExpenseTrends,
    fetchRevenueTrends,
    fetchCategoryBreakdown
} from '../store/slices/financialReportSlice';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../utils/formatCurrency';
import Input from '../components/common/Input';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const FinancialReports = () => {
    const dispatch = useDispatch();
    const { profitLoss, expenseTrends, revenueTrends, categoryBreakdown, loading } = useSelector(state => state.financialReports);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        period: 'monthly'
    });

    useEffect(() => {
        if (dateRange.startDate && dateRange.endDate) {
            dispatch(fetchProfitLossReport(dateRange));
            dispatch(fetchExpenseTrends(dateRange));
            dispatch(fetchRevenueTrends(dateRange));
            dispatch(fetchCategoryBreakdown({ startDate: dateRange.startDate, endDate: dateRange.endDate }));
        }
    }, [dispatch, dateRange]);

    const formatPeriodLabel = (item) => {
        if (item._id.day) return `${item._id.month}/${item._id.day}`;
        if (item._id.week) return `Week ${item._id.week}`;
        return `${item._id.month}/${item._id.year}`;
    };

    // Prepare chart data
    const trendsData = expenseTrends.map((expense, idx) => ({
        period: formatPeriodLabel(expense),
        expenses: expense.total,
        revenue: revenueTrends[idx]?.total || 0
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive financial analytics and P&L reports</p>
                </div>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="Start Date"
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    />
                    <Input
                        label="End Date"
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period</label>
                        <select
                            value={dateRange.period}
                            onChange={(e) => setDateRange({ ...dateRange, period: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* P&L Summary Cards */}
            {profitLoss && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</h3>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{formatCurrency(profitLoss.summary.totalIncome)}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</h3>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">{formatCurrency(profitLoss.summary.totalExpenses)}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Profit</h3>
                        <p className={`text-2xl font-bold mt-2 ${profitLoss.summary.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(profitLoss.summary.netProfit)}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit Margin</h3>
                        <p className={`text-2xl font-bold mt-2 ${profitLoss.summary.profitMargin >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {profitLoss.summary.profitMargin}%
                        </p>
                    </div>
                </div>
            )}

            {/* Revenue vs Expenses Trend */}
            {trendsData.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue vs Expenses Trend</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={trendsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="period" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px' }}
                                labelStyle={{ color: '#f3f4f6' }}
                            />
                            <Legend />
                            <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Category Breakdown */}
            {categoryBreakdown.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expense by Category</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryBreakdown}
                                    dataKey="total"
                                    nameKey="categoryName"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={(entry) => `${entry.categoryName}: ${formatCurrency(entry.total)}`}
                                >
                                    {categoryBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown</h2>
                        <div className="space-y-3">
                            {categoryBreakdown.map((cat, idx) => (
                                <div key={cat._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{cat.categoryIcon}</span>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{cat.categoryName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{cat.count} transactions</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(cat.total)}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Avg: {formatCurrency(cat.average)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">Loading financial reports...</p>
                </div>
            )}
        </div>
    );
};

export default FinancialReports;
