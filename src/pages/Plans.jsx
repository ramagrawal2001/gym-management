import { Check, Plus, Edit2, Trash2 } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

const Plans = () => {
    const plans = [
        {
            name: 'Basic',
            price: '$29',
            period: '/month',
            features: ['Acces to Gym Floor', 'Locker Access', 'Free WiFi', '1 Guest Pass/mo'],
            color: 'gray'
        },
        {
            name: 'Standard',
            price: '$59',
            period: '/month',
            features: ['All Basic Feautres', 'Group Classes', 'Sauna Access', 'Fitness Assessment', '5 Guest Passes/mo'],
            color: 'blue',
            popular: true
        },
        {
            name: 'Premium',
            price: '$99',
            period: '/month',
            features: ['All Standard Features', 'Personal Trainer (2x/mo)', 'Nutrition Plan', 'Towel Service', 'Unlimited Guest Passes'],
            color: 'purple'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Membership Plans</h1>
                    <p className="text-gray-500 dark:text-gray-400">Configure your gym's pricing tiers.</p>
                </div>
                <Button>
                    <Plus size={20} className="mr-2" />
                    Create Plan
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <Card key={plan.name} className={`relative p-8 ${plan.popular ? 'border-blue-500 shadow-lg shadow-blue-500/10' : ''}`}>
                        {plan.popular && (
                            <div className="absolute top-0 right-0 p-4">
                                <Badge variant="primary">Most Popular</Badge>
                            </div>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                        <div className="mt-4 flex items-baseline">
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                            <span className="ml-1 text-gray-500 dark:text-gray-400">{plan.period}</span>
                        </div>

                        <ul className="mt-6 space-y-4">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center text-gray-600 dark:text-gray-300">
                                    <Check size={16} className="text-green-500 mr-3" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 flex gap-3">
                            <Button variant="secondary" className="w-full">
                                <Edit2 size={16} className="mr-2" /> Edit
                            </Button>
                            <Button variant="ghost" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Plans;
