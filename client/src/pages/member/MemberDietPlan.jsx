import { useState, useEffect } from 'react';
import { Utensils, Clock, Flame, Info } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import * as dietPlanService from '../../services/dietPlanService';
import { useNotification } from '../../hooks/useNotification';

const MemberDietPlan = () => {
    const { error: showError } = useNotification();
    const [plan, setPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadMyPlan();
    }, []);

    const loadMyPlan = async () => {
        setIsLoading(true);
        try {
            const response = await dietPlanService.getMyDietPlan();
            setPlan(response.data?.data || null);
        } catch (error) {
            console.error('Failed to load diet plan:', error);
            if (error.response?.status !== 404) {
                showError('Failed to load your diet plan');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                <Utensils size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Diet Plan Assigned</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    You don't have a diet plan assigned yet. Please contact your gym administrator or trainer to get one set up.
                </p>
            </div>
        );
    }

    // Sort meals if a time logic could be applied, or just keep order of creation
    const meals = plan.meals || [];

    const totalCalories = meals.reduce((acc, meal) => acc + (Number(meal.calories) || 0), 0);
    const totalProtein = meals.reduce((acc, meal) => acc + (Number(meal.proteins) || 0), 0);
    const totalCarbs = meals.reduce((acc, meal) => acc + (Number(meal.carbs) || 0), 0);
    const totalFats = meals.reduce((acc, meal) => acc + (Number(meal.fats) || 0), 0);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h1>
                        {plan.isDefault && <Badge variant="primary">Gym Default Plan</Badge>}
                    </div>
                    {plan.description && (
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-3xl">
                            {plan.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-500/20 text-center">
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">Total Calories</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCalories} <span className="text-sm font-normal text-gray-500">kcal</span></p>
                </Card>
                <Card className="p-4 bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-500/20 text-center">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Protein</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProtein} <span className="text-sm font-normal text-gray-500">g</span></p>
                </Card>
                <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-500/20 text-center">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Carbs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCarbs} <span className="text-sm font-normal text-gray-500">g</span></p>
                </Card>
                <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-500/20 text-center">
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">Fats</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalFats} <span className="text-sm font-normal text-gray-500">g</span></p>
                </Card>
            </div>

            <div className="space-y-4 mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
                    <Utensils size={20} className="text-green-600" />
                    Daily Meals
                </h3>

                <div className="space-y-4">
                    {meals.map((meal, idx) => (
                        <Card key={idx} className="p-5 overflow-hidden relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500"></div>

                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 ml-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{meal.mealType}</h4>
                                        {meal.time && (
                                            <span className="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                <Clock size={14} className="mr-1" /> {meal.time}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap">
                                        {meal.foodItems}
                                    </p>

                                    {meal.notes && (
                                        <div className="mt-3 flex gap-2 items-start text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                            <Info size={16} className="mt-0.5 text-blue-500 shrink-0" />
                                            <span>{meal.notes}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="shrink-0 flex sm:flex-col gap-3 sm:gap-2">
                                    {meal.calories && (
                                        <Badge variant="gray" className="flex items-center">
                                            <Flame size={12} className="mr-1 text-orange-500" />
                                            {meal.calories} kcal
                                        </Badge>
                                    )}
                                    {(meal.proteins || meal.carbs || meal.fats) && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded-lg text-right w-full sm:w-auto">
                                            {meal.proteins && <div><span className="font-semibold text-gray-700 dark:text-gray-300">{meal.proteins}g</span> Protein</div>}
                                            {meal.carbs && <div><span className="font-semibold text-gray-700 dark:text-gray-300">{meal.carbs}g</span> Carbs</div>}
                                            {meal.fats && <div><span className="font-semibold text-gray-700 dark:text-gray-300">{meal.fats}g</span> Fats</div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MemberDietPlan;
