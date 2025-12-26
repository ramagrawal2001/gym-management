import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMembers } from '../services/memberService';
import { getGymMemberAccessSettings, updateGymMemberAccessSettings, getMemberAccess, updateMemberAccess } from '../services/memberAccessService';
import { toast } from 'react-hot-toast';
import { Shield, Settings, User, Lock } from 'lucide-react';

export default function MemberAccessSettings() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('defaults');
    const [gymSettings, setGymSettings] = useState(null);
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberAccess, setMemberAccess] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchGymSettings();
        fetchMembers();
    }, []);

    const fetchGymSettings = async () => {
        try {
            const response = await getGymMemberAccessSettings();
            setGymSettings(response.data.data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await getMembers();
            setMembers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const handleUpdateGymDefaults = async () => {
        try {
            setLoading(true);
            await updateGymMemberAccessSettings(gymSettings);
            toast.success('Settings updated successfully');
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const handleViewMemberAccess = async (memberId) => {
        try {
            const response = await getMemberAccess(memberId);
            setMemberAccess(response.data.data);
            setSelectedMember(members.find(m => m.userId._id === memberId));
            setActiveTab('individual');
        } catch (error) {
            console.error('Error fetching member access:', error);
            toast.error('Failed to load member access');
        }
    };

    const handleUpdateMemberAccess = async () => {
        try {
            setLoading(true);
            await updateMemberAccess(memberAccess.user.id, {
                canLogin: memberAccess.user.canLogin,
                memberPermissionLevel: memberAccess.user.memberPermissionLevel,
                accessRestrictions: memberAccess.user.accessRestrictions
            });
            toast.success('Member access updated successfully');
            fetchMembers();
        } catch (error) {
            console.error('Error updating member access:', error);
            toast.error('Failed to update member access');
        } finally {
            setLoading(false);
        }
    };

    const FeatureToggle = ({ label, value, onChange }) => (
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <button
                onClick={() => onChange(!value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    );

    if (!gymSettings) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-7 h-7" />
                    Member Access Control
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Manage member portal access and permissions</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('defaults')}
                        className={`${activeTab === 'defaults'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        <Settings className="inline-block w-5 h-5 mr-2" />
                        Default Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`${activeTab === 'members'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        <User className="inline-block w-5 h-5 mr-2" />
                        Member List
                    </button>
                    {activeTab === 'individual' && (
                        <button
                            className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                        >
                            <Lock className="inline-block w-5 h-5 mr-2" />
                            Individual Access
                        </button>
                    )}
                </nav>
            </div>

            {/* Default Settings Tab */}
            {activeTab === 'defaults' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Default Member Portal Features</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        These settings apply to all members by default unless overridden individually.
                    </p>

                    <div className="space-y-1 mb-8">
                        {Object.keys(gymSettings.defaultFeatureAccess).map((feature) => (
                            <FeatureToggle
                                key={feature}
                                label={feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                value={gymSettings.defaultFeatureAccess[feature]}
                                onChange={(value) =>
                                    setGymSettings({
                                        ...gymSettings,
                                        defaultFeatureAccess: { ...gymSettings.defaultFeatureAccess, [feature]: value }
                                    })
                                }
                            />
                        ))}
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleUpdateGymDefaults}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            )}

            {/* Member List Tab */}
            {activeTab === 'members' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Member
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Permission Level
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Login Access
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {members.map((member) => (
                                <tr key={member._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {member.userId?.firstName} {member.userId?.lastName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{member.userId?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {member.userId?.memberPermissionLevel || 'premium'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${member.userId?.canLogin !== false
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {member.userId?.canLogin !== false ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => handleViewMemberAccess(member.userId._id)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Individual Member Access Tab */}
            {activeTab === 'individual' && memberAccess && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-1">
                            {memberAccess.user.firstName} {memberAccess.user.lastName}
                        </h2>
                        <p className="text-sm text-gray-600">{memberAccess.user.email}</p>
                    </div>

                    {/* Login Access */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <FeatureToggle
                            label="Allow Login"
                            value={memberAccess.user.canLogin}
                            onChange={(value) =>
                                setMemberAccess({ ...memberAccess, user: { ...memberAccess.user, canLogin: value } })
                            }
                        />
                    </div>

                    {/* Permission Level */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Permission Level</label>
                        <select
                            value={memberAccess.user.memberPermissionLevel}
                            onChange={(e) =>
                                setMemberAccess({
                                    ...memberAccess,
                                    user: { ...memberAccess.user, memberPermissionLevel: e.target.value }
                                })
                            }
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        >
                            <option value="basic">Basic</option>
                            <option value="premium">Premium</option>
                            <option value="vip">VIP</option>
                        </select>
                    </div>

                    {/* Custom Access Restrictions */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold mb-4">Custom Feature Access (Override Defaults)</h3>
                        <div className="space-y-1">
                            {Object.keys(memberAccess.user.accessRestrictions || {}).map((feature) => (
                                <div key={feature} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </label>
                                    <select
                                        value={memberAccess.user.accessRestrictions[feature] === null ? 'default' : memberAccess.user.accessRestrictions[feature]}
                                        onChange={(e) => {
                                            const value = e.target.value === 'default' ? null : e.target.value === 'true';
                                            setMemberAccess({
                                                ...memberAccess,
                                                user: {
                                                    ...memberAccess.user,
                                                    accessRestrictions: { ...memberAccess.user.accessRestrictions, [feature]: value }
                                                }
                                            });
                                        }}
                                        className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                                    >
                                        <option value="default">Use Default</option>
                                        <option value="true">Allow</option>
                                        <option value="false">Deny</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                        <button
                            onClick={handleUpdateMemberAccess}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            onClick={() => setActiveTab('members')}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Back to List
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
