import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import Button from '../common/Button';
import { getMembers } from '../../services/memberService';
import * as workoutPlanService from '../../services/workoutPlanService';

const AssignPlanModal = ({ isOpen, onClose, onSuccess, plan, type = 'workout' }) => {
    const [members, setMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadMembers();
            setSelectedMembers(new Set());
        }
    }, [isOpen]);

    const loadMembers = async () => {
        try {
            setIsLoading(true);
            const response = await getMembers();
            setMembers(response.data?.data || []);
        } catch (error) {
            console.error('Failed to load members:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMember = (memberId) => {
        const next = new Set(selectedMembers);
        if (next.has(memberId)) {
            next.delete(memberId);
        } else {
            next.add(memberId);
        }
        setSelectedMembers(next);
    };

    const toggleAll = () => {
        if (selectedMembers.size === filteredMembers.length && filteredMembers.length > 0) {
            setSelectedMembers(new Set());
        } else {
            setSelectedMembers(new Set(filteredMembers.map(m => m._id)));
        }
    };

    const onSubmit = async () => {
        if (selectedMembers.size === 0) return;
        try {
            setIsSubmitting(true);
            const memberIds = Array.from(selectedMembers);

            // It could be used for diet or workout
            if (type === 'workout') {
                await workoutPlanService.assignWorkoutPlan(plan._id, memberIds);
            } else {
                // assume dietPlanService works similarly, we'll implement it next
                const { assignDietPlan } = await import('../../services/dietPlanService');
                await assignDietPlan(plan._id, memberIds);
            }
            onSuccess(selectedMembers.size);
            onClose();
        } catch (error) {
            console.error('Failed to assign plan:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredMembers = members.filter(m =>
        (m.userId?.firstName + " " + m.userId?.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.userId?.phone?.includes(searchQuery)
    );

    if (!isOpen || !plan) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Assign {type === 'workout' ? 'Workout' : 'Diet'} Plan
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 flex flex-col flex-1 min-h-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Select members to assign to **{plan.name}**.
                    </p>

                    <input
                        type="text"
                        placeholder="Search members..."
                        className="w-full px-4 py-2 border rounded-lg mb-4 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <div className="flex justify-between items-center mb-2 px-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Members</span>
                        <button
                            type="button"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            onClick={toggleAll}
                        >
                            {selectedMembers.size === filteredMembers.length && filteredMembers.length > 0 ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    <div className="overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-lg flex-1 min-h-[200px]">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredMembers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">No members found.</div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-slate-800">
                                {filteredMembers.map(member => (
                                    <label
                                        key={member._id}
                                        className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
                                    >
                                        <div className="relative flex items-center justify-center w-5 h-5 mr-3 border rounded border-gray-300 dark:border-slate-600 shrink-0">
                                            <input
                                                type="checkbox"
                                                className="absolute opacity-0 w-full h-full cursor-pointer"
                                                checked={selectedMembers.has(member._id)}
                                                onChange={() => toggleMember(member._id)}
                                            />
                                            {selectedMembers.has(member._id) && <Check size={14} className="text-blue-600 pointer-events-none" />}
                                            <div className={`absolute inset-0 rounded pointer-events-none ${selectedMembers.has(member._id) ? 'border-2 border-blue-600' : ''}`}></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {member.userId?.firstName} {member.userId?.lastName}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {member.userId?.phone}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-slate-800 shrink-0">
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} isLoading={isSubmitting} disabled={selectedMembers.size === 0}>
                        Assign to {selectedMembers.size} Member(s)
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AssignPlanModal;
