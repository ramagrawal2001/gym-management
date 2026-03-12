import { useState, useEffect } from 'react';
import { Calendar, Clock, User, X } from 'lucide-react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/common/Table';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import * as classService from '../services/scheduleService';
import { useNotification } from '../hooks/useNotification';
import { formatDate } from '../utils/formatDate';
import { useRole } from '../hooks/useRole';
import { Navigate } from 'react-router-dom';

const MemberClasses = () => {
    const { isMember } = useRole();
    const { success: showSuccess, error: showError } = useNotification();
    const [availableClasses, setAvailableClasses] = useState([]);
    const [bookedClasses, setBookedClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isMember()) {
            loadClasses();
        }
    }, [isMember]);

    if (!isMember()) {
        return <Navigate to="/unauthorized" replace />;
    }

    const loadClasses = async () => {
        setIsLoading(true);
        try {
            const response = await classService.getAvailableClasses({ page: 1, limit: 100 });
            const classes = response.data?.data || response.data || [];
            const allClasses = Array.isArray(classes) ? classes : [];

            // Separate available and booked classes
            const available = [];
            const booked = [];

            allClasses.forEach(classItem => {
                const isBooked = classItem.bookings?.some(booking => {
                    // Check if current user's member record is in bookings
                    // This would need memberId matching logic
                    return booking.memberId;
                });

                if (isBooked) {
                    booked.push(classItem);
                } else {
                    available.push(classItem);
                }
            });

            setAvailableClasses(available);
            setBookedClasses(booked);
        } catch (error) {
            showError('Failed to load classes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBookClass = async (classId) => {
        try {
            await classService.bookClass(classId);
            showSuccess('Class booked successfully');
            loadClasses();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to book class');
        }
    };

    const handleCancelBooking = async (classId, bookingId) => {
        try {
            await classService.cancelBooking(classId, bookingId);
            showSuccess('Booking cancelled successfully');
            loadClasses();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const getDayName = (dayOfWeek) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayOfWeek] || 'Unknown';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Classes</h1>
                <p className="text-gray-500 dark:text-gray-400">View and manage your class bookings</p>
            </div>

            {isLoading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : (
                <>
                    {/* Booked Classes */}
                    {bookedClasses.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Bookings</h2>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Class Name</TableHead>
                                        <TableHead>Day</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Trainer</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookedClasses.map((classItem) => (
                                        <TableRow key={classItem._id}>
                                            <TableCell className="font-medium">{classItem.name}</TableCell>
                                            <TableCell>{getDayName(classItem.schedule?.dayOfWeek)}</TableCell>
                                            <TableCell>
                                                {classItem.schedule?.startTime} - {classItem.schedule?.endTime}
                                            </TableCell>
                                            <TableCell>
                                                {classItem.trainerId?.firstName} {classItem.trainerId?.lastName}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const booking = classItem.bookings?.find(b => b.memberId);
                                                        if (booking) {
                                                            handleCancelBooking(classItem._id, booking._id);
                                                        }
                                                    }}
                                                >
                                                    <X size={16} className="mr-1" />
                                                    Cancel
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Available Classes */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Available Classes</h2>
                        </div>
                        {availableClasses.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                                No classes available for booking
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Class Name</TableHead>
                                        <TableHead>Day</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Trainer</TableHead>
                                        <TableHead>Capacity</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {availableClasses.map((classItem) => (
                                        <TableRow key={classItem._id}>
                                            <TableCell className="font-medium">{classItem.name}</TableCell>
                                            <TableCell>{getDayName(classItem.schedule?.dayOfWeek)}</TableCell>
                                            <TableCell>
                                                {classItem.schedule?.startTime} - {classItem.schedule?.endTime}
                                            </TableCell>
                                            <TableCell>
                                                {classItem.trainerId?.firstName} {classItem.trainerId?.lastName}
                                            </TableCell>
                                            <TableCell>
                                                {classItem.bookings?.length || 0} / {classItem.capacity}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleBookClass(classItem._id)}
                                                    disabled={(classItem.bookings?.length || 0) >= classItem.capacity}
                                                >
                                                    <Calendar size={16} className="mr-1" />
                                                    Book
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MemberClasses;

