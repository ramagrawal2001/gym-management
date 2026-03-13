import { useState, useEffect } from 'react';

import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import * as staffService from '../../services/staffService';
import { useNotification } from '../../hooks/useNotification';

const DAYS_OF_WEEK = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
];

const ClassModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
    const { error: showError } = useNotification();
    const [trainers, setTrainers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Simple state form for simplicity instead of complete react-hook-form if not pre-configured
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        trainerId: '',
        capacity: 20,
        dayOfWeek: 1,
        startTime: '07:00',
        endTime: '08:00',
        isRecurring: true,
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
    });

    useEffect(() => {
        if (isOpen) {
            loadTrainers();
            setFormData({
                name: '',
                description: '',
                trainerId: '',
                capacity: 20,
                dayOfWeek: 1,
                startTime: '07:00',
                endTime: '08:00',
                isRecurring: true,
                startDate: new Date().toISOString().split('T')[0],
                endDate: ''
            });
        }
    }, [isOpen]);

    const loadTrainers = async () => {
        setIsLoading(true);
        try {
            const res = await staffService.getStaff({ limit: 100, isActive: true });
            const staffList = res.data?.data || [];
            setTrainers(staffList);
            if (staffList.length > 0 && !formData.trainerId) {
                setFormData(prev => ({ ...prev, trainerId: staffList[0].userId._id }));
            }
        } catch (error) {
            showError('Failed to load trainers');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const calculateDuration = (start, end) => {
        const [startHours, startMinutes] = start.split(':').map(Number);
        const [endHours, endMinutes] = end.split(':').map(Number);
        return (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const duration = calculateDuration(formData.startTime, formData.endTime);
        if (duration <= 0) {
            showError('End time must be after start time');
            return;
        }

        const submitData = {
            name: formData.name,
            description: formData.description,
            trainerId: formData.trainerId,
            capacity: Number(formData.capacity),
            isRecurring: formData.isRecurring,
            startDate: formData.startDate,
            endDate: formData.isRecurring ? formData.endDate : formData.startDate,
            schedule: {
                dayOfWeek: Number(formData.dayOfWeek),
                startTime: formData.startTime,
                endTime: formData.endTime,
                duration
            }
        };

        onSubmit(submitData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Class" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Class Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Morning Yoga"
                />

                <Input
                    label="Description (Optional)"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Class details..."
                />

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trainer</label>
                    <select
                        name="trainerId"
                        value={formData.trainerId}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    >
                        <option value="" disabled>Select a Trainer...</option>
                        {trainers.map(t => (
                            <option key={t._id} value={t.userId._id}>
                                {t.userId.firstName} {t.userId.lastName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Day of Week</label>
                        <select
                            name="dayOfWeek"
                            value={formData.dayOfWeek}
                            onChange={handleChange}
                            required
                            disabled={!formData.isRecurring}
                            className={`w-full rounded-lg border border-gray-300 bg-white py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white ${!formData.isRecurring ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {DAYS_OF_WEEK.map(d => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </div>

                    <Input
                        type="number"
                        label="Capacity"
                        name="capacity"
                        min="1"
                        value={formData.capacity}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        type="time"
                        label="Start Time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        type="time"
                        label="End Time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <input
                        type="checkbox"
                        id="isRecurring"
                        name="isRecurring"
                        checked={formData.isRecurring}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isRecurring" className="text-sm text-gray-700 dark:text-gray-300">
                        Repeats weekly (Select day to recur on)
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        type="date"
                        label={formData.isRecurring ? "Starts From" : "Date"}
                        name="startDate"
                        value={formData.startDate}
                        onChange={(e) => {
                            handleChange(e);
                            if (!formData.isRecurring) {
                                // Sync dayOfWeek if it's a single date
                                const d = new Date(e.target.value);
                                setFormData(prev => ({ ...prev, dayOfWeek: d.getDay() }));
                            }
                        }}
                        required
                    />
                    {formData.isRecurring && (
                        <Input
                            type="date"
                            label="Ends On (Optional)"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            min={formData.startDate}
                        />
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isLoading}>
                        {isSubmitting ? 'Creating...' : 'Create Class'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ClassModal;
