import { useParams } from 'react-router-dom';
import { Mail, Phone, MapPin, Calendar, Activity, CreditCard, Utensils, Dumbbell } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { clsx } from "clsx";
import { useState } from 'react';

const MemberProfile = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('activity');

    const tabs = [
        { id: 'activity', label: 'Activity Log', icon: Activity },
        { id: 'payments', label: 'Payment History', icon: CreditCard },
        { id: 'diet', label: 'Diet Plan', icon: Utensils },
        { id: 'workout', label: 'Workout Plan', icon: Dumbbell },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6 text-center">
                        <div className="w-24 h-24 mx-auto bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Jane Cooper</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Member since Jan 2024</p>
                        <div className="mt-4 flex justify-center">
                            <Badge variant="success" className="px-3 py-1">Active Member</Badge>
                        </div>

                        <div className="mt-6 space-y-4 text-left">
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                <Mail size={18} />
                                <span className="text-sm">jane@example.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                <Phone size={18} />
                                <span className="text-sm">+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                <MapPin size={18} />
                                <span className="text-sm">123 Main St, New York</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                <Calendar size={18} />
                                <span className="text-sm">Born Mar 15, 1995</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Current Plan</h3>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-blue-900 dark:text-blue-300">Gold Membership</h4>
                                    <p className="text-xs text-blue-700 dark:text-blue-400">$99 / month</p>
                                </div>
                                <Badge variant="primary">Yearly</Badge>
                            </div>
                            <div className="w-full bg-blue-200 dark:bg-blue-900/30 rounded-full h-2 mt-3">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-right">165 days remaining</p>
                        </div>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2">
                    <Card className="min-h-[600px]">
                        <div className="border-b border-gray-200 dark:border-slate-700">
                            <div className="flex overflow-x-auto">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={clsx(
                                                "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                                isActive
                                                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300"
                                            )}
                                        >
                                            <Icon size={18} />
                                            {tab.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="p-6">
                            {activeTab === 'activity' && (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                                                    <Activity size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">Check-in at Gym</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Main Entrance</p>
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Today, 9:30 AM</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {activeTab === 'diet' && (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <Utensils size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No diet plan assigned yet.</p>
                                    <Button className="mt-4" variant="secondary">Create Diet Plan</Button>
                                </div>
                            )}
                            {activeTab === 'workout' && (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <Dumbbell size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No workout routine assigned yet.</p>
                                    <Button className="mt-4" variant="secondary">Create Workout</Button>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MemberProfile;
