import { useState, useEffect } from 'react';
import { Calendar, Plus, List } from 'lucide-react';
import Button from '../components/common/Button';
import WeeklyCalendar from '../components/scheduling/WeeklyCalendar';
import MonthlyCalendar from '../components/scheduling/MonthlyCalendar';
import ClassModal from '../components/scheduling/ClassModal';
import * as scheduleService from '../services/scheduleService';
import { useNotification } from '../hooks/useNotification';

const Schedule = () => {
    const { error: showError, success: showSuccess } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        setIsLoading(true);
        try {
            const res = await scheduleService.getClasses({ limit: 100 });
            setClasses(res.data?.data || []);
        } catch (error) {
            showError('Failed to load classes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateClass = async (classData) => {
        setIsSubmitting(true);
        try {
            await scheduleService.createClass(classData);
            showSuccess('Class created successfully');
            setIsModalOpen(false);
            loadClasses(); // Refresh calendar
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to create class');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Class Schedule</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage group classes and bookings.</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant="secondary" 
                        onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
                    >
                        {viewMode === 'week' ? (
                            <><Calendar size={18} className="mr-2" /> Month View</>
                        ) : (
                            <><List size={18} className="mr-2" /> Week View</>
                        )}
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} className="mr-2" />
                        New Class
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : viewMode === 'week' ? (
                <WeeklyCalendar classes={classes} />
            ) : (
                <MonthlyCalendar classes={classes} />
            )}

            <ClassModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateClass}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default Schedule;
