import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchExpenses,
    fetchExpenseCategories,
    createExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
    fetchExpenseStats,
    createExpenseCategory
} from '../store/slices/expenseSlice';
import { Plus, Filter, Download, Upload, Check, X, Edit2, Trash2, Eye } from 'lucide-react';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import ConfirmModal from '../components/common/ConfirmModal';

const Expenses = () => {
    const dispatch = useDispatch();
    const { expenses, categories, stats, loading } = useSelector(state => state.expenses);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [filters, setFilters] = useState({
        categoryId: '',
        approvalStatus: '',
        startDate: '',
        endDate: '',
        search: ''
    });
    const [formData, setFormData] = useState({
        amount: '',
        categoryId: '',
        description: '',
        expenseDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        vendor: '',
        notes: ''
    });
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        description: '',
        icon: '💰',
        color: '#3b82f6'
    });
    const [approvalNotes, setApprovalNotes] = useState('');

    useEffect(() => {
        dispatch(fetchExpenses(filters));
        dispatch(fetchExpenseCategories());
        dispatch(fetchExpenseStats(filters));
    }, [dispatch, filters]);

    const handleCreateExpense = async () => {
        try {
            await dispatch(createExpense(formData)).unwrap();
            setShowExpenseModal(false);
            resetForm();
            dispatch(fetchExpenses(filters));
            dispatch(fetchExpenseStats(filters));
        } catch (error) {
            console.error('Failed to create expense:', error);
        }
    };

    const handleUpdateExpense = async () => {
        try {
            await dispatch(updateExpense({ id: selectedExpense._id, data: formData })).unwrap();
            setShowExpenseModal(false);
            resetForm();
            setSelectedExpense(null);
            dispatch(fetchExpenses(filters));
        } catch (error) {
            console.error('Failed to update expense:', error);
        }
    };

    const handleDeleteExpense = async (id) => {
        try {
            await dispatch(deleteExpense(id)).unwrap();
            setConfirmDelete(null);
            dispatch(fetchExpenseStats(filters));
        } catch (error) {
            console.error('Failed to delete expense:', error);
        }
    };

    const handleApprove = async () => {
        try {
            await dispatch(approveExpense({ id: selectedExpense._id, approvalNotes })).unwrap();
            setShowApprovalModal(false);
            setSelectedExpense(null);
            setApprovalNotes('');
            dispatch(fetchExpenseStats(filters));
        } catch (error) {
            console.error('Failed to approve expense:', error);
        }
    };

    const handleReject = async () => {
        try {
            await dispatch(rejectExpense({ id: selectedExpense._id, approvalNotes })).unwrap();
            setShowApprovalModal(false);
            setSelectedExpense(null);
            setApprovalNotes('');
            dispatch(fetchExpenseStats(filters));
        } catch (error) {
            console.error('Failed to reject expense:', error);
        }
    };

    const handleCreateCategory = async () => {
        try {
            await dispatch(createExpenseCategory(categoryFormData)).unwrap();
            setShowCategoryModal(false);
            setCategoryFormData({ name: '', description: '', icon: '💰', color: '#3b82f6' });
        } catch (error) {
            console.error('Failed to create category:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            amount: '',
            categoryId: '',
            description: '',
            expenseDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'cash',
            vendor: '',
            notes: ''
        });
    };

    const openEditModal = (expense) => {
        setSelectedExpense(expense);
        setFormData({
            amount: expense.amount,
            categoryId: expense.categoryId?._id || '',
            description: expense.description,
            expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0],
            paymentMethod: expense.paymentMethod,
            vendor: expense.vendor || '',
            notes: expense.notes || ''
        });
        setShowExpenseModal(true);
    };

    const openApprovalModal = (expense) => {
        setSelectedExpense(expense);
        setShowApprovalModal(true);
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'approved': return 'green';
            case 'rejected': return 'red';
            case 'pending': return 'yellow';
            default: return 'gray';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track and manage gym expenses</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowCategoryModal(true)}>
                        Manage Categories
                    </Button>
                    <Button onClick={() => { resetForm(); setSelectedExpense(null); setShowExpenseModal(true); }}>
                        <Plus size={20} />
                        Add Expense
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(stats.total)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stats.count} transactions</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approvals</h3>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{stats.pendingApprovals}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{categories.length}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Input
                        label="Search"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        placeholder="Description, vendor..."
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <select
                            value={filters.categoryId}
                            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <select
                            value={filters.approvalStatus}
                            onChange={(e) => setFilters({ ...filters, approvalStatus: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <Input
                        label="Start Date"
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                    <Input
                        label="End Date"
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                </div>
            </div>

            {/* Expenses List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Loading...</td>
                            </tr>
                        ) : expenses.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No expenses found</td>
                            </tr>
                        ) : (
                            expenses.map((expense) => (
                                <tr key={expense._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{formatDate(expense.expenseDate)}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{expense.description}</div>
                                        {expense.vendor && <div className="text-xs text-gray-500 dark:text-gray-400">{expense.vendor}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 text-sm">
                                            <span>{expense.categoryId?.icon}</span>
                                            <span className="text-gray-900 dark:text-white">{expense.categoryId?.name}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(expense.amount)}</td>
                                    <td className="px-6 py-4">
                                        <Badge color={getStatusBadgeColor(expense.approvalStatus)}>
                                            {expense.approvalStatus}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {expense.approvalStatus === 'pending' && (
                                                <button
                                                    onClick={() => openApprovalModal(expense)}
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                                    title="Approve/Reject"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openEditModal(expense)}
                                                className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete(expense)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Expense Modal */}
            <Modal
                isOpen={showExpenseModal}
                onClose={() => { setShowExpenseModal(false); setSelectedExpense(null); resetForm(); }}
                title={selectedExpense ? 'Edit Expense' : 'Create Expense'}
            >
                <div className="space-y-4">
                    <Input
                        label="Amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                        <select
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <Input
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                    <Input
                        label="Expense Date"
                        type="date"
                        value={formData.expenseDate}
                        onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                        <select
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        >
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="online">Online</option>
                            <option value="check">Check</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <Input
                        label="Vendor"
                        value={formData.vendor}
                        onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            rows="3"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => { setShowExpenseModal(false); setSelectedExpense(null); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button onClick={selectedExpense ? handleUpdateExpense : handleCreateExpense}>
                            {selectedExpense ? 'Update' : 'Create'} Expense
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Create Category Modal */}
            <Modal
                isOpen={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                title="Create Expense Category"
            >
                <div className="space-y-4">
                    <Input
                        label="Category Name"
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Description"
                        value={categoryFormData.description}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    />
                    <Input
                        label="Icon (emoji)"
                        value={categoryFormData.icon}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                    />
                    <Input
                        label="Color"
                        type="color"
                        value={categoryFormData.color}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
                        <Button onClick={handleCreateCategory}>Create Category</Button>
                    </div>
                </div>
            </Modal>

            {/* Approval Modal */}
            <Modal
                isOpen={showApprovalModal}
                onClose={() => { setShowApprovalModal(false); setSelectedExpense(null); setApprovalNotes(''); }}
                title="Expense Approval"
            >
                {selectedExpense && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedExpense.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
                                <span className="text-sm text-gray-900 dark:text-white">{selectedExpense.categoryId?.icon} {selectedExpense.categoryId?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Description:</span>
                                <span className="text-sm text-gray-900 dark:text-white">{selectedExpense.description}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Approval Notes</label>
                            <textarea
                                value={approvalNotes}
                                onChange={(e) => setApprovalNotes(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                rows="3"
                                placeholder="Add notes for approval/rejection..."
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => { setShowApprovalModal(false); setSelectedExpense(null); setApprovalNotes(''); }}>
                                Cancel
                            </Button>
                            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={handleReject}>
                                <X size={16} />
                                Reject
                            </Button>
                            <Button onClick={handleApprove}>
                                <Check size={16} />
                                Approve
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation */}
            {confirmDelete && (
                <ConfirmModal
                    isOpen={!!confirmDelete}
                    onClose={() => setConfirmDelete(null)}
                    onConfirm={() => handleDeleteExpense(confirmDelete._id)}
                    title="Delete Expense"
                    message={`Are you sure you want to delete this expense: "${confirmDelete.description}"? This action cannot be undone.`}
                    confirmText="Delete"
                    confirmVariant="danger"
                />
            )}
        </div>
    );
};

export default Expenses;
