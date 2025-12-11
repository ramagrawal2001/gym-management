import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Settings = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

            <Card className="max-w-2xl">
                <h3 className="text-lg font-bold text-gray-900 mb-6">General Settings</h3>
                <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Gym Name" placeholder="GymPro" />
                        <Input label="Contact Email" placeholder="contact@gympro.com" />
                    </div>
                    <Input label="Address" placeholder="123 Fitness St, Muscle City" />
                    <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                            <span className="ml-2 text-sm text-gray-600">Enable Email Notifications</span>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button>Save Changes</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Settings;
