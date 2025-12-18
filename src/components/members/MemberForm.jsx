import { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import ImageUpload from '../common/ImageUpload';
import * as planService from '../../services/planService';
import { BLOOD_GROUPS } from '../../utils/constants';

const Section = ({ title, children }) => (
    <div className="py-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {children}
        </div>
    </div>
);

const MemberForm = ({ member = null, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        // User fields
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        // Member fields
        userId: '',
        planId: '',
        subscriptionStart: '',
        subscriptionEnd: '',
        status: 'active',
        bloodGroup: '',
        address: { street: '', city: '', state: '', pincode: '' },
        emergencyContact: { name: '', phone: '', relation: '' },
        medicalInfo: { conditions: '', medications: '', allergies: '' },
        workoutPlan: '',
        dietPlan: '',
        notes: ''
    });
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [profileImageFile, setProfileImageFile] = useState(null);

    useEffect(() => {
        loadPlans();
        if (member) {
            const user = member.userId || {};
            const medical = member.medicalInfo || {};
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                userId: user._id || member.userId || '',
                planId: member.planId?._id || member.planId || '',
                subscriptionStart: member.subscriptionStart ? new Date(member.subscriptionStart).toISOString().split('T')[0] : '',
                subscriptionEnd: member.subscriptionEnd ? new Date(member.subscriptionEnd).toISOString().split('T')[0] : '',
                status: member.status || 'active',
                bloodGroup: member.bloodGroup || '',
                address: { ...{ street: '', city: '', state: '', pincode: '' }, ...member.address },
                emergencyContact: { ...{ name: '', phone: '', relation: '' }, ...member.emergencyContact },
                medicalInfo: {
                    conditions: medical.conditions?.join(', ') || '',
                    medications: medical.medications?.join(', ') || '',
                    allergies: medical.allergies?.join(', ') || ''
                },
                workoutPlan: member.workoutPlan || '',
                dietPlan: member.dietPlan || '',
                notes: member.notes || ''
            });
            // Set profile image preview if exists
            if (member.profileImage?.url) {
                setProfileImageFile(member.profileImage.url);
            }
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
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // --- VALIDATION ---
        if (!formData.firstName || !formData.lastName || !formData.email) {
            setError('First name, last name, and email are required.');
            return;
        }
        if (!formData.planId) {
            setError('Please select a membership plan.');
            return;
        }
        if (!formData.subscriptionStart || !formData.subscriptionEnd) {
            setError('Subscription start and end dates are required.');
            return;
        }
        if (new Date(formData.subscriptionEnd) < new Date(formData.subscriptionStart)) {
            setError('Subscription end date cannot be before the start date.');
            return;
        }
        // --- END VALIDATION ---

        setIsLoading(true);

        // Create payload, converting medical info strings to arrays
        const medicalInfo = {
            conditions: formData.medicalInfo.conditions?.split(',').map(s => s.trim()).filter(Boolean) || [],
            medications: formData.medicalInfo.medications?.split(',').map(s => s.trim()).filter(Boolean) || [],
            allergies: formData.medicalInfo.allergies?.split(',').map(s => s.trim()).filter(Boolean) || [],
        };
        
        const payload = {
            ...formData,
            medicalInfo,
            profileImageFile // Pass the file separately for FormData handling
        };

        if (member) {
            payload._id = member._id; // Add member's own ID for update
        }

        try {
            await onSubmit(payload);
        } catch (error) {
            setError(error.message || 'Failed to save member');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-4">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <Section title="Personal Information">
                <div className="md:col-span-2">
                    <ImageUpload
                        label="Profile Photo"
                        value={profileImageFile}
                        onChange={(file) => {
                            setProfileImageFile(file);
                        }}
                        enableCamera={true}
                        error={error && !formData.firstName ? 'Profile photo is optional' : ''}
                    />
                </div>
                <Input label="First Name" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} required />
                <Input label="Last Name" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
                <Input label="Email Address" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
                <Input label="Phone Number" name="phone" type="tel" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} />
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white">
                        <option value="">Select Blood Group</option>
                        {BLOOD_GROUPS.map(group => <option key={group} value={group}>{group}</option>)}
                    </select>
                </div>
            </Section>

            <Section title="Address">
                <Input label="Street" name="address.street" placeholder="123 Main St" value={formData.address.street} onChange={handleChange} />
                <Input label="City" name="address.city" placeholder="Anytown" value={formData.address.city} onChange={handleChange} />
                <Input label="State" name="address.state" placeholder="CA" value={formData.address.state} onChange={handleChange} />
                <Input label="Pincode" name="address.pincode" placeholder="12345" value={formData.address.pincode} onChange={handleChange} />
            </Section>

            <Section title="Emergency Contact">
                <Input label="Full Name" name="emergencyContact.name" placeholder="Jane Doe" value={formData.emergencyContact.name} onChange={handleChange} />
                <Input label="Phone Number" name="emergencyContact.phone" type="tel" placeholder="+1 (555) 111-2222" value={formData.emergencyContact.phone} onChange={handleChange} />
                <Input label="Relation" name="emergencyContact.relation" placeholder="Spouse" value={formData.emergencyContact.relation} onChange={handleChange} />
            </Section>

            <Section title="Medical Information">
                <Input label="Medical Conditions" name="medicalInfo.conditions" placeholder="e.g., Asthma, Diabetes (comma-separated)" value={formData.medicalInfo.conditions} onChange={handleChange} />
                <Input label="Current Medications" name="medicalInfo.medications" placeholder="e.g., Inhaler (comma-separated)" value={formData.medicalInfo.medications} onChange={handleChange} />
                <Input label="Allergies" name="medicalInfo.allergies" placeholder="e.g., Peanuts, Penicillin (comma-separated)" value={formData.medicalInfo.allergies} onChange={handleChange} />
            </Section>

            <Section title="Plans & Notes">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Workout Plan</label>
                    <textarea name="workoutPlan" value={formData.workoutPlan} onChange={handleChange} rows="3" className="block w-full rounded-lg border border-gray-300 bg-white p-2 shadow-sm sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diet Plan</label>
                    <textarea name="dietPlan" value={formData.dietPlan} onChange={handleChange} rows="3" className="block w-full rounded-lg border border-gray-300 bg-white p-2 shadow-sm sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="block w-full rounded-lg border border-gray-300 bg-white p-2 shadow-sm sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
                </div>
            </Section>
            
            <Section title="Membership Details">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Membership Plan</label>
                    <select name="planId" value={formData.planId} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white" required>
                        <option value="">Select a plan</option>
                        {plans.map(plan => <option key={plan._id} value={plan._id}>{plan.name} - {plan.duration} (${plan.price})</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white">
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="suspended">Suspended</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                    <input type="date" name="subscriptionStart" value={formData.subscriptionStart} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                    <input type="date" name="subscriptionEnd" value={formData.subscriptionEnd} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white" required />
                </div>
            </Section>

            <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" onClick={onCancel} type="button" disabled={isLoading}>Cancel</Button>
                <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                    {member ? 'Update Member' : 'Add Member'}
                </Button>
            </div>
        </form>
    );
};

export default MemberForm;