import { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { LEAD_STATUSES, LEAD_SOURCES } from '../../utils/constants';

const LeadForm = ({ lead = null, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        status: 'new',
        source: 'walk-in',
        notes: ''
    });

    useEffect(() => {
        if (lead) {
            setFormData({
                name: lead.name || '',
                email: lead.email || '',
                phone: lead.phone || '',
                status: lead.status || 'new',
                source: lead.source || 'walk-in',
                notes: lead.notes || ''
            });
        }
    }, [lead]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
            />
            <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
            />
            <Input
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
            />
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                </label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                >
                    {Object.values(LEAD_STATUSES).map(status => (
                        <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Source
                </label>
                <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                >
                    {Object.values(LEAD_SOURCES).map(source => (
                        <option key={source} value={source}>
                            {source.charAt(0).toUpperCase() + source.slice(1).replace('-', ' ')}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                </label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="block w-full rounded-lg border border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <Button variant="ghost" onClick={onCancel} type="button">
                    Cancel
                </Button>
                <Button type="submit">
                    {lead ? 'Update' : 'Create'} Lead
                </Button>
            </div>
        </form>
    );
};

export default LeadForm;

