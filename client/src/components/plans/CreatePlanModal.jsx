import { useState, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import * as planService from '../../services/planService';

const CreatePlanModal = ({ isOpen, onClose, onSuccess, plan = null }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration: 'monthly',
        features: ['']
    });

    useEffect(() => {
        if (plan) {
            setFormData({
                name: plan.name || '',
                description: plan.description || '',
                price: plan.price || '',
                duration: plan.duration || 'monthly',
                features: plan.features && plan.features.length > 0 ? plan.features : ['']
            });
        } else {
            setFormData({
                name: '',
                description: '',
                price: '',
                duration: 'monthly',
                features: ['']
            });
        }
    }, [plan, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const addFeature = () => {
        setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
    };

    const removeFeature = (index) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.price) {
            setError('Please fill in currently required fields');
            return;
        }

        setLoading(true);
        try {
            // Filter out empty features
            const features = formData.features.filter(f => f.trim() !== '');
            const payload = {
                ...formData,
                price: Number(formData.price),
                features
            };

            if (plan) {
                await planService.updatePlan(plan._id, payload);
            } else {
                await planService.createPlan(payload);
            }
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                name: '',
                description: '',
                price: '',
                duration: 'monthly',
                features: ['']
            });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to create plan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={plan ? "Edit Plan" : "Create New Plan"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        {error}
                    </div>
                )}

                <Input
                    label="Plan Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Gold Membership"
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-gray-400"
                        placeholder="Brief description of the plan"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Price"
                        name="price"
                        type="number"
                        min="0"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Duration
                        </label>
                        <select
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                        >
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Features
                    </label>
                    <div className="space-y-2">
                        {formData.features.map((feature, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    value={feature}
                                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                                    placeholder="e.g. 24/7 Gym Access"
                                    className="flex-1"
                                />
                                {formData.features.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(index)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addFeature}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            <Plus size={16} /> Add Feature
                        </button>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={loading}>
                        {plan ? 'Update Plan' : 'Create Plan'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreatePlanModal;
