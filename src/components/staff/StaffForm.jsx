import { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import ImageUpload from '../common/ImageUpload';

const Section = ({ title, children }) => (
    <div className="py-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {children}
        </div>
    </div>
);

const StaffForm = ({ staff = null, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        // User fields
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        // Staff fields
        userId: '',
        specialty: '',
        certifications: [],
        schedule: '',
        hourlyRate: '',
        isActive: true
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [certificationsInput, setCertificationsInput] = useState('');

    useEffect(() => {
        if (staff) {
            const user = staff.userId || {};
            const certifications = staff.certifications || [];
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                userId: user._id || staff.userId || '',
                specialty: staff.specialty || '',
                schedule: staff.schedule || '',
                hourlyRate: staff.hourlyRate || '',
                isActive: staff.isActive !== undefined ? staff.isActive : true
            });
            // Set certifications as comma-separated string for input
            setCertificationsInput(
                certifications.map(c => `${c.name}${c.issuer ? ` (${c.issuer})` : ''}${c.date ? ` - ${new Date(c.date).toLocaleDateString()}` : ''}`).join(', ')
            );
            // Set profile image preview if exists
            if (staff.profileImage?.url) {
                setProfileImageFile(staff.profileImage.url);
            }
        }
    }, [staff]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const parseCertifications = (input) => {
        if (!input || !input.trim()) return [];
        
        // Parse comma-separated certifications
        // Format: "Name (Issuer) - Date" or just "Name"
        return input.split(',').map(item => {
            const trimmed = item.trim();
            const match = trimmed.match(/^(.+?)(?:\s*\(([^)]+)\))?(?:\s*-\s*(.+))?$/);
            
            if (match) {
                const [, name, issuer, dateStr] = match;
                const cert = { name: name.trim() };
                if (issuer) cert.issuer = issuer.trim();
                if (dateStr) {
                    const date = new Date(dateStr.trim());
                    if (!isNaN(date.getTime())) {
                        cert.date = date;
                    }
                }
                return cert;
            }
            
            return { name: trimmed };
        }).filter(c => c.name);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // --- VALIDATION ---
        if (!formData.firstName || !formData.lastName || !formData.email) {
            setError('First name, last name, and email are required.');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }
        
        // Validate hourlyRate if provided
        if (formData.hourlyRate && formData.hourlyRate !== '') {
            const rate = parseFloat(formData.hourlyRate);
            if (isNaN(rate) || rate < 0) {
                setError('Hourly rate must be a positive number.');
                return;
            }
        }
        // --- END VALIDATION ---

        setIsLoading(true);

        // Parse certifications
        const certifications = parseCertifications(certificationsInput);
        
        const payload = {
            ...formData,
            certifications,
            hourlyRate: formData.hourlyRate && formData.hourlyRate !== '' ? parseFloat(formData.hourlyRate) : undefined,
            profileImageFile // Pass the file separately for FormData handling
        };

        if (staff) {
            payload._id = staff._id; // Add staff's own ID for update
        }

        try {
            await onSubmit(payload);
        } catch (error) {
            setError(error.message || 'Failed to save staff');
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
            </Section>

            <Section title="Professional Details">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialty</label>
                    <input 
                        type="text" 
                        name="specialty" 
                        value={formData.specialty} 
                        onChange={handleChange}
                        placeholder="e.g., Personal Training, Yoga, Crossfit"
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hourly Rate ($)</label>
                    <input 
                        type="number" 
                        name="hourlyRate" 
                        value={formData.hourlyRate} 
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certifications</label>
                    <input 
                        type="text" 
                        value={certificationsInput} 
                        onChange={(e) => setCertificationsInput(e.target.value)}
                        placeholder="e.g., NASM CPT (National Academy), ACE Certified - 2020-01-15 (comma-separated)"
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Format: Name (Issuer) - Date or just Name. Separate multiple with commas.
                    </p>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Schedule</label>
                    <textarea 
                        name="schedule" 
                        value={formData.schedule} 
                        onChange={handleChange} 
                        rows="3" 
                        placeholder="e.g., Monday-Friday: 9 AM - 5 PM"
                        className="block w-full rounded-lg border border-gray-300 bg-white p-2 shadow-sm sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    />
                </div>
                {staff && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <select 
                            name="isActive" 
                            value={formData.isActive} 
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))} 
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                        >
                            <option value={true}>Active</option>
                            <option value={false}>Inactive</option>
                        </select>
                    </div>
                )}
            </Section>

            <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" onClick={onCancel} type="button" disabled={isLoading}>Cancel</Button>
                <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                    {staff ? 'Update Staff' : 'Add Staff'}
                </Button>
            </div>
        </form>
    );
};

export default StaffForm;
