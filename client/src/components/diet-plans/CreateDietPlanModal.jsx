import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useForm } from 'react-hook-form';
import * as dietPlanService from '../../services/dietPlanService';

const CreateDietPlanModal = ({ isOpen, onClose, onSuccess, plan = null, gymId = null }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [meals, setMeals] = useState([]);
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
                setMeals(plan.meals || []);
            } else {
                reset({ name: '', description: '', isDefault: false });
                setMeals([]);
            }
            setError('');
        }
    }, [isOpen, plan, reset]);

    const handleAddMeal = () => {
        setMeals([...meals, { dayOfWeek: 'Monday', mealType: 'Breakfast', time: '', foodItems: '', calories: '', proteins: '', carbs: '', fats: '', notes: '' }]);
    };

    const handleRemoveMeal = (index) => {
        setMeals(meals.filter((_, i) => i !== index));
    };

    const handleMealChange = (index, field, value) => {
        const newMeals = [...meals];
        newMeals[index][field] = value;
        setMeals(newMeals);
    };

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            setError('');

            const cleanedMeals = meals.map(meal => ({
                ...meal,
                calories: meal.calories === '' ? undefined : Number(meal.calories),
                proteins: meal.proteins === '' ? undefined : Number(meal.proteins),
                carbs: meal.carbs === '' ? undefined : Number(meal.carbs),
                fats: meal.fats === '' ? undefined : Number(meal.fats)
            }));

            const payload = {
                ...data,
                meals: cleanedMeals,
                ...(gymId && { gymId })
            };

            if (plan) {
                await dietPlanService.updateDietPlan(plan._id, payload);
            } else {
                await dietPlanService.createDietPlan(payload);
            }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save diet plan');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const mealTypes = ['Pre-Workout', 'Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Post-Workout', 'Other'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {plan ? 'Edit Diet Plan' : 'Create Diet Plan'}
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

                    <form id="diet-plan-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Plan Name"
                                {...register('name', { required: 'Name is required' })}
                                error={errors.name?.message}
                                placeholder="e.g., Weight Loss Macro Plan"
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
                                    placeholder="Brief description of the diet plan"
                                />
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-2 mb-6">Meals by Day</h3>
                            {days.map(day => {
                                const dayMeals = meals.filter(m => m.dayOfWeek === day);
                                return (
                                    <div key={day} className="mb-6 bg-gray-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-md font-bold text-gray-800 dark:text-gray-200">{day}</h4>
                                            <Button type="button" variant="outline" size="sm" onClick={() => handleAddMeal(day)}>
                                                <Plus size={16} className="mr-2" /> Add Meal
                                            </Button>
                                        </div>

                                        {dayMeals.length === 0 ? (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 italic py-2">No meals assigned for this day.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {meals.map((meal, index) => {
                                                    if (meal.dayOfWeek !== day) return null;
                                                    return (
                                                        <div key={index} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm relative">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveMeal(index)}
                                                                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>

                                                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-2">
                                                                <div className="md:col-span-2">
                                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day of Week</label>
                                                                    <select
                                                                        value={meal.dayOfWeek}
                                                                        onChange={(e) => handleMealChange(index, 'dayOfWeek', e.target.value)}
                                                                        className="w-full rounded-lg border-gray-300 dark:border-slate-700 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                                    >
                                                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div className="md:col-span-2">
                                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meal Type</label>
                                                                    <select
                                                                        value={meal.mealType}
                                                                        onChange={(e) => handleMealChange(index, 'mealType', e.target.value)}
                                                                        className="w-full rounded-lg border-gray-300 dark:border-slate-700 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                                    >
                                                                        {mealTypes.map(m => <option key={m} value={m}>{m}</option>)}
                                                                    </select>
                                                                </div>
                                                                <div className="md:col-span-2">
                                                                    <Input
                                                                        label="Time"
                                                                        value={meal.time || ''}
                                                                        onChange={(e) => handleMealChange(index, 'time', e.target.value)}
                                                                        placeholder="e.g. 08:00 AM"
                                                                    />
                                                                </div>
                                                                <div className="md:col-span-6">
                                                                    <Input
                                                                        label="Food Items"
                                                                        value={meal.foodItems}
                                                                        onChange={(e) => handleMealChange(index, 'foodItems', e.target.value)}
                                                                        placeholder="e.g. 2 eggs, 1 cup oats"
                                                                        required
                                                                    />
                                                                </div>

                                                                <div className="md:col-span-3 lg:col-span-1">
                                                                    <Input
                                                                        label="Calories"
                                                                        type="number"
                                                                        value={meal.calories || ''}
                                                                        onChange={(e) => handleMealChange(index, 'calories', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                                                        placeholder="kcal"
                                                                    />
                                                                </div>
                                                                <div className="md:col-span-3 lg:col-span-1">
                                                                    <Input
                                                                        label="Protein (g)"
                                                                        type="number"
                                                                        value={meal.proteins || ''}
                                                                        onChange={(e) => handleMealChange(index, 'proteins', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                                                    />
                                                                </div>
                                                                <div className="md:col-span-3 lg:col-span-1">
                                                                    <Input
                                                                        label="Carbs (g)"
                                                                        type="number"
                                                                        value={meal.carbs || ''}
                                                                        onChange={(e) => handleMealChange(index, 'carbs', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                                                    />
                                                                </div>
                                                                <div className="md:col-span-3 lg:col-span-1">
                                                                    <Input
                                                                        label="Fats (g)"
                                                                        type="number"
                                                                        value={meal.fats || ''}
                                                                        onChange={(e) => handleMealChange(index, 'fats', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                                                    />
                                                                </div>
                                                                <div className="md:col-span-6 lg:col-span-2">
                                                                    <Input
                                                                        label="Notes (Optional)"
                                                                        value={meal.notes || ''}
                                                                        onChange={(e) => handleMealChange(index, 'notes', e.target.value)}
                                                                        placeholder="e.g. Drink lots of water"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </form>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-slate-800">
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" form="diet-plan-form" isLoading={isSubmitting}>
                        {plan ? 'Save Changes' : 'Create Plan'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateDietPlanModal;
