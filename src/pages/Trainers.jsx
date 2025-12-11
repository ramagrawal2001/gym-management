import { Mail, Phone, MoreVertical } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const trainersData = [
    { id: 1, name: 'Alex T.', role: 'Senior Trainer', email: 'alex@gympro.com', phone: '+1 555 000 111', status: 'Active', specialties: ['Weight Lifting', 'Crossfit'] },
    { id: 2, name: 'Lisa M.', role: 'Yoga Instructor', email: 'lisa@gympro.com', phone: '+1 555 000 222', status: 'Active', specialties: ['Yoga', 'Pilates'] },
    { id: 3, name: 'Ryan K.', role: 'Nutritionist', email: 'ryan@gympro.com', phone: '+1 555 000 333', status: 'On Leave', specialties: ['Diet Planning'] },
];

const Trainers = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Trainers & Staff</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your team</p>
                </div>
                <Button>Add Trainer</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainersData.map((trainer) => (
                    <Card key={trainer.id} className="text-center relative">
                        <div className="absolute top-4 right-4">
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-gray-500">
                            {trainer.name.charAt(0)}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{trainer.name}</h3>
                        <p className="text-blue-600 font-medium text-sm">{trainer.role}</p>

                        <div className="my-4 flex flex-wrap justify-center gap-2">
                            {trainer.specialties.map((spec, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{spec}</span>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-gray-100 space-y-3">
                            <div className="flex items-center justify-center text-gray-500 text-sm">
                                <Mail size={16} className="mr-2" />
                                {trainer.email}
                            </div>
                            <div className="flex items-center justify-center text-gray-500 text-sm">
                                <Phone size={16} className="mr-2" />
                                {trainer.phone}
                            </div>
                        </div>
                        <div className="mt-4">
                            <Badge variant={trainer.status === 'Active' ? 'success' : 'warning'}>{trainer.status}</Badge>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Trainers;
