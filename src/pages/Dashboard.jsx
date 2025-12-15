import { useEffect, useState } from 'react';
import { Users, CreditCard, UserPlus, AlertCircle, Building2, TrendingUp, Calendar, FileText, Clock } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import MembershipDistribution from '../components/dashboard/MembershipDistribution';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/common/Table';
import Badge from '../components/common/Badge';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMembers } from '../store/slices/memberSlice';
import * as memberService from '../services/memberService';
import * as paymentService from '../services/paymentService';
import * as gymService from '../services/gymService';
import * as attendanceService from '../services/attendanceService';
import * as classService from '../services/scheduleService';
import * as invoiceService from '../services/invoiceService';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { members } = useSelector((state) => state.members);
    const [stats, setStats] = useState({
        totalMembers: 0,
        monthlyRevenue: 0,
        newJoinings: 0,
        expiringSoon: 0,
        // Super admin stats
        totalGyms: 0,
        activeGyms: 0
    });
    const [recentMembers, setRecentMembers] = useState([]);
    const [membershipData, setMembershipData] = useState([]);
    const [revenueData, setRevenueData] = useState([]);

    const { isAuthenticated, user } = useAuth();
    const { isSuperAdmin, isOwner, isStaff, isMember } = useRole();

    useEffect(() => {
        if (isAuthenticated) {
            loadDashboardData();
        }
    }, [isAuthenticated]);

    const loadDashboardData = async () => {
        try {
            if (isSuperAdmin()) {
                // Super admin: Platform-level stats
                await loadSuperAdminDashboard();
            } else if (isMember()) {
                // Member: Own data only
                await loadMemberDashboard();
            } else if (isStaff()) {
                // Staff: Operational dashboard
                await loadStaffDashboard();
            } else {
                // Gym owner: Gym-specific stats
                await loadGymDashboard();
            }
        } catch (error) {
            // Silently handle 401 errors (user will be redirected by interceptor)
            if (error.response?.status !== 401) {
                console.error('Error loading dashboard data:', error);
            }
        }
    };

    const loadSuperAdminDashboard = async () => {
        try {
            // Fetch all gyms
            const gymsRes = await gymService.getGyms({ page: 1, limit: 1000 });
            const gymsData = gymsRes.data?.data || gymsRes.data || [];
            const gyms = Array.isArray(gymsData) ? gymsData : [];
            
            const totalGyms = gyms.length;
            const activeGyms = gyms.filter(g => g.isActive !== false).length;

            // Fetch all members
            const membersRes = await memberService.getMembers({ page: 1, limit: 1000 });
            const membersData = membersRes.data?.data?.members || membersRes.data?.members || membersRes.data?.data || membersRes.data || [];
            const allMembers = Array.isArray(membersData) ? membersData : [];
            
            const totalMembers = allMembers.length;
            const expiring = allMembers.filter(m => {
                if (!m.subscriptionEnd) return false;
                const endDate = new Date(m.subscriptionEnd);
                const daysUntilExpiry = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
                return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
            }).length;

            // Recent members (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const newMembers = allMembers.filter(m => {
                const created = new Date(m.createdAt);
                return created >= thirtyDaysAgo;
            });

            // Fetch all payments for revenue
            let monthlyRevenue = 0;
            let payments = [];
            try {
                const paymentsRes = await paymentService.getPayments({ page: 1, limit: 1000 });
                payments = paymentsRes.data?.data?.payments || paymentsRes.data?.payments || paymentsRes.data?.data || paymentsRes.data || [];
                payments = Array.isArray(payments) ? payments : [];
                
                const thisMonth = new Date();
                thisMonth.setDate(1);
                const monthlyPayments = payments.filter(p => {
                    if (!p.paidAt) return false;
                    const paidDate = new Date(p.paidAt);
                    return paidDate >= thisMonth && p.status === 'completed';
                });
                monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
            } catch (error) {
                console.error('Error loading payments:', error);
            }

            setStats({
                totalGyms,
                activeGyms,
                totalMembers,
                monthlyRevenue,
                newJoinings: newMembers.length,
                expiringSoon: expiring
            });

            // Set recent members
            setRecentMembers(allMembers.slice(0, 5));

            // Membership distribution
            const planCounts = {};
            allMembers.forEach(m => {
                const planName = m.planId?.name || 'Unknown';
                planCounts[planName] = (planCounts[planName] || 0) + 1;
            });
            setMembershipData(Object.entries(planCounts).map(([name, value]) => ({ name, value })));

            // Revenue data (last 6 months)
            const months = [];
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                months.push({
                    date: monthNames[date.getMonth()],
                    revenue: 0
                });
            }
            
            payments.forEach(p => {
                if (p.status === 'completed' && p.paidAt) {
                    const paidDate = new Date(p.paidAt);
                    const monthIndex = months.findIndex(m => {
                        const monthIndex = monthNames.indexOf(m.date);
                        if (monthIndex === -1) return false;
                        return paidDate.getMonth() === monthIndex && 
                               paidDate.getFullYear() === new Date().getFullYear();
                    });
                    if (monthIndex !== -1) {
                        months[monthIndex].revenue += p.amount || 0;
                    }
                }
            });
            setRevenueData(months);
        } catch (error) {
            console.error('Error loading super admin dashboard:', error);
        }
    };

    const loadGymDashboard = async () => {
        // Fetch members
        const membersRes = await memberService.getMembers({ page: 1, limit: 100 });
        const membersData = membersRes.data?.data?.members || membersRes.data?.members || membersRes.data?.data || membersRes.data || [];
        
        // Calculate stats
        const total = Array.isArray(membersData) ? membersData.length : 0;
        const expiring = Array.isArray(membersData) ? membersData.filter(m => {
            if (!m.subscriptionEnd) return false;
            const endDate = new Date(m.subscriptionEnd);
            const daysUntilExpiry = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        }).length : 0;

        // Fetch recent payments for revenue
        let monthlyRevenue = 0;
        let payments = [];
        try {
            const paymentsRes = await paymentService.getPayments({ page: 1, limit: 100 });
            payments = paymentsRes.data?.data?.payments || paymentsRes.data?.payments || paymentsRes.data?.data || paymentsRes.data || [];
            
            const thisMonth = new Date();
            thisMonth.setDate(1);
            const monthlyPayments = Array.isArray(payments) ? payments.filter(p => {
                if (!p.paidAt) return false;
                const paidDate = new Date(p.paidAt);
                return paidDate >= thisMonth && p.status === 'completed';
            }) : [];
            monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        } catch (error) {
            console.error('Error loading payments:', error);
        }

        // Recent members (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newMembers = Array.isArray(membersData) ? membersData.filter(m => {
            const created = new Date(m.createdAt);
            return created >= thirtyDaysAgo;
        }) : [];

        setStats({
            totalMembers: total,
            monthlyRevenue,
            newJoinings: newMembers.length,
            expiringSoon: expiring,
            totalGyms: 0,
            activeGyms: 0
        });

        // Set recent members
        setRecentMembers(Array.isArray(membersData) ? membersData.slice(0, 5) : []);

        // Membership distribution
        const planCounts = {};
        if (Array.isArray(membersData)) {
            membersData.forEach(m => {
                const planName = m.planId?.name || 'Unknown';
                planCounts[planName] = (planCounts[planName] || 0) + 1;
            });
        }
        setMembershipData(Object.entries(planCounts).map(([name, value]) => ({ name, value })));

        // Revenue data (last 6 months)
        const months = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push({
                date: monthNames[date.getMonth()],
                revenue: 0
            });
        }
        
        if (Array.isArray(payments)) {
            payments.forEach(p => {
                if (p.status === 'completed' && p.paidAt) {
                    const paidDate = new Date(p.paidAt);
                    const monthIndex = months.findIndex(m => {
                        const monthIndex = monthNames.indexOf(m.date);
                        if (monthIndex === -1) return false;
                        return paidDate.getMonth() === monthIndex && 
                               paidDate.getFullYear() === new Date().getFullYear();
                    });
                    if (monthIndex !== -1) {
                        months[monthIndex].revenue += p.amount || 0;
                    }
                }
            });
        }
        setRevenueData(months);
    };

    const loadMemberDashboard = async () => {
        try {
            // Get member's own profile
            const memberRes = await memberService.getMyProfile();
            const member = memberRes.data?.data || memberRes.data;
            
            if (!member) {
                return;
            }

            // Get member's attendance (last 7 days)
            const attendanceRes = await attendanceService.getMyAttendance({ page: 1, limit: 7 });
            const attendanceData = attendanceRes.data?.data || attendanceRes.data?.data?.attendance || attendanceRes.data?.attendance || [];
            const attendance = Array.isArray(attendanceData) ? attendanceData : [];

            // Get available classes
            let classes = [];
            try {
                const classesRes = await classService.getAvailableClasses({ page: 1, limit: 5 });
                classes = classesRes.data?.data || classesRes.data || [];
                classes = Array.isArray(classes) ? classes : [];
            } catch (error) {
                console.error('Error loading classes:', error);
            }

            // Get member's invoices
            let invoices = [];
            try {
                const invoicesRes = await invoiceService.getMyInvoices({ page: 1, limit: 5 });
                invoices = invoicesRes.data?.data || invoicesRes.data || [];
                invoices = Array.isArray(invoices) ? invoices : [];
            } catch (error) {
                console.error('Error loading invoices:', error);
            }

            // Calculate membership status
            const now = new Date();
            const endDate = new Date(member.subscriptionEnd);
            const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
            const isActive = member.status === 'active' && daysRemaining > 0;

            setStats({
                membershipStatus: isActive ? 'active' : 'expired',
                daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
                attendanceCount: attendance.length,
                upcomingClasses: classes.length,
                recentInvoices: invoices.length
            });

            setRecentMembers([member]);
            setMembershipData([{ name: member.planId?.name || 'Unknown', value: 1 }]);
        } catch (error) {
            console.error('Error loading member dashboard:', error);
        }
    };

    const loadStaffDashboard = async () => {
        try {
            // Get today's classes
            const today = new Date();
            const dayOfWeek = today.getDay();
            const classesRes = await classService.getClasses({ 
                page: 1, 
                limit: 10,
                dayOfWeek: dayOfWeek.toString()
            });
            const classesData = classesRes.data?.data || classesRes.data || [];
            const classes = Array.isArray(classesData) ? classesData : [];
            
            // Filter classes assigned to this staff member
            const myClasses = classes.filter(c => 
                c.trainerId?._id === user._id || c.trainerId === user._id
            );

            // Get today's attendance
            const attendanceRes = await attendanceService.getTodayAttendance();
            const attendanceData = attendanceRes.data?.data?.attendance || attendanceRes.data?.attendance || [];
            const todayAttendance = Array.isArray(attendanceData) ? attendanceData : [];

            // Get assigned members (members in classes assigned to this staff)
            const assignedMemberIds = new Set();
            myClasses.forEach(c => {
                if (c.bookings) {
                    c.bookings.forEach(b => {
                        if (b.memberId) {
                            assignedMemberIds.add(b.memberId._id || b.memberId);
                        }
                    });
                }
            });

            setStats({
                todayClasses: myClasses.length,
                todayAttendance: todayAttendance.length,
                assignedMembers: assignedMemberIds.size,
                totalClasses: classes.length
            });

            setRecentMembers([]);
            setMembershipData([]);
        } catch (error) {
            console.error('Error loading staff dashboard:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isMember() ? (
                    <>
                        <StatCard
                            title="Membership Status"
                            value={stats.membershipStatus === 'active' ? 'Active' : 'Expired'}
                            trend={stats.membershipStatus === 'active' ? 'up' : 'down'}
                            trendValue=""
                            icon={Users}
                            color={stats.membershipStatus === 'active' ? 'green' : 'red'}
                        />
                        <StatCard
                            title="Days Remaining"
                            value={stats.daysRemaining?.toString() || '0'}
                            trend="down"
                            trendValue=""
                            icon={Clock}
                            color="blue"
                        />
                        <StatCard
                            title="Attendance (7 days)"
                            value={stats.attendanceCount?.toString() || '0'}
                            trend="up"
                            trendValue=""
                            icon={Calendar}
                            color="purple"
                        />
                        <StatCard
                            title="Upcoming Classes"
                            value={stats.upcomingClasses?.toString() || '0'}
                            trend="up"
                            trendValue=""
                            icon={Calendar}
                            color="orange"
                        />
                    </>
                ) : isStaff() ? (
                    <>
                        <StatCard
                            title="Today's Classes"
                            value={stats.todayClasses?.toString() || '0'}
                            trend="up"
                            trendValue=""
                            icon={Calendar}
                            color="blue"
                        />
                        <StatCard
                            title="Today's Attendance"
                            value={stats.todayAttendance?.toString() || '0'}
                            trend="up"
                            trendValue=""
                            icon={Users}
                            color="green"
                        />
                        <StatCard
                            title="Assigned Members"
                            value={stats.assignedMembers?.toString() || '0'}
                            trend="up"
                            trendValue=""
                            icon={UserPlus}
                            color="purple"
                        />
                        <StatCard
                            title="Total Classes"
                            value={stats.totalClasses?.toString() || '0'}
                            trend="up"
                            trendValue=""
                            icon={Calendar}
                            color="orange"
                        />
                    </>
                ) : isSuperAdmin() ? (
                    <>
                        <StatCard
                            title="Total Gyms"
                            value={stats.totalGyms.toLocaleString()}
                            trend="up"
                            trendValue=""
                            icon={Building2}
                            color="blue"
                        />
                        <StatCard
                            title="Active Gyms"
                            value={stats.activeGyms.toLocaleString()}
                            trend="up"
                            trendValue=""
                            icon={TrendingUp}
                            color="green"
                        />
                        <StatCard
                            title="Total Members"
                            value={stats.totalMembers.toLocaleString()}
                            trend="up"
                            trendValue=""
                            icon={Users}
                            color="purple"
                        />
                        <StatCard
                            title="Monthly Revenue"
                            value={formatCurrency(stats.monthlyRevenue)}
                            trend="up"
                            trendValue=""
                            icon={CreditCard}
                            color="orange"
                        />
                    </>
                ) : (
                    <>
                        <StatCard
                            title="Total Members"
                            value={stats.totalMembers.toLocaleString()}
                            trend="up"
                            trendValue=""
                            icon={Users}
                            color="blue"
                        />
                        <StatCard
                            title="Monthly Revenue"
                            value={formatCurrency(stats.monthlyRevenue)}
                            trend="up"
                            trendValue=""
                            icon={CreditCard}
                            color="green"
                        />
                        <StatCard
                            title="New Joinings"
                            value={stats.newJoinings.toString()}
                            trend="up"
                            trendValue=""
                            icon={UserPlus}
                            color="purple"
                        />
                        <StatCard
                            title="Expiring Soon"
                            value={stats.expiringSoon.toString()}
                            trend="down"
                            trendValue=""
                            icon={AlertCircle}
                            color="orange"
                        />
                    </>
                )}
            </div>

            {!isMember() && !isStaff() && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <RevenueChart data={revenueData} />
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Membership Distribution</h3>
                        <MembershipDistribution data={membershipData} />
                    </div>
                </div>
            )}

            {isMember() && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Attendance</h3>
                        <div className="space-y-2">
                            {stats.attendanceCount > 0 ? (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    You've checked in {stats.attendanceCount} times in the last 7 days.
                                </p>
                            ) : (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    No attendance records in the last 7 days.
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Upcoming Classes</h3>
                        <div className="space-y-2">
                            {stats.upcomingClasses > 0 ? (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    You have {stats.upcomingClasses} classes available for booking.
                                </p>
                            ) : (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    No classes available at the moment.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isStaff() && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left">
                            <Calendar className="text-blue-600 dark:text-blue-400 mb-2" size={24} />
                            <h4 className="font-semibold text-gray-900 dark:text-white">View Schedule</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Check today's classes</p>
                        </button>
                        <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left">
                            <Users className="text-green-600 dark:text-green-400 mb-2" size={24} />
                            <h4 className="font-semibold text-gray-900 dark:text-white">Mark Attendance</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Record member check-ins</p>
                        </button>
                        <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left">
                            <UserPlus className="text-purple-600 dark:text-purple-400 mb-2" size={24} />
                            <h4 className="font-semibold text-gray-900 dark:text-white">View Members</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">See assigned members</p>
                        </button>
                    </div>
                </div>
            )}

            {!isMember() && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Registrations</h3>
                    </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentMembers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    No recent registrations
                                </TableCell>
                            </TableRow>
                        ) : (
                            recentMembers.map((member) => {
                                const user = member.userId;
                                const plan = member.planId;
                                return (
                                    <TableRow key={member._id}>
                                        <TableCell className="font-medium">
                                            {user?.firstName && user?.lastName 
                                                ? `${user.firstName} ${user.lastName}`
                                                : user?.email || 'N/A'}
                                        </TableCell>
                                        <TableCell>{plan?.name || 'N/A'}</TableCell>
                                        <TableCell>{formatDate(member.createdAt)}</TableCell>
                                        <TableCell>
                                            <Badge variant={member.status === 'active' ? 'success' : 'warning'}>
                                                {member.status || 'Active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{plan?.price ? formatCurrency(plan.price) : 'N/A'}</TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
            )}
        </div>
    );
};

export default Dashboard;
