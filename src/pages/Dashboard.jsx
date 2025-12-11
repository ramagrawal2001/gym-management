import { Users, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import Card from '../components/common/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/common/Table';
import Badge from '../components/common/Badge';

const Dashboard = () => {
    const stats = [
        { title: 'Total Members', value: '1,234', trend: 12, trendLabel: 'vs last month', icon: Users, color: 'blue' },
        { title: 'Monthly Revenue', value: '$45,231', trend: 8, trendLabel: 'vs last month', icon: DollarSign, color: 'green' },
        { title: 'New Joinings', value: '145', trend: 24, trendLabel: 'vs last month', icon: TrendingUp, color: 'purple' },
        { title: 'Expiring Soon', value: '28', trend: -5, trendLabel: 'vs last month', icon: AlertCircle, color: 'orange' },
    ];

    const recentMembers = [
        { name: 'John Doe', plan: 'Yoga - 3 Months', date: '2023-10-25', status: 'Active', amount: '$120' },
        { name: 'Jane Smith', plan: 'Cardio - 1 Month', date: '2023-10-24', status: 'Pending', amount: '$50' },
        { name: 'Mike Johnson', plan: 'Weight Lifting - 1 Year', date: '2023-10-23', status: 'Active', amount: '$400' },
        { name: 'Sarah Wilson', plan: 'Zumba - 6 Months', date: '2023-10-22', status: 'Expired', amount: '$200' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueChart />
                </div>
                <div className="lg:col-span-1">
                    <Card className="h-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Membership Distribution</h3>
                        {/* Placeholder for Pie Chart or other stats */}
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <span className="text-gray-400">Pie Chart Placeholder</span>
                        </div>
                    </Card>
                </div>
            </div>

            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Recent Registrations</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member Name</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Join Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentMembers.map((member, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <div className="font-medium text-gray-900">{member.name}</div>
                                </TableCell>
                                <TableCell>{member.plan}</TableCell>
                                <TableCell>{member.date}</TableCell>
                                <TableCell>
                                    <Badge variant={member.status === 'Active' ? 'success' : member.status === 'Pending' ? 'warning' : 'danger'}>
                                        {member.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium text-gray-900">{member.amount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default Dashboard;
