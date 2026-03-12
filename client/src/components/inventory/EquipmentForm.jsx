import { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_CONDITIONS, EQUIPMENT_STATUSES } from '../../utils/constants';

const Section = ({ title, children }) => (
    <div className="py-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {children}
        </div>
    </div>
);

const EquipmentForm = ({ equipment = null, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'cardio',
        brand: '',
        model: '',
        purchaseDate: '',
        purchasePrice: '',
        condition: 'good',
        status: 'operational',
        location: '',
        lastService: '',
        nextService: '',
        serviceInterval: 90,
        notes: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (equipment) {
            setFormData({
                name: equipment.name || '',
                category: equipment.category || 'cardio',
                brand: equipment.brand || '',
                model: equipment.model || '',
                purchaseDate: equipment.purchaseDate ? new Date(equipment.purchaseDate).toISOString().split('T')[0] : '',
                purchasePrice: equipment.purchasePrice || '',
                condition: equipment.condition || 'good',
                status: equipment.status || 'operational',
                location: equipment.location || '',
                lastService: equipment.lastService ? new Date(equipment.lastService).toISOString().split('T')[0] : '',
                nextService: equipment.nextService ? new Date(equipment.nextService).toISOString().split('T')[0] : '',
                serviceInterval: equipment.serviceInterval || 90,
                notes: equipment.notes || ''
            });
        }
    }, [equipment]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Auto-calculate nextService when lastService or serviceInterval changes
        if (name === 'lastService' || name === 'serviceInterval') {
            if (name === 'lastService' && value && formData.serviceInterval) {
                const nextServiceDate = new Date(value);
                nextServiceDate.setDate(nextServiceDate.getDate() + parseInt(formData.serviceInterval));
                setFormData(prev => ({
                    ...prev,
                    [name]: value,
                    nextService: nextServiceDate.toISOString().split('T')[0]
                }));
            } else if (name === 'serviceInterval' && value && formData.lastService) {
                const nextServiceDate = new Date(formData.lastService);
                nextServiceDate.setDate(nextServiceDate.getDate() + parseInt(value));
                setFormData(prev => ({
                    ...prev,
                    [name]: value,
                    nextService: nextServiceDate.toISOString().split('T')[0]
                }));
            }
        }
        
        // Auto-update status based on condition
        if (name === 'condition') {
            let newStatus = formData.status;
            if (value === 'needs_repair') {
                newStatus = 'out_of_order';
            } else if (value === 'poor') {
                newStatus = 'maintenance_due';
            } else if (value === 'excellent' || value === 'good' || value === 'fair') {
                newStatus = 'operational';
            }
            setFormData(prev => ({ ...prev, condition: value, status: newStatus }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name || !formData.name.trim()) {
            setError('Equipment name is required.');
            return;
        }
        if (!formData.category) {
            setError('Category is required.');
            return;
        }
        if (formData.serviceInterval && formData.serviceInterval < 0) {
            setError('Service interval must be a positive number.');
            return;
        }
        if (formData.purchasePrice && formData.purchasePrice < 0) {
            setError('Purchase price must be a positive number.');
            return;
        }

        setIsLoading(true);

        // Prepare payload
        const payload = {
            ...formData,
            purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
            serviceInterval: formData.serviceInterval ? parseInt(formData.serviceInterval) : undefined,
            purchaseDate: formData.purchaseDate || undefined,
            lastService: formData.lastService || undefined,
            nextService: formData.nextService || undefined
        };

        // Remove empty strings
        Object.keys(payload).forEach(key => {
            if (payload[key] === '') {
                payload[key] = undefined;
            }
        });

        try {
            await onSubmit(payload);
        } catch (error) {
            setError(error.message || 'Failed to save equipment');
        } finally {
            setIsLoading(false);
        }
    };

    const categoryOptions = [
        { value: EQUIPMENT_CATEGORIES.CARDIO, label: 'Cardio' },
        { value: EQUIPMENT_CATEGORIES.STRENGTH, label: 'Strength' },
        { value: EQUIPMENT_CATEGORIES.FUNCTIONAL, label: 'Functional' },
        { value: EQUIPMENT_CATEGORIES.ACCESSORIES, label: 'Accessories' },
        { value: EQUIPMENT_CATEGORIES.OTHER, label: 'Other' }
    ];

    const conditionOptions = [
        { value: EQUIPMENT_CONDITIONS.EXCELLENT, label: 'Excellent' },
        { value: EQUIPMENT_CONDITIONS.GOOD, label: 'Good' },
        { value: EQUIPMENT_CONDITIONS.FAIR, label: 'Fair' },
        { value: EQUIPMENT_CONDITIONS.POOR, label: 'Poor' },
        { value: EQUIPMENT_CONDITIONS.NEEDS_REPAIR, label: 'Needs Repair' }
    ];

    const statusOptions = [
        { value: EQUIPMENT_STATUSES.OPERATIONAL, label: 'Operational' },
        { value: EQUIPMENT_STATUSES.MAINTENANCE_DUE, label: 'Maintenance Due' },
        { value: EQUIPMENT_STATUSES.OUT_OF_ORDER, label: 'Out of Order' },
        { value: EQUIPMENT_STATUSES.RETIRED, label: 'Retired' }
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-4">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <Section title="Basic Information">
                <div className="md:col-span-2">
                    <Input 
                        label="Equipment Name" 
                        name="name" 
                        placeholder="e.g., Technogym Treadmill" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <select 
                        name="category" 
                        value={formData.category} 
                        onChange={handleChange} 
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                        required
                    >
                        {categoryOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <Input 
                    label="Brand" 
                    name="brand" 
                    placeholder="e.g., Technogym" 
                    value={formData.brand} 
                    onChange={handleChange} 
                />
                <Input 
                    label="Model" 
                    name="model" 
                    placeholder="e.g., Run 500" 
                    value={formData.model} 
                    onChange={handleChange} 
                />
                <Input 
                    label="Location" 
                    name="location" 
                    placeholder="e.g., Cardio Zone, Floor 1" 
                    value={formData.location} 
                    onChange={handleChange} 
                />
            </Section>

            <Section title="Purchase Information">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Purchase Date
                    </label>
                    <input 
                        type="date" 
                        name="purchaseDate" 
                        value={formData.purchaseDate} 
                        onChange={handleChange} 
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    />
                </div>
                <Input 
                    label="Purchase Price" 
                    name="purchasePrice" 
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder="0.00" 
                    value={formData.purchasePrice} 
                    onChange={handleChange} 
                />
            </Section>

            <Section title="Status & Condition">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Condition <span className="text-red-500">*</span>
                    </label>
                    <select 
                        name="condition" 
                        value={formData.condition} 
                        onChange={handleChange} 
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                        required
                    >
                        {conditionOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status <span className="text-red-500">*</span>
                    </label>
                    <select 
                        name="status" 
                        value={formData.status} 
                        onChange={handleChange} 
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                        required
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </Section>

            <Section title="Maintenance & Service">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Service Date
                    </label>
                    <input 
                        type="date" 
                        name="lastService" 
                        value={formData.lastService} 
                        onChange={handleChange} 
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Next Service Date
                    </label>
                    <input 
                        type="date" 
                        name="nextService" 
                        value={formData.nextService} 
                        onChange={handleChange} 
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    />
                </div>
                <Input 
                    label="Service Interval (days)" 
                    name="serviceInterval" 
                    type="number" 
                    min="1"
                    placeholder="90" 
                    value={formData.serviceInterval} 
                    onChange={handleChange} 
                />
            </Section>

            <Section title="Additional Information">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes
                    </label>
                    <textarea 
                        name="notes" 
                        value={formData.notes} 
                        onChange={handleChange} 
                        rows="4" 
                        className="block w-full rounded-lg border border-gray-300 bg-white p-2 shadow-sm sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                        placeholder="Additional notes about the equipment..."
                    />
                </div>
            </Section>

            <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" onClick={onCancel} type="button" disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                    {equipment ? 'Update Equipment' : 'Add Equipment'}
                </Button>
            </div>
        </form>
    );
};

export default EquipmentForm;


