import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash, Copy, RefreshCw, CreditCard, Building2, Check, ExternalLink } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/common/Table';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import * as subscriptionPlanService from '../services/subscriptionPlanService';
import * as gymService from '../services/gymService';
import { useNotification } from '../hooks/useNotification';
import { useDebounce } from '../hooks/useDebounce';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

const PlanForm = ({ plan = null, gyms = [], onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        gymId: '',
        name: '',
        description: '',
        price: '',
        duration: 'monthly',
        trialDays: 0,
        features: {
            maxMembers: 100,
            maxBranches: 1,
            maxStorage: 1024,
            crm: true,
            scheduling: true,
            attendance: true,
            inventory: true,
            staff: true,
            payments: true,
            reports: true
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (plan) {
            setFormData({
                gymId: plan.gymId?._id || plan.gymId || '',
                name: plan.name || '',
                description: plan.description || '',
                price: plan.price || '',
                duration: plan.duration || 'monthly',
                trialDays: plan.trialDays || 0,
                features: plan.features || formData.features
            });
        }
    }, [plan]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('feature.')) {
            const featureName = name.split('.')[1];
            setFormData({
                ...formData,
                features: {
                    ...formData.features,
                    [featureName]: type === 'checkbox' ? checked : parseInt(value) || 0
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === 'number' ? (parseFloat(value) || 0) : value
            });
        }
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.gymId) {
            setError('Please select a gym');
            return;
        }
        if (!formData.price || formData.price <= 0) {
            setError('Please enter a valid price');
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(formData);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save plan');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Gym *
                </label>
                <select
                    name="gymId"
                    value={formData.gymId}
                    onChange={handleChange}
                    disabled={!!plan}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-slate-800"
                    required
                >
                    <option value="">Select a gym...</option>
                    {gyms.map((gym) => (
                        <option key={gym._id} value={gym._id}>
                            {gym.name} - {gym.ownerId?.email || 'No owner'}
                        </option>
                    ))}
                </select>
            </div>

            <Input
                label="Plan Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Premium Plan"
                required
            />

            <Input
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Full-featured plan with all modules"
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Price (₹)"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="9999"
                    min="0"
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Duration
                    </label>
                    <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>
            </div>

            <Input
                label="Trial Days"
                name="trialDays"
                type="number"
                value={formData.trialDays}
                onChange={handleChange}
                placeholder="0"
                min="0"
                helperText="Number of free trial days (0 for no trial)"
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Feature Limits
                </label>
                <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                    <Input
                        label="Max Members"
                        name="feature.maxMembers"
                        type="number"
                        value={formData.features.maxMembers}
                        onChange={handleChange}
                        min="1"
                    />
                    <Input
                        label="Max Branches"
                        name="feature.maxBranches"
                        type="number"
                        value={formData.features.maxBranches}
                        onChange={handleChange}
                        min="1"
                    />
                    <Input
                        label="Max Storage (MB)"
                        name="feature.maxStorage"
                        type="number"
                        value={formData.features.maxStorage}
                        onChange={handleChange}
                        min="100"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enabled Features
                </label>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                    {['crm', 'scheduling', 'attendance', 'inventory', 'staff', 'payments', 'reports'].map((feature) => (
                        <label key={feature} className="flex items-center">
                            <input
                                type="checkbox"
                                name={`feature.${feature}`}
                                checked={formData.features[feature]}
                                onChange={handleChange}
                                className="rounded border-gray-300 dark:border-slate-600 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-slate-700"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                                {feature}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <Button variant="ghost" onClick={onCancel} type="button" disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                    {plan ? 'Update' : 'Create'} Plan
                </Button>
            </div>
        </form>
    );
};

const SubscriptionPlans = () => {
    const { success: showSuccess, error: showError } = useNotification();
    const [plans, setPlans] = useState([]);
    const [gyms, setGyms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        loadPlans();
        loadGyms();
    }, [debouncedSearch]);

    const loadPlans = async () => {
        setIsLoading(true);
        try {
            const response = await subscriptionPlanService.getSubscriptionPlans();
            const plansData = response.data || [];
            setPlans(Array.isArray(plansData) ? plansData : []);
        } catch (error) {
            showError('Failed to load subscription plans');
        } finally {
            setIsLoading(false);
        }
    };

    const loadGyms = async () => {
        try {
            const response = await gymService.getGyms({ limit: 100 });
            const gymsData = response.data?.data || response.data || [];
            setGyms(Array.isArray(gymsData) ? gymsData : []);
        } catch (error) {
            console.error('Failed to load gyms:', error);
        }
    };

    const handleCreatePlan = async (planData) => {
        await subscriptionPlanService.createSubscriptionPlan(planData);
        showSuccess('Subscription plan created successfully');
        setIsModalOpen(false);
        loadPlans();
    };

    const handleUpdatePlan = async (planData) => {
        if (!selectedPlan) return;
        await subscriptionPlanService.updateSubscriptionPlan(selectedPlan._id, planData);
        showSuccess('Subscription plan updated successfully');
        setIsModalOpen(false);
        setSelectedPlan(null);
        loadPlans();
    };

    const handleEdit = (plan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };

    const handleDelete = (plan) => {
        setSelectedPlan(plan);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedPlan) return;
        try {
            await subscriptionPlanService.deleteSubscriptionPlan(selectedPlan._id);
            showSuccess('Subscription plan deleted successfully');
            setIsDeleteModalOpen(false);
            setSelectedPlan(null);
            loadPlans();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to delete plan');
        }
    };

    const handleCopyLink = async (plan) => {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/pay/${plan.paymentLinkToken}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopiedId(plan._id);
            showSuccess('Payment link copied to clipboard');
            setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            showError('Failed to copy link');
        }
    };

    const handleRegenerateLink = async (plan) => {
        try {
            await subscriptionPlanService.regeneratePaymentLink(plan._id);
            showSuccess('Payment link regenerated');
            loadPlans();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to regenerate link');
        }
    };

    const getDurationBadge = (duration) => {
        const variants = {
            monthly: 'info',
            quarterly: 'warning',
            yearly: 'success'
        };
        return <Badge variant={variants[duration] || 'default'}>{duration}</Badge>;
    };

    const getStatusBadge = (plan) => {
        if (plan.isPaid) {
            return <Badge variant="success"><Check size={12} className="mr-1" /> Paid</Badge>;
        }
        return <Badge variant="warning">Pending</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Plans</h1>
                    <p className="text-gray-500 dark:text-gray-400">Create and manage custom plans for gyms.</p>
                </div>
                <Button onClick={() => {
                    setSelectedPlan(null);
                    setIsModalOpen(true);
                }}>
                    <Plus size={20} className="mr-2" />
                    Create Plan
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                    <div className="w-full sm:w-96">
                        <Input
                            placeholder="Search plans..."
                            icon={Search}
                            className="dark:bg-slate-900 dark:border-slate-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Gym</TableHead>
                            <TableHead>Plan Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                </TableCell>
                            </TableRow>
                        ) : plans.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    No subscription plans found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            plans.map((plan) => (
                                <TableRow key={plan._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <Building2 size={20} className="text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {plan.gymId?.name || 'Unknown Gym'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {plan.gymId?.contact?.email || ''}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-gray-900 dark:text-white">{plan.name}</div>
                                        {plan.description && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                {plan.description}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(plan.price, 'INR')}
                                        </span>
                                    </TableCell>
                                    <TableCell>{getDurationBadge(plan.duration)}</TableCell>
                                    <TableCell>{getStatusBadge(plan)}</TableCell>
                                    <TableCell>{formatDate(plan.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {!plan.isPaid && (
                                                <>
                                                    <button
                                                        onClick={() => handleCopyLink(plan)}
                                                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                        title="Copy Payment Link"
                                                    >
                                                        {copiedId === plan._id ? (
                                                            <Check size={18} className="text-green-500" />
                                                        ) : (
                                                            <Copy size={18} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRegenerateLink(plan)}
                                                        className="p-1 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                                        title="Regenerate Link"
                                                    >
                                                        <RefreshCw size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(plan)}
                                                        className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(plan)}
                                                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash size={18} />
                                                    </button>
                                                </>
                                            )}
                                            {plan.isPaid && (
                                                <Badge variant="success" className="text-xs">
                                                    <CreditCard size={12} className="mr-1" />
                                                    Paid on {formatDate(plan.paidAt)}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedPlan(null);
                }}
                title={selectedPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
                size="lg"
            >
                <PlanForm
                    plan={selectedPlan}
                    gyms={gyms}
                    onSubmit={selectedPlan ? handleUpdatePlan : handleCreatePlan}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setSelectedPlan(null);
                    }}
                />
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedPlan(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Subscription Plan"
                message={`Are you sure you want to delete the plan "${selectedPlan?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default SubscriptionPlans;
