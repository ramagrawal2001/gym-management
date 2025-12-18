import { useState, useEffect } from 'react';
import { Check, Plus, Edit2, Trash2, Building2, Users } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ConfirmModal from '../components/common/ConfirmModal';
import * as planService from '../services/planService';
import CreatePlanModal from '../components/plans/CreatePlanModal';
import * as gymService from '../services/gymService';
import { useRole } from '../hooks/useRole';
import { useNotification } from '../hooks/useNotification';
import { formatCurrency } from '../utils/formatCurrency';

const Plans = () => {
    const { isSuperAdmin, isOwner } = useRole();
    const { success: showSuccess, error: showError } = useNotification();
    const [plans, setPlans] = useState([]);
    const [gyms, setGyms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'subscription', 'member'
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState(null);

    useEffect(() => {
        loadPlans();
        if (isSuperAdmin()) {
            loadGyms();
        }
    }, []);

    const loadGyms = async () => {
        try {
            const response = await gymService.getGyms({ page: 1, limit: 1000 });
            const gymsData = response.data?.data || response.data || [];
            setGyms(Array.isArray(gymsData) ? gymsData : []);
        } catch (error) {
            console.error('Failed to load gyms:', error);
        }
    };

    const loadPlans = async () => {
        setIsLoading(true);
        try {
            // For super admin, can optionally filter by gymId
            // For owners/staff, plans are automatically filtered by their gymId
            const params = { page: 1, limit: 100 };
            const response = await planService.getPlans(params);
            const plansData = response.data?.data || response.data || [];
            setPlans(Array.isArray(plansData) ? plansData : []);
        } catch (error) {
            console.error(error);
            showError('Failed to load plans');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlanCreated = () => {
        showSuccess(`Plan ${editingPlan ? 'updated' : 'created'} successfully`);
        loadPlans();
        setEditingPlan(null);
    };

    const handleEditClick = (plan) => {
        setEditingPlan(plan);
        setIsCreateModalOpen(true);
    };

    const handleModalClose = () => {
        setIsCreateModalOpen(false);
        setEditingPlan(null);
    };

    const handleDeleteClick = (plan) => {
        setPlanToDelete(plan);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!planToDelete) return;
        
        try {
            await planService.deletePlan(planToDelete._id);
            showSuccess('Plan deleted successfully');
            setIsDeleteModalOpen(false);
            setPlanToDelete(null);
            loadPlans();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to delete plan');
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setPlanToDelete(null);
    };

    // For super admin: distinguish between subscription plans (used by gyms) and member plans
    // For gym owners: show only their gym's member plans
    const getFilteredPlans = () => {
        if (!isSuperAdmin()) {
            // Gym owners see only their gym's plans (already filtered by backend)
            return plans;
        }

        // Super admin: filter by active tab
        if (activeTab === 'subscription') {
            // Plans that are used by gyms (subscription plans - gymId is null or used by gyms)
            const gymPlanIds = new Set(gyms.map(g => g.planId?._id || g.planId).filter(Boolean));
            return plans.filter(p => !p.gymId || gymPlanIds.has(p._id));
        } else if (activeTab === 'member') {
            // Plans that have a gymId (member plans for specific gyms)
            return plans.filter(p => p.gymId);
        }
        // 'all' - show all plans
        return plans;
    };

    const getPlanType = (plan) => {
        if (!isSuperAdmin()) return 'member';
        // If plan has gymId, it's a member plan; if not, it's a subscription plan
        return plan.gymId ? 'member' : 'subscription';
    };

    const formatPrice = (plan) => {
        const price = plan.price || 0;
        const duration = plan.duration || 'monthly';
        const durationMap = {
            monthly: '/month',
            quarterly: '/quarter',
            yearly: '/year'
        };
        return `${formatCurrency(price)}${durationMap[duration] || ''}`;
    };

    const filteredPlans = getFilteredPlans();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isSuperAdmin() ? 'Plans Management' : 'Membership Plans'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {isSuperAdmin()
                            ? 'Manage subscription plans for gyms and member plans.'
                            : 'Configure your gym\'s pricing tiers.'}
                    </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus size={20} className="mr-2" />
                    Create Plan
                </Button>
            </div>

            <CreatePlanModal
                isOpen={isCreateModalOpen}
                onClose={handleModalClose}
                onSuccess={handlePlanCreated}
                plan={editingPlan}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Plan"
                message={`Are you sure you want to delete "${planToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />

            {isSuperAdmin() && (
                <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        All Plans
                    </button>
                    <button
                        onClick={() => setActiveTab('subscription')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'subscription'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <Building2 size={16} />
                        Subscription Plans
                    </button>
                    <button
                        onClick={() => setActiveTab('member')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'member'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <Users size={16} />
                        Member Plans
                    </button>
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : filteredPlans.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No plans found
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredPlans.map((plan) => {
                        const planType = getPlanType(plan);
                        const features = plan.features || [];
                        return (
                            <Card key={plan._id} className={`relative p-8 ${plan.isDefault ? 'border-blue-500 shadow-lg shadow-blue-500/10' : ''}`}>
                                {plan.isDefault && (
                                    <div className="absolute top-0 right-0 p-4">
                                        <Badge variant="primary">Default</Badge>
                                    </div>
                                )}
                                {isSuperAdmin() && (
                                    <div className="absolute top-0 left-0 p-4">
                                        <Badge variant={planType === 'subscription' ? 'primary' : 'success'}>
                                            {planType === 'subscription' ? 'Subscription' : 'Member'}
                                        </Badge>
                                    </div>
                                )}
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                                {plan.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
                                )}
                                {isSuperAdmin() && plan.gymId && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Gym: {plan.gymId?.name || 'N/A'}
                                    </p>
                                )}
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{formatPrice(plan)}</span>
                                </div>

                                {features.length > 0 && (
                                    <ul className="mt-6 space-y-4">
                                        {features.map((feature, index) => (
                                            <li key={index} className="flex items-center text-gray-600 dark:text-gray-300">
                                                <Check size={16} className="text-green-500 mr-3" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div className="mt-8 flex gap-3">
                                    <Button variant="secondary" className="w-full" onClick={() => handleEditClick(plan)}>
                                        <Edit2 size={16} className="mr-2" /> Edit
                                    </Button>
                                    {(isSuperAdmin() || isOwner()) && (
                                        <Button 
                                            variant="ghost" 
                                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            onClick={() => handleDeleteClick(plan)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Plans;
