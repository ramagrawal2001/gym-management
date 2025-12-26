import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchRevenues,
    createRevenue,
    updateRevenue,
    deleteRevenue,
    fetchRevenueStats
} from '../store/slices/revenueSlice';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import ConfirmModal from '../components/common/ConfirmModal';

const Revenue = () => {
    const dispatch = useDispatch();
    const { revenues, stats, loading } = useSelector(state => state.revenues);
    const [showModal, setShowModal] = useState(false);
    const [selectedRevenue, setSelectedRevenue] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [filters, setFilters] = useState({
        source: '',
        startDate: '',
        endDate: '',
        search: ''
    });
    const [formData, setFormData] = useState({
        amount: '',
        source: 'other',
        description: '',
        revenueDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    useEffect(() => {
        dispatch(fetchRevenues(filters));
        dispatch(fetchRevenueStats(filters));
    }, [dispatch, filters]);

    const handleCreate = async () => {
        try {
            await dispatch(createRevenue(formData)).unwrap();
            setShowModal(false);
            resetForm();
            dispatch(fetchRevenues(filters));
            dispatch(fetchRevenueStats(filters));
        } catch (error) {
            console.error('Failed to create revenue:', error);
        }
    };

    const handleUpdate = async () => {
        try {
            await dispatch(updateRevenue({ id: selectedRevenue._id, data: formData })).unwrap();
            setShowModal(false);
            resetForm();
            setSelectedRevenue(null);
        } catch (error) {
            console.error('Failed to update revenue:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteRevenue(id)).unwrap();
            setConfirmDelete(null);
            dispatch(fetchRevenueStats(filters));
        } catch (error) {
            console.error('Failed to delete revenue:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            amount: '',
            source: 'other',
            description: '',
            revenueDate: new Date().toISOString().split('T')[0],
            notes: ''
        });
    };

    const openEditModal = (revenue) => {
        setSelectedRevenue(revenue);
        setFormData({
            amount: revenue.amount,
            source: revenue.source,
            description: revenue.description,
            revenueDate: new Date(revenue.revenueDate).toISOString().split('T')[0],
            notes: revenue.notes || ''
        });
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track additional revenue sources</p>
                </div>
                <Button onClick={() => { resetForm(); setSelectedRevenue(null); setShowModal(true); }}>
                    <Plus size={20} />
                    Add Revenue
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</h3>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{formatCurrency(stats.total)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stats.count} entries</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">By Source</h3>
                        <div className="mt-2 space-y-1">
                            {stats.bySource?.map(source => (
                                <div key={source._id} className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400 capitalize">{source._id.replace('_', ' ')}</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(source.total)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                        label="Search"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        placeholder="Description..."
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source</label>
                        <select
                            value={filters.source}
                            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        >
                            <option value="">All Sources</option>
                            <option value="membership">Membership</option>
                            <option value="pos_sale">POS Sale</option>
                            <option value="personal_training">Personal Training</option>
                            <option value="merchandise">Merchandise</option>
                            <option value="classes">Classes</option>
                            <option value="other">Other</option>
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

            {/* Revenue List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Loading...</td>
                            </tr>
                        ) : revenues.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No revenues found</td>
                            </tr>
                        ) : (
                            revenues.map((revenue) => (
                                <tr key={revenue._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{formatDate(revenue.revenueDate)}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{revenue.description}</div>
                                        {revenue.notes && <div className="text-xs text-gray-500 dark:text-gray-400">{revenue.notes}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{revenue.source.replace('_', ' ')}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">{formatCurrency(revenue.amount)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(revenue)}
                                                className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete(revenue)}
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

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setSelectedRevenue(null); resetForm(); }}
                title={selectedRevenue ? 'Edit Revenue' : 'Create Revenue'}
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source *</label>
                        <select
                            value={formData.source}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            required
                        >
                            <option value="pos_sale">POS Sale</option>
                            <option value="personal_training">Personal Training</option>
                            <option value="merchandise">Merchandise</option>
                            <option value="classes">Classes</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <Input
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                    <Input
                        label="Revenue Date"
                        type="date"
                        value={formData.revenueDate}
                        onChange={(e) => setFormData({ ...formData, revenueDate: e.target.value })}
                        required
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
                        <Button variant="outline" onClick={() => { setShowModal(false); setSelectedRevenue(null); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button onClick={selectedRevenue ? handleUpdate : handleCreate}>
                            {selectedRevenue ? 'Update' : 'Create'} Revenue
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            {confirmDelete && (
                <ConfirmModal
                    isOpen={!!confirmDelete}
                    onClose={() => setConfirmDelete(null)}
                    onConfirm={() => handleDelete(confirmDelete._id)}
                    title="Delete Revenue"
                    message={`Are you sure you want to delete this revenue: "${confirmDelete.description}"? This action cannot be undone.`}
                    confirmText="Delete"
                    confirmVariant="danger"
                />
            )}
        </div>
    );
};

export default Revenue;
