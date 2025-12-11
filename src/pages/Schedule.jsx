import { Calendar, Plus } from 'lucide-react';
import Button from '../components/common/Button';
import WeeklyCalendar from '../components/scheduling/WeeklyCalendar';

const Schedule = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Class Schedule</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage group classes and bookings.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary">
                        <Calendar size={18} className="mr-2" />
                        Month View
                    </Button>
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Class
                    </Button>
                </div>
            </div>

            <WeeklyCalendar />
        </div>
    );
};

export default Schedule;
