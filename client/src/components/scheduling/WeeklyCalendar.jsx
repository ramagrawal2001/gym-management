import { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { clsx } from 'clsx';
import Badge from '../common/Badge';

const WeeklyCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const startDate = startOfWeek(currentDate);

    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    const classes = [
        { id: 1, name: 'Morning Yoga', time: '07:00 AM', duration: '60 min', instructor: 'Rachel Zane', date: addDays(startDate, 1), color: 'green' },
        { id: 2, name: 'HIIT Blast', time: '09:00 AM', duration: '45 min', instructor: 'Harvey Specter', date: addDays(startDate, 1), color: 'red' },
        { id: 3, name: 'Zumba Dance', time: '06:00 PM', duration: '60 min', instructor: 'Donna Paulsen', date: addDays(startDate, 2), color: 'purple' },
        { id: 4, name: 'Power Lifting', time: '05:00 PM', duration: '90 min', instructor: 'Mike Ross', date: addDays(startDate, 3), color: 'blue' },
        { id: 5, name: 'Morning Yoga', time: '07:00 AM', duration: '60 min', instructor: 'Rachel Zane', date: addDays(startDate, 4), color: 'green' },
    ];

    const getClassesForDay = (day) => {
        return classes.filter(c => isSameDay(c.date, day));
    };

    const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
    const prevWeek = () => setCurrentDate(addDays(currentDate, -7));

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
                            {getClassesForDay(day).map(session => (
                                <Card key={session.id} className={clsx(
                                    "p-3 text-left border-l-4 hover:shadow-md cursor-pointer transition-shadow",
                                    session.color === 'green' && "border-l-green-500",
                                    session.color === 'red' && "border-l-red-500",
                                    session.color === 'blue' && "border-l-blue-500",
                                    session.color === 'purple' && "border-l-purple-500",
                                )}>
                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{session.name}</h4>
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <Clock size={12} className="mr-1" />
                                        {session.time}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.instructor}</span>
                                        <Badge variant="gray" className="text-[10px] px-1.5 py-0">12/20</Badge>
                                    </div>
                                </Card>
                            ))}
                            <button className="w-full py-2 text-xs text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg border border-dashed border-gray-200 dark:border-slate-700 transition-colors">
                                + Add Class
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeeklyCalendar;
