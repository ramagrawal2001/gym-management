import { Users, CreditCard, UserPlus, AlertCircle } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/common/Table';
import Badge from '../components/common/Badge';

const Dashboard = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Members"
                    value="1,284"
                    trend="up"
                    trendValue="12%"
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Monthly Revenue"
                    value="$48,200"
                    trend="up"
                    trendValue="8%"
                    icon={CreditCard}
                    color="green"
                />
                <StatCard
                    title="New Joinings"
                    value="142"
                    trend="up"
                    trendValue="24%"
                    icon={UserPlus}
                    color="purple"
                />
                <StatCard
                    title="Expiring Soon"
                    value="24"
                    trend="down"
                    trendValue="4%"
                    icon={AlertCircle}
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueChart />
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Membership Distribution</h3>
                    <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
                        Pie Chart Placeholder
                    </div>
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
                        {[1, 2, 3, 4, 5].map((item) => (
                            <TableRow key={item}>
                                <TableCell className="font-medium">John Doe {item}</TableCell>
                                <TableCell>Gold Plan</TableCell>
                                <TableCell>Oct 24, 2023</TableCell>
                                <TableCell><Badge variant="success">Active</Badge></TableCell>
                                <TableCell>$99.00</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default Dashboard;
