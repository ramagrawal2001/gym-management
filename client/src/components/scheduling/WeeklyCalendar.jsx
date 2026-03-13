import { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { clsx } from 'clsx';
import Badge from '../common/Badge';

const WeeklyCalendar = ({ classes = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const startDate = startOfWeek(currentDate);

    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    const getClassesForDay = (day) => {
        const dayIndex = day.getDay(); // 0 is Sunday, 1 is Monday...
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

    const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
    const prevWeek = () => setCurrentDate(addDays(currentDate, -7));

    // Assign colors based on index or hash to make it look nice
    const colors = ['border-l-green-500', 'border-l-blue-500', 'border-l-purple-500', 'border-l-red-500', 'border-l-yellow-500'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {format(startDate, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={prevWeek} size="sm"><ChevronLeft size={20} /></Button>
                    <Button variant="secondary" onClick={nextWeek} size="sm"><ChevronRight size={20} /></Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weekDays.map((day, idx) => (
                    <div key={idx} className="space-y-3">
                        <div className={clsx(
                            "text-center p-3 rounded-lg border",
                            isSameDay(day, new Date())
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                        )}>
                            <div className="text-xs font-medium opacity-80">{format(day, 'EEE')}</div>
                            <div className="text-lg font-bold">{format(day, 'd')}</div>
                        </div>

                        <div className="space-y-2">
                            {getClassesForDay(day).map((session, i) => (
                                <Card key={session._id} className={clsx(
                                    "p-3 text-left border-l-4 hover:shadow-md cursor-pointer transition-shadow",
                                    colors[i % colors.length]
                                )}>
                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{session.name}</h4>
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <Clock size={12} className="mr-1" />
                                        {session.schedule?.startTime} - {session.schedule?.endTime}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {session.trainerId?.firstName} {session.trainerId?.lastName}
                                        </span>
                                        <Badge variant="gray" className="text-[10px] px-1.5 py-0">
                                            {session.bookings?.length || 0}/{session.capacity}
                                        </Badge>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeeklyCalendar;
