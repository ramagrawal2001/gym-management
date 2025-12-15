import { useState, useEffect } from 'react';
import { Download, Search, Filter, FileText } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/common/Table';
import Badge from '../components/common/Badge';
import * as paymentService from '../services/paymentService';
import * as gymService from '../services/gymService';
import { useRole } from '../hooks/useRole';
import { useDebounce } from '../hooks/useDebounce';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';

const Payments = () => {
    const { isSuperAdmin } = useRole();
    const [payments, setPayments] = useState([]);
    const [gyms, setGyms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [gymFilter, setGymFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        if (isSuperAdmin()) {
            loadGyms();
        }
    }, [isSuperAdmin]);

    useEffect(() => {
        loadPayments();
    }, [debouncedSearch, gymFilter, statusFilter]);

    const loadGyms = async () => {
        try {
            const response = await gymService.getGyms({ page: 1, limit: 1000 });
            const gymsData = response.data?.data || response.data || [];
            setGyms(Array.isArray(gymsData) ? gymsData : []);
        } catch (error) {
            console.error('Failed to load gyms:', error);
        }
    };

    const loadPayments = async () => {
        setIsLoading(true);
        try {
            const params = {
                page: 1,
                limit: 100,
                search: debouncedSearch || undefined,
                gymId: gymFilter || undefined,
                status: statusFilter || undefined
            };
            const response = await paymentService.getPayments(params);
            const paymentsData = response.data?.data?.payments || response.data?.payments || response.data?.data || response.data || [];
            setPayments(Array.isArray(paymentsData) ? paymentsData : []);
        } catch (error) {
            console.error('Failed to load payments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'failed':
                return 'danger';
            case 'refunded':
                return 'gray';
            default:
                return 'gray';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
                    <p className="text-gray-500 dark:text-gray-400">View transaction history and invoices.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary">
                        <FileText size={18} className="mr-2" />
                        Reports
                    </Button>
                    <Button>
                        <Download size={18} className="mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="w-full sm:w-96">
                        <Input
                            placeholder="Search payments..."
                            icon={Search}
                            className="dark:bg-slate-900 dark:border-slate-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {isSuperAdmin() && (
                            <select
                                value={gymFilter}
                                onChange={(e) => setGymFilter(e.target.value)}
                                className="rounded-lg border border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white py-2 px-3 text-sm"
                            >
                                <option value="">All Gyms</option>
                                {gyms.map(gym => (
                                    <option key={gym._id} value={gym._id}>
                                        {gym.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white py-2 px-3 text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            {isSuperAdmin() && <TableHead>Gym</TableHead>}
                            <TableHead>Member</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={isSuperAdmin() ? 8 : 7} className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                </TableCell>
                            </TableRow>
                        ) : payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isSuperAdmin() ? 8 : 7} className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    No payments found
                                </TableCell>
                            </TableRow>
                        ) : (
                            payments.map((payment) => {
                                const member = payment.memberId;
                                const gym = payment.gymId;
                                const user = member?.userId;
                                return (
                                    <TableRow key={payment._id}>
                                        <TableCell className="font-mono text-gray-500 dark:text-gray-400">
                                            {payment.transactionId || `#${payment._id.slice(-8)}`}
                                        </TableCell>
                                        {isSuperAdmin() && (
                                            <TableCell>
                                                <div className="text-gray-900 dark:text-gray-200">
                                                    {gym?.name || 'N/A'}
                                                </div>
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {user?.firstName && user?.lastName
                                                    ? `${user.firstName} ${user.lastName}`
                                                    : user?.email || 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatDate(payment.paidAt || payment.createdAt)}</TableCell>
                                        <TableCell>
                                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                {payment.method?.replace('_', ' ') || 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(payment.status)}>
                                                {payment.status || 'Pending'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                                View
                                            </Button>
                                        </TableCell>
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

export default Payments;
