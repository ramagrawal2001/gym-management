import { Plus, Check, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

const plansData = [
    { id: 1, name: 'Basic Yoga', price: 50, duration: '1 Month', features: ['Access to Yoga classes', 'Locker access', 'Water dispenser'] },
    { id: 2, name: 'Pro Fitness', price: 120, duration: '3 Months', features: ['Gym floor access', 'Cardio zone', 'Locker + Shower', '1 PT Session'] },
    { id: 3, name: 'Elite Performance', price: 400, duration: '1 Year', features: ['All access', 'Unlimited PT', 'Nutrition consult', 'Merch pack'], recommended: true },
];

const Plans = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Membership Plans</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage pricing and packages</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} className="mr-2" />
                    Create Plan
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plansData.map((plan) => (
                    <Card key={plan.id} className="relative flex flex-col h-full border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
                        {plan.recommended && (
                            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                                <Badge variant="warning" className="shadow-sm">Best Value</Badge>
                            </div>
                        )}
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                            <div className="mt-2 flex items-baseline">
                                <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                                <span className="text-gray-500 ml-1">/ {plan.duration}</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-3 mb-6">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center text-sm text-gray-600">
                                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                        <div className="flex space-x-3 pt-4 border-t border-gray-100">
                            <Button variant="secondary" className="flex-1">
                                <Edit size={16} className="mr-2" />
                                Edit
                            </Button>
                            <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Plan">
                <form className="space-y-4">
                    <Input label="Plan Name" placeholder="e.g. Gold Membership" />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Price" type="number" placeholder="0.00" />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                            <select className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none bg-white">
                                <option>1 Month</option>
                                <option>3 Months</option>
                                <option>6 Months</option>
                                <option>1 Year</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma separated)</label>
                        <textarea className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none h-24 resize-none" placeholder="Gym access, Locker, ..." />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={() => setIsModalOpen(false)}>Save Plan</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Plans;
