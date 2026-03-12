import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useForm } from 'react-hook-form';
import * as workoutPlanService from '../../services/workoutPlanService';

const CreateWorkoutPlanModal = ({ isOpen, onClose, onSuccess, plan = null, gymId = null }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [exercises, setExercises] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (plan) {
                reset({
                    name: plan.name,
                    description: plan.description || '',
                    isDefault: plan.isDefault || false
                });
                setExercises(plan.exercises || []);
            } else {
                reset({ name: '', description: '', isDefault: false });
                setExercises([]);
            }
            setError('');
        }
    }, [isOpen, plan, reset]);

    const handleAddExercise = () => {
        setExercises([...exercises, { name: '', sets: 3, reps: '10', weight: '', dayOfWeek: 'Monday', notes: '' }]);
    };

    const handleRemoveExercise = (index) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const handleExerciseChange = (index, field, value) => {
        const newExercises = [...exercises];
        newExercises[index][field] = value;
        setExercises(newExercises);
    };

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            setError('');

            const payload = {
                ...data,
                exercises,
                ...(gymId && { gymId })
            };

            if (plan) {
                await workoutPlanService.updateWorkoutPlan(plan._id, payload);
            } else {
                await workoutPlanService.createWorkoutPlan(payload);
            }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save workout plan');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {plan ? 'Edit Workout Plan' : 'Create Workout Plan'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form id="workout-plan-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Plan Name"
                                {...register('name', { required: 'Name is required' })}
                                error={errors.name?.message}
                                placeholder="e.g., Novice Strength Focus"
                            />

                            <div className="flex items-center h-full pt-6">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        {...register('isDefault')}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-opacity-25"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Set as Default Gym Plan
                                    </span>
                                </label>
                            </div>

                            <div className="md:col-span-2">
                                <Input
                                    label="Description (Optional)"
                                    {...register('description')}
                                    placeholder="Brief description of the plan"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4 mt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Exercises</h3>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddExercise}>
                                    <Plus size={16} className="mr-2" /> Add Exercise
                                </Button>
                            </div>

                            {exercises.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic py-4">No exercises added yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {exercises.map((ex, index) => (
                                        <div key={index} className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 relative">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExercise(index)}
                                                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day of Week</label>
                                                    <select
                                                        value={ex.dayOfWeek}
                                                        onChange={(e) => handleExerciseChange(index, 'dayOfWeek', e.target.value)}
                                                        className="w-full rounded-lg border-gray-300 dark:border-slate-700 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                    >
                                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                                    </select>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Input
                                                        label="Exercise Name"
                                                        value={ex.name}
                                                        onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Input
                                                        label="Sets"
                                                        type="number"
                                                        min="1"
                                                        value={ex.sets}
                                                        onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Input
                                                        label="Reps"
                                                        value={ex.reps}
                                                        onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                                                        placeholder="e.g. 10-12"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Input
                                                        label="Weight (Optional)"
                                                        value={ex.weight || ''}
                                                        onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                                                        placeholder="e.g. 20kg"
                                                    />
                                                </div>
                                                <div className="md:col-span-4">
                                                    <Input
                                                        label="Notes (Optional)"
                                                        value={ex.notes || ''}
                                                        onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                                                        placeholder="e.g. Keep back straight"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-slate-800">
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" form="workout-plan-form" isLoading={isSubmitting}>
                        {plan ? 'Save Changes' : 'Create Plan'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateWorkoutPlanModal;
