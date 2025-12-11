import { useState } from 'react';
import { Search, Download, Filter, FileText } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/common/Table';
import Badge from '../components/common/Badge';

const paymentsData = [
    { id: 'INV-001', member: 'John Doe', date: '2023-10-25', amount: '$50.00', plan: 'Basic Yoga', method: 'Credit Card', status: 'Paid' },
    { id: 'INV-002', member: 'Mike Johnson', date: '2023-10-24', amount: '$400.00', plan: 'Elite Performance', method: 'Bank Transfer', status: 'Paid' },
    { id: 'INV-003', member: 'Sarah Wilson', date: '2023-10-22', amount: '$200.00', plan: 'Zumba - 6 Months', method: 'Cash', status: 'Pending' },
];

const Payments = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payments & Invoices</h1>
                    <p className="text-gray-500 text-sm mt-1">Track revenue and transactions</p>
                </div>
                <Button>
                    <Download size={20} className="mr-2" />
                    Download Report
                </Button>
            </div>

            <Card>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search invoice or member..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="secondary" className="!px-3">
                            <Filter size={20} className="mr-2" />
                            Filter
                        </Button>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice ID</TableHead>
                            <TableHead>Member</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paymentsData.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell className="font-mono text-sm text-gray-500">{payment.id}</TableCell>
                                <TableCell className="font-medium text-gray-900">{payment.member}</TableCell>
                                <TableCell>{payment.date}</TableCell>
                                <TableCell>
                                    <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">{payment.plan}</span>
                                </TableCell>
                                <TableCell className="font-bold text-gray-900">{payment.amount}</TableCell>
                                <TableCell>
                                    <Badge variant={payment.status === 'Paid' ? 'success' : 'warning'}>{payment.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Download Invoice">
                                        <FileText size={18} />
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default Payments;
