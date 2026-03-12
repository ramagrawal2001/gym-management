import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ConfirmModal from '../components/common/ConfirmModal';
import CreateWorkoutPlanModal from '../components/workout-plans/CreateWorkoutPlanModal';
import AssignPlanModal from '../components/common/AssignPlanModal';
import * as workoutPlanService from '../services/workoutPlanService';
import { useNotification } from '../hooks/useNotification';
import { useRole } from '../hooks/useRole';
import * as gymService from '../services/gymService';

const WorkoutPlans = () => {
    const { success: showSuccess, error: showError } = useNotification();
    const { isSuperAdmin } = useRole();
    const [plans, setPlans] = useState([]);
    const [gyms, setGyms] = useState([]);
    const [selectedGymId, setSelectedGymId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [assigningPlan, setAssigningPlan] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState(null);

    useEffect(() => {
        if (isSuperAdmin()) {
            loadGyms();
        }
        loadPlans();
    }, [selectedGymId]);

    const loadGyms = async () => {
        try {
            const response = await gymService.getGyms({ page: 1, limit: 1000 });
            setGyms(response.data?.data || []);
        } catch (error) {
            console.error('Failed to load gyms:', error);
        }
    };

    const loadPlans = async () => {
        setIsLoading(true);
        try {
            const params = {};
            if (isSuperAdmin() && selectedGymId) {
                params.gymId = selectedGymId;
            }
            const response = await workoutPlanService.getWorkoutPlans(params);
            setPlans(response.data?.data || []);
        } catch (error) {
            console.error('Failed to load workout plans:', error);
            showError('Failed to load workout plans');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlanSaved = () => {
        showSuccess(`Workout plan ${editingPlan ? 'updated' : 'created'} successfully`);
        loadPlans();
        setIsCreateModalOpen(false);
        setEditingPlan(null);
    };

    const handlePlanAssigned = (count) => {
        showSuccess(`Plan assigned to ${count} member(s) successfully`);
        setIsAssignModalOpen(false);
    };

    const handleEditClick = (plan) => {
        setEditingPlan(plan);
        setIsCreateModalOpen(true);
    };

    const handleDeleteClick = (plan) => {
        setPlanToDelete(plan);
        setIsDeleteModalOpen(true);
    };

    const handleAssignClick = (plan) => {
        setAssigningPlan(plan);
        setIsAssignModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!planToDelete) return;

        try {
            await workoutPlanService.deleteWorkoutPlan(planToDelete._id);
            showSuccess('Workout plan deleted successfully');
            setIsDeleteModalOpen(false);
            setPlanToDelete(null);
            loadPlans();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to delete plan');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Plans</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage workout templates and assign them to members.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    {isSuperAdmin() && (
                        <select
                            value={selectedGymId}
                            onChange={(e) => setSelectedGymId(e.target.value)}
                            className="rounded-lg border border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">All Gyms</option>
                            {gyms.map(gym => (
                                <option key={gym._id} value={gym._id}>
                                    {gym.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <Button onClick={() => { setEditingPlan(null); setIsCreateModalOpen(true); }} disabled={isSuperAdmin() && !selectedGymId}>
                        <Plus size={20} className="mr-2" />
                        Create Plan
                    </Button>
                </div>
            </div>

            <CreateWorkoutPlanModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handlePlanSaved}
                plan={editingPlan}
                gymId={isSuperAdmin() ? selectedGymId : undefined}
            />

            <AssignPlanModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                onSuccess={handlePlanAssigned}
                plan={assigningPlan}
                type="workout"
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Workout Plan"
                message={`Are you sure you want to delete "${planToDelete?.name}"? Members assigned to this plan will fallback to the default plan.`}
                confirmText="Delete"
                variant="danger"
            />

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : plans.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-lg">
                    No workout plans found. Create one to get started!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <Card key={plan._id} className={`relative flex flex-col h-full ${plan.isDefault ? 'border-blue-500 ring-1 ring-blue-500 shadow-md' : ''}`}>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1" title={plan.name}>
                                        {plan.name}
                                    </h3>
                                    {plan.isDefault && (
                                        <Badge variant="primary" className="shrink-0 ml-2">Default</Badge>
                                    )}
                                </div>

                                {plan.description ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 min-h-10">
                                        {plan.description}
                                    </p>
                                ) : (
                                    <div className="h-10 mb-4 opacity-0" aria-hidden="true">-</div>
                                )}

                                <div className="mt-auto">
                                    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="font-medium text-gray-900 dark:text-white mb-1">
                                            {plan.exercises?.length || 0} Exercises
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex gap-2 justify-end shrink-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                    onClick={() => handleAssignClick(plan)}
                                >
                                    <Users size={16} className="mr-2" /> Assign
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="px-3"
                                    onClick={() => handleEditClick(plan)}
                                >
                                    <Edit2 size={16} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="px-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={() => handleDeleteClick(plan)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorkoutPlans;
