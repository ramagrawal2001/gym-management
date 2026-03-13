import { useState } from 'react';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    addMonths, 
    subMonths, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay 
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../common/Button';
import { clsx } from 'clsx';
import Badge from '../common/Badge';

const MonthlyCalendar = ({ classes = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "MMMM yyyy";
    const days = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const getClassesForDay = (day) => {
        const dayIndex = day.getDay();
        const targetDate = new Date(day);
        targetDate.setHours(0,0,0,0);

        return classes.filter(c => {
            if (c.isRecurring) {
                // Must match day of week
                if (c.schedule?.dayOfWeek !== dayIndex) return false;
                
                const classStart = new Date(c.startDate);
                classStart.setHours(0,0,0,0);
                
                // Class hasn't started yet
                if (targetDate < classStart) return false;
                
                // Class has expired
                if (c.endDate) {
                    const classEnd = new Date(c.endDate);
                    classEnd.setHours(23,59,59,999);
                    if (targetDate > classEnd) return false;
                }
                return true;
            } else {
                // Non-recurring: must match EXACT date
                const classStart = new Date(c.startDate);
                classStart.setHours(0,0,0,0);
                return classStart.getTime() === targetDate.getTime();
            }
        });
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const colors = ['bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200',
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
                    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200',
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200'];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {format(currentDate, dateFormat)}
                </h2>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={prevMonth} size="sm"><ChevronLeft size={20} /></Button>
                    <Button variant="secondary" onClick={nextMonth} size="sm"><ChevronRight size={20} /></Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-slate-700 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                {/* Headers */}
                {weekDays.map(day => (
                    <div key={day} className="bg-gray-50 dark:bg-slate-800 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {day}
                    </div>
                ))}
                
                {/* Days Grid */}
                {days.map((day, idx) => {
                    const dayClasses = getClassesForDay(day);
                    return (
                        <div 
                            key={day.toString()} 
                            className={clsx(
                                "min-h-[100px] bg-white dark:bg-slate-900 p-2",
                                !isSameMonth(day, monthStart) && "bg-gray-50 dark:bg-slate-800/50 opacity-50",
                                isSameDay(day, new Date()) && "ring-2 ring-inset ring-blue-500"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={clsx(
                                    "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                                    isSameDay(day, new Date()) ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300"
                                )}>
                                    {format(day, 'd')}
                                </span>
                            </div>
                            
                            <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                                {dayClasses.map((session, i) => (
                                    <div 
                                        key={session._id} 
                                        className={clsx(
                                            "text-[10px] px-1.5 py-1 rounded truncate border",
                                            colors[i % colors.length]
                                        )}
                                        title={`${session.name} (${session.schedule?.startTime})`}
                                    >
                                        <span className="font-semibold">{session.schedule?.startTime}</span> {session.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthlyCalendar;
