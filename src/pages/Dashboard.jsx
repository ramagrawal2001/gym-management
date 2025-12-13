import { useEffect, useState } from 'react';
import { Users, CreditCard, UserPlus, AlertCircle } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import MembershipDistribution from '../components/dashboard/MembershipDistribution';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/common/Table';
import Badge from '../components/common/Badge';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMembers } from '../store/slices/memberSlice';
import * as memberService from '../services/memberService';
import * as paymentService from '../services/paymentService';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { members } = useSelector((state) => state.members);
    const [stats, setStats] = useState({
        totalMembers: 0,
        monthlyRevenue: 0,
        newJoinings: 0,
        expiringSoon: 0
    });
    const [recentMembers, setRecentMembers] = useState([]);
    const [membershipData, setMembershipData] = useState([]);
    const [revenueData, setRevenueData] = useState([]);

    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            loadDashboardData();
        }
    }, [isAuthenticated]);

    const loadDashboardData = async () => {
        try {
            // Fetch members
            const membersRes = await memberService.getMembers({ page: 1, limit: 100 });
            const membersData = membersRes.data?.data?.members || membersRes.data?.members || membersRes.data?.data || membersRes.data || [];
            
            // Calculate stats
            const total = Array.isArray(membersData) ? membersData.length : 0;
            const active = Array.isArray(membersData) ? membersData.filter(m => m.status === 'active').length : 0;
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
                expiringSoon: expiring
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
        } catch (error) {
            // Silently handle 401 errors (user will be redirected by interceptor)
            if (error.response?.status !== 401) {
                console.error('Error loading dashboard data:', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueChart data={revenueData} />
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Membership Distribution</h3>
                    <MembershipDistribution data={membershipData} />
                </div>
            </div>

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
        </div>
    );
};

export default Dashboard;
