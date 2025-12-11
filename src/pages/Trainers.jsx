import { Mail, Phone, Instagram, Twitter, Award } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

const Trainers = () => {
    const trainers = [
        { name: 'Mike Ross', specialty: 'Bodybuilding', exp: '5 Years', clients: 24, image: 'Mike' },
        { name: 'Rachel Zane', specialty: 'Yoga & Pilates', exp: '3 Years', clients: 18, image: 'Rachel' },
        { name: 'Harvey Specter', specialty: 'Crossfit', exp: '8 Years', clients: 40, image: 'Harvey' },
        { name: 'Donna Paulsen', specialty: 'Zumba', exp: '4 Years', clients: 32, image: 'Donna' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trainers & Staff</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your fitness professionals.</p>
                </div>
                <Button>Add Trainer</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trainers.map((trainer, i) => (
                    <Card key={i} className="p-6 text-center hover:shadow-md transition-shadow">
                        <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden mb-4 border-4 border-white dark:border-slate-800 shadow-sm">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${trainer.image}`} alt={trainer.name} />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{trainer.name}</h3>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">{trainer.specialty}</p>

                        <div className="flex justify-center gap-2 mb-4">
                            <Badge variant="gray">{trainer.exp} Exp</Badge>
                            <Badge variant="success">{trainer.clients} Clients</Badge>
                        </div>

                        <div className="flex justify-center gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                            <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-gray-50 dark:bg-slate-800 rounded-full">
                                <Mail size={18} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-gray-50 dark:bg-slate-800 rounded-full">
                                <Phone size={18} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors bg-gray-50 dark:bg-slate-800 rounded-full">
                                <Instagram size={18} />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Trainers;
