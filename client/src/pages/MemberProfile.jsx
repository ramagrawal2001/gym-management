import { ArrowLeft, Edit, Mail, Phone, Calendar, Clock, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

const MemberProfile = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="!pl-0">
                <ArrowLeft size={20} className="mr-2" />
                Back to Members
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="flex flex-col items-center text-center p-8">
                        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mb-4">
                            J
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">John Doe</h2>
                        <p className="text-gray-500">Member ID: #MEM001</p>
                        <Badge variant="success" className="mt-2 px-3 py-1">Active</Badge>

                        <div className="w-full mt-6 space-y-4 pt-6 border-t border-gray-100 text-left">
                            <div className="flex items-center text-gray-600">
                                <Mail size={18} className="mr-3 text-gray-400" />
                                <span className="text-sm">john@example.com</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Phone size={18} className="mr-3 text-gray-400" />
                                <span className="text-sm">+1 234 567 890</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Calendar size={18} className="mr-3 text-gray-400" />
                                <span className="text-sm">Joined: Oct 15, 2023</span>
                            </div>
                        </div>

                        <Button variant="secondary" className="w-full mt-6">
                            <Edit size={16} className="mr-2" />
                            Edit Profile
                        </Button>
                    </Card>

                    <Card>
                        <h3 className="font-bold text-gray-900 mb-4">Current Plan</h3>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-4">
                            <div className="font-semibold text-blue-900">Yoga Premium</div>
                            <div className="text-blue-600 text-sm mt-1">Ends Jan 15, 2024</div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Progress</span>
                                <span className="text-gray-900 font-medium">65 days left</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                        </div>
                        <Button variant="primary" className="w-full mt-4">Renew Membership</Button>
                    </Card>
                </div>

                {/* Right Column: Tabs (History, Diet, Stats, etc.) */}
                <div className="lg:col-span-2">
                    <Card className="min-h-[500px]">
                        <div className="border-b border-gray-100">
                            <nav className="-mb-px flex space-x-6 px-6 overflow-x-auto">
                                {['Activity', 'Payment History', 'Diet Plan', 'Workout Plan'].map((tab) => (
                                    <button
                                        key={tab}
                                        className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-blue-600 text-blue-600"
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="p-6">
                            {/* Placeholder Content for Tabs */}
                            <div className="text-center py-12">
                                <h4 className="text-gray-900 font-medium mb-2">Member Activity Log</h4>
                                <p className="text-gray-500 text-sm mb-6">Recent check-ins and gym usage.</p>

                                <div className="space-y-4 text-left">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <Clock size={20} className="text-gray-400 mr-3" />
                                            <div>
                                                <div className="font-medium text-gray-900">Check-in at Gym Floor</div>
                                                <div className="text-xs text-gray-500">Today, 09:30 AM</div>
                                            </div>
                                        </div>
                                        <Badge variant="gray">Confirmed</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <Clock size={20} className="text-gray-400 mr-3" />
                                            <div>
                                                <div className="font-medium text-gray-900">Check-out</div>
                                                <div className="text-xs text-gray-500">Yesterday, 06:45 PM</div>
                                            </div>
                                        </div>
                                        <Badge variant="gray">Confirmed</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MemberProfile;
