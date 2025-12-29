import { useState, useEffect } from 'react';
import { Plus, Edit2, Power, Trash2, AlertCircle, DollarSign, TrendingUp } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ConfirmModal from '../../components/common/ConfirmModal';
import revenueSourceService from '../../services/revenueSourceService';
import { formatCurrency } from '../../utils/formatCurrency';

const RevenueSources = () => {
    const [sources, setSources] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedSource, setSelectedSource] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [includeInactive, setIncludeInactive] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'one-time',
        defaultAmount: '',
        gstApplicable: false,
        icon: '💰',
        color: '#10b981'
    });

    useEffect(() => {
        fetchSources();
        fetchStats();
    }, [includeInactive]);

    const fetchSources = async () => {
        try {
            setLoading(true);
            const response = await revenueSourceService.getAll(includeInactive);
            setSources(response.data);
        } catch (error) {
            console.error('Error fetching revenue sources:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await revenueSourceService.getStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleCreate = async () => {
        try {
            await revenueSourceService.create(formData);
            setShowModal(false);
            resetForm();
            fetchSources();
            fetchStats();
        } catch (error) {
            console.error('Error creating revenue source:', error);
            alert(error.response?.data?.message || 'Failed to create revenue source');
        }
    };

    const handleUpdate = async () => {
        try {
            await revenueSourceService.update(selectedSource._id, formData);
            setShowModal(false);
            resetForm();
            setSelectedSource(null);
            fetchSources();
        } catch (error) {
            console.error('Error updating revenue source:', error);
            alert(error.response?.data?.message || 'Failed to update revenue source');
        }
    };

    const handleToggle = async (source) => {
        try {
            await revenueSourceService.toggle(source._id);
            fetchSources();
        } catch (error) {
            console.error('Error toggling revenue source:', error);
            alert(error.response?.data?.message || 'Failed to toggle revenue source');
        }
    };

    const handleDelete = async (id) => {
        try {
            await revenueSourceService.delete(id);
            setConfirmDelete(null);
            fetchSources();
            fetchStats();
        } catch (error) {
            console.error('Error deleting revenue source:', error);
            alert(error.response?.data?.message || 'Failed to delete revenue source');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: 'one-time',
            defaultAmount: '',
            gstApplicable: false,
            icon: '💰',
            color: '#10b981'
        });
    };

    const openEditModal = (source) => {
        setSelectedSource(source);
        setFormData({
            name: source.name,
            description: source.description || '',
            category: source.category,
            defaultAmount: source.defaultAmount || '',
            gstApplicable: source.gstApplicable,
            icon: source.icon,
            color: source.color
        });
        setShowModal(true);
    };

    const commonIcons = ['💰', '💵', '💳', '🏦', '📊', '🎯', '🎉', '🎁', '🏋️', '👥', '🏃', '🧘', '🛒', '🎫'];
    const commonColors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#06b6d4', '#ef4444'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue Sources</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage revenue categories and automation settings
                    </p>
                </div>
                <Button onClick={() => { resetForm(); setSelectedSource(null); setShowModal(true); }}>
                    <Plus size={20} />
                    Create Custom Source
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <DollarSign className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sources</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSources}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <Power className="text-green-600 dark:text-green-400" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Active Sources</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeSources}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Auto-Generated</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.autoSources}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Toggle */}
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="includeInactive"
                    checked={includeInactive}
                    onChange={(e) => setIncludeInactive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                />
                <label htmlFor="includeInactive" className="text-sm text-gray-700 dark:text-gray-300">
                    Show inactive sources
                </label>
            </div>

            {/* Sources List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Source</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Usage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Loading...</td>
                            </tr>
                        ) : sources.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No revenue sources found</td>
                            </tr>
                        ) : (
                            sources.map((source) => (
                                <tr key={source._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl" style={{ color: source.color }}>{source.icon}</span>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                    {source.name}
                                                    {source.isSystemSource && (
                                                        <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded">System</span>
                                                    )}
                                                </div>
                                                {source.description && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{source.description}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${source.category === 'recurring'
                                                ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                                : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                            }`}>
                                            {source.category === 'recurring' ? '🔄 Recurring' : '⚡ One-time'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${source.autoGenerate
                                                ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}>
                                            {source.autoGenerate ? '🤖 Auto' : '✋ Manual'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {source.usageCount || 0} entries
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${source.isActive
                                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                            }`}>
                                            {source.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            {!source.isSystemSource && (
                                                <button
                                                    onClick={() => openEditModal(source)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleToggle(source)}
                                                className={`${source.isActive
                                                        ? 'text-orange-600 dark:text-orange-400 hover:text-orange-700'
                                                        : 'text-green-600 dark:text-green-400 hover:text-green-700'
                                                    }`}
                                                title={source.isActive ? 'Disable' : 'Enable'}
                                            >
                                                <Power size={16} />
                                            </button>
                                            {!source.isSystemSource && (
                                                <button
                                                    onClick={() => setConfirmDelete(source)}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                    <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={20} />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-semibold mb-1">About Revenue Sources:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li><strong>System Sources</strong>: Pre-configured sources that auto-generate revenue from payments (cannot be deleted)</li>
                            <li><strong>Custom Sources</strong>: Manual sources you create for special revenue categories</li>
                            <li><strong>Auto-Generated</strong>: Revenue is automatically created when payments are received</li>
                            <li><strong>Manual</strong>: Requires manual revenue entry (for events, sponsorships, etc.)</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setSelectedSource(null); resetForm(); }}
                title={selectedSource ? 'Edit Revenue Source' : 'Create Custom Revenue Source'}
            >
                <div className="space-y-4">
                    <Input
                        label="Source Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Event Income"
                        required
                        disabled={selectedSource?.isSystemSource}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            rows="2"
                            placeholder="Optional description"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            disabled={selectedSource?.isSystemSource}
                        >
                            <option value="one-time">One-time</option>
                            <option value="recurring">Recurring</option>
                        </select>
                    </div>

                    <Input
                        label="Default Amount (Optional)"
                        type="number"
                        value={formData.defaultAmount}
                        onChange={(e) => setFormData({ ...formData, defaultAmount: e.target.value })}
                        placeholder="0"
                    />

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="gstApplicable"
                            checked={formData.gstApplicable}
                            onChange={(e) => setFormData({ ...formData, gstApplicable: e.target.checked })}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="gstApplicable" className="text-sm text-gray-700 dark:text-gray-300">
                            GST/Tax applicable
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {commonIcons.map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon })}
                                    className={`text-2xl p-2 rounded-lg border-2 ${formData.icon === icon
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-slate-600 hover:border-gray-300'
                                        }`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {commonColors.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color })}
                                    className={`w-10 h-10 rounded-lg border-2 ${formData.color === color
                                            ? 'border-gray-900 dark:border-white scale-110'
                                            : 'border-gray-200 dark:border-slate-600'
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                        <Input
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            className="mt-2 h-10"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => { setShowModal(false); setSelectedSource(null); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button onClick={selectedSource ? handleUpdate : handleCreate}>
                            {selectedSource ? 'Update' : 'Create'} Source
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
                    title="Delete Revenue Source"
                    message={`Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`}
                    confirmText="Delete"
                    confirmVariant="danger"
                />
            )}
        </div>
    );
};

export default RevenueSources;
