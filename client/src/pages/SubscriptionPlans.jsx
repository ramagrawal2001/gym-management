import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash, Copy, RefreshCw, CreditCard, Building2, Check, ExternalLink, Clock } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/common/Table';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import * as subscriptionPlanService from '../services/subscriptionPlanService';
import * as subscriptionService from '../services/subscriptionService';
import * as gymService from '../services/gymService';
import { useNotification } from '../hooks/useNotification';
import { useDebounce } from '../hooks/useDebounce';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import PaymentHistoryModal from '../components/super-admin/subscriptions/PaymentHistoryModal';

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
            reports: true,
            memberLogin: true
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
                    {['crm', 'scheduling', 'attendance', 'inventory', 'staff', 'payments', 'reports', 'memberLogin'].map((feature) => (
                        <label key={feature} className="flex items-center">
                            <input
                                type="checkbox"
                                name={`feature.${feature}`}
                                checked={formData.features[feature]}
                                onChange={handleChange}
                                className="rounded border-gray-300 dark:border-slate-600 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-slate-700"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                                {feature === 'memberLogin' ? 'Member Login' : feature}
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
    const [subscriptions, setSubscriptions] = useState([]);
    const [gyms, setGyms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [copiedId, setCopiedId] = useState(null);
    const defaultTrialFeatures = { crm: true, scheduling: true, attendance: true, inventory: true, staff: true, payments: true, reports: true };
    const [trialForm, setTrialForm] = useState({ gymId: '', trialDays: 14, features: { ...defaultTrialFeatures } });
    const [isTrialLoading, setIsTrialLoading] = useState(false);

    // Payment History Modal states
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [selectedPaymentPlanName, setSelectedPaymentPlanName] = useState('');
    const [selectedPaymentGymName, setSelectedPaymentGymName] = useState('');

    useEffect(() => {
        loadPlans();
        loadSubscriptions();
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

    const loadSubscriptions = async () => {
        try {
            const response = await subscriptionService.getSubscriptions({ limit: 100 });
            const subsData = response.data || [];
            setSubscriptions(Array.isArray(subsData) ? subsData : []);
        } catch (error) {
            console.error('Failed to load subscriptions:', error);
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

    const handleEdit = (item) => {
        if (item.type === 'plan') {
            setSelectedPlan(item.originalData);
            setIsModalOpen(true);
        } else if (item.type === 'subscription' && item.status === 'trial') {
            setTrialForm({
                gymId: item.gym?._id || '',
                trialDays: item.daysRemaining > 0 ? item.daysRemaining : 14,
                features: { ...defaultTrialFeatures }
            });
            setIsTrialModalOpen(true);
        }
    };

    const handleDelete = (item) => {
        setSelectedPlan(item);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedPlan) return;
        try {
            if (selectedPlan.type === 'plan') {
                await subscriptionPlanService.deleteSubscriptionPlan(selectedPlan.originalId);
                showSuccess('Subscription plan deleted successfully');
            } else if (selectedPlan.type === 'subscription') {
                await subscriptionService.cancelSubscription(selectedPlan.originalId);
                showSuccess('Subscription cancelled successfully');
            }
            setIsDeleteModalOpen(false);
            setSelectedPlan(null);
            loadPlans();
            loadSubscriptions();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to delete item');
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

    const handleGrantTrial = async (e) => {
        e.preventDefault();
        if (!trialForm.gymId) {
            showError('Please select a gym');
            return;
        }
        setIsTrialLoading(true);
        try {
            await subscriptionService.grantTrialAccess({
                gymId: trialForm.gymId,
                trialDays: trialForm.trialDays,
                features: trialForm.features
            });
            showSuccess(`Trial access granted for ${trialForm.trialDays} days`);
            setIsTrialModalOpen(false);
            setTrialForm({ gymId: '', trialDays: 14, features: { ...defaultTrialFeatures } });
            loadPlans();
            loadSubscriptions();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to grant trial access');
        } finally {
            setIsTrialLoading(false);
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

    const getSubscriptionStatusBadge = (status) => {
        const variants = {
            active: 'success',
            paid: 'success',
            trial: 'info',
            expired: 'danger',
            cancelled: 'danger',
            pending: 'warning'
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    const handleViewPayments = async (item) => {
        console.log('Clicked row for payment history:', item);
        if (item.status === 'trial') return;

        setSelectedPaymentGymName(item.gym?.name || 'Unknown Gym');
        setSelectedPaymentPlanName(item.name || 'Unknown Plan');
        setIsPaymentModalOpen(true);
        setIsPaymentLoading(true);

        try {
            let planId = item.type === 'plan' ? item.originalId : item.originalData.planId?._id;
            console.log('Fetching payment history for gymId:', item.gym?._id, 'planId:', planId);
            const res = await subscriptionService.getPaymentHistory({ gymId: item.gym?._id, planId });
            console.log('Payment history response:', res.data);
            setPaymentHistory(res.data || []);
        } catch (error) {
            console.error('Failed to load payment history:', error);
            showError('Failed to load payment history');
        } finally {
            setIsPaymentLoading(false);
        }
    };

    const combinedList = [
        ...plans.map(p => ({
            _id: `plan-${p._id}`,
            originalId: p._id,
            type: 'plan',
            gym: p.gymId,
            name: p.name,
            description: p.description,
            price: p.price,
            duration: p.duration,
            status: p.isPaid ? 'paid' : 'pending',
            startDate: p.createdAt,
            endDate: null,
            daysRemaining: null,
            isPaid: p.isPaid,
            originalData: p
        })),
        ...subscriptions.map(s => {
            const endDate = s.status === 'trial' ? s.trialEndsAt : s.endDate;
            const daysRemaining = endDate ? Math.max(0, Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24))) : null;
            return {
                _id: `sub-${s._id}`,
                originalId: s._id,
                type: 'subscription',
                gym: s.gymId,
                name: s.planId?.name || (s.status === 'trial' ? 'Free Trial' : 'Unknown Plan'),
                description: s.planId?.description || 'Gym Subscription',
                price: s.planId?.price || 0,
                duration: s.planId?.duration || 'trial',
                status: s.status,
                startDate: s.startDate,
                endDate: endDate,
                daysRemaining,
                isPaid: s.status !== 'trial' && s.status !== 'pending',
                originalData: s
            };
        })
    ].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    const filteredList = combinedList.filter(item => {
        if (!debouncedSearch) return true;
        const search = debouncedSearch.toLowerCase();
        return (
            item.gym?.name?.toLowerCase().includes(search) ||
            item.name?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Plans</h1>
                    <p className="text-gray-500 dark:text-gray-400">Create and manage custom plans for gyms.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => setIsTrialModalOpen(true)}
                    >
                        <Clock size={20} className="mr-2" />
                        Grant Trial
                    </Button>
                    <Button onClick={() => {
                        setSelectedPlan(null);
                        setIsModalOpen(true);
                    }}>
                        <Plus size={20} className="mr-2" />
                        Create Plan
                    </Button>
                </div>
            </div>

            {/* Unified Plans and Subscriptions Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Subscriptions & Plans</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View and manage trials, custom created plans, and active subscriptions.</p>
                    </div>
                    <div className="w-full sm:w-80">
                        <Input
                            placeholder="Search by gym or plan name..."
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
                            <TableHead>Type / Plan</TableHead>
                            <TableHead>Duration & Price</TableHead>
                            <TableHead>Dates / Details</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                </TableCell>
                            </TableRow>
                        ) : filteredList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    {searchQuery ? 'No matching subscriptions or plans found.' : 'No subscriptions or plans found. Create one to get started.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredList.map((item) => (
                                <TableRow
                                    key={item._id}
                                    className={item.status !== 'trial' ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50" : ""}
                                    onClick={() => item.status !== 'trial' ? handleViewPayments(item) : null}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <Building2 size={20} className="text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {item.gym?.name || 'Unknown Gym'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {item.gym?.contact?.email || ''}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                        {item.description && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[12rem]">
                                                {item.description}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {item.price > 0 ? formatCurrency(item.price, 'INR') : 'Free'}
                                            </span>
                                            <div className="mt-1">{item.duration !== 'trial' ? getDurationBadge(item.duration) : <Badge variant="info">Trial</Badge>}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs space-y-1">
                                            {item.startDate && (
                                                <div className="text-gray-600 dark:text-gray-300">
                                                    <span className="text-gray-500 dark:text-gray-500">Start: </span>
                                                    {formatDate(item.startDate)}
                                                </div>
                                            )}
                                            {item.endDate && (
                                                <div className="text-gray-600 dark:text-gray-300">
                                                    <span className="text-gray-500 dark:text-gray-500">End: </span>
                                                    {formatDate(item.endDate)}
                                                </div>
                                            )}
                                            {item.daysRemaining !== null && (
                                                <div className={`font-medium ${item.daysRemaining <= 3 ? 'text-red-500' : 'text-blue-500'}`}>
                                                    {item.daysRemaining} days remaining
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getSubscriptionStatusBadge(item.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 text-gray-400" onClick={(e) => e.stopPropagation()}>
                                            {item.type === 'plan' && !item.isPaid && (
                                                <>
                                                    <button
                                                        onClick={() => handleCopyLink(item.originalData)}
                                                        className="p-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                        title="Copy Payment Link"
                                                    >
                                                        {copiedId === item.originalId ? (
                                                            <Check size={18} className="text-green-500" />
                                                        ) : (
                                                            <Copy size={18} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRegenerateLink(item.originalData)}
                                                        className="p-1 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                                        title="Regenerate Link"
                                                    >
                                                        <RefreshCw size={18} />
                                                    </button>
                                                </>
                                            )}

                                            {(item.type === 'plan' || (item.type === 'subscription' && item.status === 'trial')) && (
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-1 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="p-1 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                title="Delete/Cancel"
                                            >
                                                <Trash size={18} />
                                            </button>
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
                title={selectedPlan?.type === 'plan' ? "Delete Subscription Plan" : "Cancel Subscription"}
                message={`Are you sure you want to ${selectedPlan?.type === 'plan' ? 'delete the plan' : 'cancel the subscription'} "${selectedPlan?.name}"? This action cannot be undone.`}
                confirmText={selectedPlan?.type === 'plan' ? "Delete" : "Cancel"}
                variant="danger"
            />

            {/* Grant Trial Modal */}
            <Modal
                isOpen={isTrialModalOpen}
                onClose={() => {
                    setIsTrialModalOpen(false);
                    setTrialForm({ gymId: '', trialDays: 14, features: { ...defaultTrialFeatures } });
                }}
                title="Grant Trial Access"
                size="md"
            >
                <form onSubmit={handleGrantTrial} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Select Gym *
                        </label>
                        <select
                            value={trialForm.gymId}
                            onChange={(e) => setTrialForm({ ...trialForm, gymId: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Trial Duration (Days)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="365"
                            value={trialForm.trialDays}
                            onChange={(e) => setTrialForm({ ...trialForm, trialDays: parseInt(e.target.value) || 14 })}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
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
                                        checked={trialForm.features[feature]}
                                        onChange={(e) => setTrialForm({
                                            ...trialForm,
                                            features: { ...trialForm.features, [feature]: e.target.checked }
                                        })}
                                        className="rounded border-gray-300 dark:border-slate-600 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-slate-700"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                                        {feature}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Note:</strong> This will create a free trial subscription with the selected features. No payment is required. The trial will automatically expire after the specified duration.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => {
                                setIsTrialModalOpen(false);
                                setTrialForm({ gymId: '', trialDays: 14, features: { ...defaultTrialFeatures } });
                            }}
                            disabled={isTrialLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isTrialLoading} disabled={isTrialLoading}>
                            <Clock size={18} className="mr-2" />
                            Grant Trial Access
                        </Button>
                    </div>
                </form>
            </Modal>

            <PaymentHistoryModal
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    setPaymentHistory([]);
                }}
                payments={paymentHistory}
                isLoading={isPaymentLoading}
                gymName={selectedPaymentGymName}
                planName={selectedPaymentPlanName}
            />
        </div>
    );
};

export default SubscriptionPlans;
