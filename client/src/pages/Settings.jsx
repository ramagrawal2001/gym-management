import { Save } from 'lucide-react';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Settings = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage general gym configuration.</p>
            </div>

            <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">General Information</h2>
                <form className="space-y-6 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Gym Name" defaultValue="GymPro Fitness Center" />
                        <Input label="Contact Email" defaultValue="admin@gympro.com" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Phone Number" defaultValue="+1 (555) 000-0000" />
                        <Input label="Website" defaultValue="www.gympro.com" />
                    </div>
                    <Input label="Address" defaultValue="123 Fitness Ave, New York, NY 10001" />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                        <select className="block w-full max-w-xs rounded-lg border border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
                            <option>USD ($)</option>
                            <option>EUR (€)</option>
                            <option>GBP (£)</option>
                        </select>
                    </div>

                    <div className="pt-4">
                        <Button>
                            <Save size={18} className="mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Settings;
