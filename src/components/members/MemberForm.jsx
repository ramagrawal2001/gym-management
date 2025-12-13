import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import * as planService from '../../services/planService';
import * as memberService from '../../services/memberService';
import * as authService from '../../services/authService';

const MemberForm = ({ member = null, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        userId: '',
        planId: '',
        subscriptionStart: '',
        subscriptionEnd: '',
        status: 'active'
    });
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadPlans();
        if (member) {
            const user = member.userId;
            setFormData({
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                email: user?.email || '',
                phone: user?.phone || '',
                userId: user?._id || member.userId || '',
                planId: member.planId?._id || member.planId || '',
                subscriptionStart: member.subscriptionStart ? new Date(member.subscriptionStart).toISOString().split('T')[0] : '',
                subscriptionEnd: member.subscriptionEnd ? new Date(member.subscriptionEnd).toISOString().split('T')[0] : '',
                status: member.status || 'active'
            });
        }
    }, [member]);

    const loadPlans = async () => {
        try {
            const response = await planService.getPlans({ isActive: true });
            setPlans(response.data?.data || response.data || []);
        } catch (error) {
            console.error('Failed to load plans:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            let userId = formData.userId;
            
            // If creating new member and no userId, create user first
            if (!member && !userId && formData.email) {
                try {
                    const userResponse = await authService.register({
                        email: formData.email,
                        password: 'TempPassword123!', // Temporary password, should be changed
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        phone: formData.phone,
                        role: 'member'
                    });
                    userId = userResponse.data?.data?.user?.id || userResponse.data?.user?.id;
                } catch (userError) {
                    // If user already exists, try to get by email
                    if (userError.response?.status === 400) {
                        setError('User with this email already exists. Please use existing user.');
                        setIsLoading(false);
                        return;
                    }
                    throw userError;
                }
            }

            const memberData = {
                userId: userId || formData.userId,
                planId: formData.planId,
                subscriptionStart: formData.subscriptionStart,
                subscriptionEnd: formData.subscriptionEnd,
                status: formData.status
            };

            if (member) {
                // Update existing member
                await memberService.updateMember(member._id, memberData);
            }
            
            await onSubmit(member ? { ...memberData, _id: member._id } : memberData);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to save member');
            console.error('Error saving member:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {!member && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="First Name" 
                            name="firstName"
                            placeholder="John" 
                            value={formData.firstName}
                            onChange={handleChange}
                            required 
                        />
                        <Input 
                            label="Last Name" 
                            name="lastName"
                            placeholder="Doe" 
                            value={formData.lastName}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <Input 
                        label="Email Address" 
                        name="email"
                        type="email" 
                        placeholder="john@example.com" 
                        value={formData.email}
                        onChange={handleChange}
                        required 
                    />
                    <Input 
                        label="Phone Number" 
                        name="phone"
                        type="tel" 
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </>
            )}

            {member && (
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Member:</strong> {member.userId?.firstName} {member.userId?.lastName} ({member.userId?.email})
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Membership Plan</label>
                    <select 
                        name="planId"
                        value={formData.planId}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                        required
                    >
                        <option value="">Select a plan</option>
                        {plans.map(plan => (
                            <option key={plan._id} value={plan._id}>
                                {plan.name} - {plan.duration} (${plan.price})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select 
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    >
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="suspended">Suspended</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                    <input 
                        type="date" 
                        name="subscriptionStart"
                        value={formData.subscriptionStart}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                    <input 
                        type="date" 
                        name="subscriptionEnd"
                        value={formData.subscriptionEnd}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                        required
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <Button variant="ghost" onClick={onCancel} type="button" disabled={isLoading}>Cancel</Button>
                <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                    {member ? 'Update' : 'Add'} Member
                </Button>
            </div>
        </form>
    );
};

export default MemberForm;
