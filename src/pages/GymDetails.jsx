import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Building2, User, Users, TrendingUp, CreditCard, Calendar, ArrowLeft } from 'lucide-react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/common/Table';
import Badge from '../components/common/Badge';
import * as gymService from '../services/gymService';
import * as memberService from '../services/memberService';
import * as staffService from '../services/staffService';
import { useNotification } from '../hooks/useNotification';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import { useRole } from '../hooks/useRole';
import { Navigate } from 'react-router-dom';

const GymDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isSuperAdmin } = useRole();
    const { error: showError } = useNotification();
    const [gym, setGym] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [members, setMembers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isSuperAdmin() && id) {
            loadGymDetails();
        }
    }, [id, isSuperAdmin]);

    if (!isSuperAdmin()) {
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
        } catch (error) {
            showError('Failed to load gym details');
        } finally {
            setIsLoading(false);
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

