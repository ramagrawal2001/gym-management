import { useState, useEffect } from 'react';
import { Dumbbell, Calendar, Clock, Weight, ClipboardList } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import * as workoutPlanService from '../../services/workoutPlanService';
import { useNotification } from '../../hooks/useNotification';

const MemberWorkoutPlan = () => {
    const { error: showError } = useNotification();
    const [plan, setPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadMyPlan();
    }, []);

    const loadMyPlan = async () => {
        setIsLoading(true);
        try {
            const response = await workoutPlanService.getMyWorkoutPlan();
            setPlan(response.data?.data || null);
        } catch (error) {
            console.error('Failed to load workout plan:', error);
            if (error.response?.status !== 404) {
                showError('Failed to load your workout plan');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                <Dumbbell size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Workout Plan Assigned</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    You don't have a workout plan assigned yet. Please contact your gym administrator or trainer to get one set up.
                </p>
            </div>
        );
    }

    // Group exercises by day
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const exercisesByDay = plan.exercises.reduce((acc, exercise) => {
        const day = exercise.dayOfWeek;
        if (!acc[day]) acc[day] = [];
        acc[day].push(exercise);
        return acc;
    }, {});

    // Sort days
    const sortedDays = Object.keys(exercisesByDay).sort((a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b));

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-600/80 dark:text-blue-400/80">Active Days</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{sortedDays.length}/7</h3>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/30">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-emerald-600/80 dark:text-emerald-400/80">Total Exercises</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.exercises?.length || 0}</h3>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="space-y-8 mt-8">
                {sortedDays.map(day => (
                    <div key={day} className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
                            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                            {day}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {exercisesByDay[day].map((exercise, idx) => (
                                <Card key={idx} className="p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{exercise.name}</h4>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sets</p>
                                            <p className="font-bold text-gray-900 dark:text-white text-lg">{exercise.sets}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reps</p>
                                            <p className="font-bold text-gray-900 dark:text-white text-lg">{exercise.reps}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Weight</p>
                                            <p className="font-bold text-gray-900 dark:text-white text-lg">{exercise.weight || '-'}</p>
                                        </div>
                                    </div>

                                    {exercise.notes && (
                                        <div className="mt-3 overflow-hidden rounded-lg">
                                            <div className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 p-3">
                                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                                    <span className="font-medium">Note:</span> {exercise.notes}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MemberWorkoutPlan;
