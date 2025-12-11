import { Upload } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const MemberForm = ({ onClose }) => {
    return (
        <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" placeholder="John" />
                <Input label="Last Name" placeholder="Doe" />
            </div>
            <Input label="Email" type="email" placeholder="john@example.com" />
            <Input label="Phone Number" placeholder="+1 234 567 890" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input type="date" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Membership Plan</label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white">
                    <option>Monthly - Yoga</option>
                    <option>Yearly - Weight Lifting</option>
                    <option>6 Months - Cardio</option>
                </select>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-2">
                    <Upload size={20} />
                </div>
                <p className="text-sm font-medium text-gray-900">Upload Profile Photo</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
            </div>

            {/* Note: Save buttons are handled by the Modal footer usually, but can be here too */}
        </form>
    );
};

export default MemberForm;
