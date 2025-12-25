import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Building2, User, Users, TrendingUp, CreditCard, Calendar, ArrowLeft, QrCode, Fingerprint, Smartphone, ClipboardList } from 'lucide-react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/common/Table';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import * as gymService from '../services/gymService';
import * as memberService from '../services/memberService';
import * as staffService from '../services/staffService';
import * as attendanceService from '../services/attendanceService';
import { useNotification } from '../hooks/useNotification';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import { useRole } from '../hooks/useRole';
import { Navigate } from 'react-router-dom';

const GymDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isSuperAdmin } = useRole();
    const { error: showError, success: showSuccess } = useNotification();
    const [gym, setGym] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [members, setMembers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [attendanceConfig, setAttendanceConfig] = useState(null);
    const [selectedMethods, setSelectedMethods] = useState([]);

    const availableAttendanceMethods = [
        { id: 'manual', name: 'Manual', icon: ClipboardList, description: 'Staff manually marks attendance' },
        { id: 'qr', name: 'QR Code', icon: QrCode, description: 'Members scan QR code to check in' },
        { id: 'nfc', name: 'NFC', icon: Smartphone, description: 'Tap NFC card for check-in' },
        { id: 'biometric', name: 'Biometric', icon: Fingerprint, description: 'Fingerprint or face recognition' }
    ];

    const isAdmin = isSuperAdmin();

    useEffect(() => {
        if (isAdmin && id) {
            loadGymDetails();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!isAdmin) {
        return <Navigate to="/unauthorized" replace />;
    }

    const loadGymDetails = async () => {
        setIsLoading(true);
        try {
            // Load gym
            const gymRes = await gymService.getGym(id);
            const gymData = gymRes.data?.data || gymRes.data;
            setGym(gymData);

            // Load analytics
            try {
                const analyticsRes = await gymService.getGymAnalytics(id);
                setAnalytics(analyticsRes.data?.data || analyticsRes.data);
            } catch (error) {
                console.error('Error loading analytics:', error);
            }

            // Load members
            try {
                const membersRes = await gymService.getGymMembers(id, { page: 1, limit: 10 });
                const membersData = membersRes.data?.data || membersRes.data || [];
                setMembers(Array.isArray(membersData) ? membersData : []);
            } catch (error) {
                console.error('Error loading members:', error);
            }

            // Load staff
            try {
                const staffRes = await gymService.getGymStaff(id, { page: 1, limit: 10 });
                const staffData = staffRes.data?.data || staffRes.data || [];
                setStaff(Array.isArray(staffData) ? staffData : []);
            } catch (error) {
                console.error('Error loading staff:', error);
            }

            // Load attendance config
            try {
                const configRes = await attendanceService.getAttendanceConfigByGym(id);
                const configData = configRes.data?.data || configRes.data;
                setAttendanceConfig(configData);
                setSelectedMethods(configData?.availableMethods || ['manual']);
            } catch (error) {
                console.error('Error loading attendance config:', error);
                setSelectedMethods(['manual']);
            }
        } catch (error) {
            showError('Failed to load gym details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMethodToggle = (methodId) => {
        setSelectedMethods(prev => {
            if (prev.includes(methodId)) {
                // Don't allow removing the last method
                if (prev.length === 1) return prev;
                return prev.filter(m => m !== methodId);
            }
            return [...prev, methodId];
        });
    };

    const handleSaveAttendanceMethods = async () => {
        setIsSaving(true);
        try {
            console.log('Saving methods:', selectedMethods, 'for gym:', id);
            const response = await attendanceService.assignAttendanceMethods(id, selectedMethods);
            console.log('Response:', response);
            if (response.data?.success) {
                setAttendanceConfig(response.data.data);
                showSuccess('Attendance methods updated successfully');
            } else {
                showError('Failed to update attendance methods');
            }
        } catch (error) {
            console.error('Error saving methods:', error);
            showError(error.response?.data?.message || 'Failed to update attendance methods');
        } finally {
            setIsSaving(false);
        }
    };


    if (isLoading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
        );
    }

    if (!gym) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Gym not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/gyms')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{gym.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gym Details and Analytics</p>
                </div>
            </div>

            {/* Gym Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Gym Information</h2>
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Name:</span>
                            <p className="font-medium text-gray-900 dark:text-white">{gym.name}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Subdomain:</span>
                            <p className="font-medium text-gray-900 dark:text-white">{gym.subdomain || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                            <Badge variant={gym.isActive ? 'success' : 'warning'}>
                                {gym.isActive ? 'Active' : 'Suspended'}
                            </Badge>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Created:</span>
                            <p className="font-medium text-gray-900 dark:text-white">{formatDate(gym.createdAt)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Gym Owner</h2>
                    {gym.ownerId ? (
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Name:</span>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {gym.ownerId.firstName} {gym.ownerId.lastName}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
                                <p className="font-medium text-gray-900 dark:text-white">{gym.ownerId.email}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">No owner assigned</p>
                    )}
                </div>
            </div>

            {/* Analytics */}
            {analytics && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Analytics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Users className="text-blue-600 dark:text-blue-400 mb-2" size={24} />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {analytics.members?.total || 0}
                            </p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <TrendingUp className="text-green-600 dark:text-green-400 mb-2" size={24} />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Active Members</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {analytics.members?.active || 0}
                            </p>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <CreditCard className="text-purple-600 dark:text-purple-400 mb-2" size={24} />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(analytics.revenue?.monthly || 0)}
                            </p>
                        </div>
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <Calendar className="text-orange-600 dark:text-orange-400 mb-2" size={24} />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Attendance (7d)</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {analytics.attendance?.last7Days || 0}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Attendance Configuration */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Attendance Configuration</h2>
                    <Button onClick={handleSaveAttendanceMethods} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Methods'}
                    </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Select which attendance methods are available for this gym. The gym owner can choose from these options.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableAttendanceMethods.map((method) => {
                        const Icon = method.icon;
                        const isSelected = selectedMethods.includes(method.id);
                        return (
                            <div
                                key={method.id}
                                onClick={() => handleMethodToggle(method.id)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-slate-700'
                                        }`}>
                                        <Icon className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'} size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">{method.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{method.description}</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-slate-600'
                                        }`}>
                                        {isSelected && <span className="text-white text-xs">✓</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {attendanceConfig && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Active Methods:</strong>{' '}
                            {attendanceConfig.activeMethods?.map(m => (
                                <Badge key={m} className="mr-1 capitalize">{m}</Badge>
                            ))}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <strong>Status:</strong> <Badge variant={attendanceConfig.isEnabled ? 'success' : 'warning'}>
                                {attendanceConfig.isEnabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                        </p>
                    </div>
                )}
            </div>

            {/* Members */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Members</h2>
                    <Link to={`/members?gymId=${id}`} className="text-sm text-blue-600 hover:text-blue-700">
                        View All
                    </Link>
                </div>
                {members.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">No members found</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member._id}>
                                    <TableCell className="font-medium">
                                        {member.userId?.firstName} {member.userId?.lastName}
                                    </TableCell>
                                    <TableCell>{member.userId?.email}</TableCell>
                                    <TableCell>{member.planId?.name || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={member.status === 'active' ? 'success' : 'warning'}>
                                            {member.status || 'active'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            to={`/members/${member._id}`}
                                            className="text-blue-600 hover:text-blue-700 text-sm"
                                        >
                                            View
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Staff */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Staff</h2>
                </div>
                {staff.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">No staff found</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Specialty</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staff.map((staffMember) => (
                                <TableRow key={staffMember._id}>
                                    <TableCell className="font-medium">
                                        {staffMember.userId?.firstName} {staffMember.userId?.lastName}
                                    </TableCell>
                                    <TableCell>{staffMember.userId?.email}</TableCell>
                                    <TableCell>{staffMember.specialty || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={staffMember.isActive ? 'success' : 'warning'}>
                                            {staffMember.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
};

export default GymDetails;

