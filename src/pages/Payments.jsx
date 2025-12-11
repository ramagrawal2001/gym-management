import { Download, Search, Filter, FileText } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/common/Table';
import Badge from '../components/common/Badge';

const Payments = () => {
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
                            placeholder="Search invoices..."
                            icon={Search}
                            className="dark:bg-slate-900 dark:border-slate-700"
                        />
                    </div>
                    <Button variant="secondary" className="sm:w-auto">
                        <Filter size={16} className="mr-2" />
                        Filter
                    </Button>
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
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <TableRow key={item}>
                                <TableCell className="font-mono text-gray-500 dark:text-gray-400">#INV-2024-00{item}</TableCell>
                                <TableCell>
                                    <div className="font-medium text-gray-900 dark:text-white">John Doe</div>
                                </TableCell>
                                <TableCell>Oct 24, 2024</TableCell>
                                <TableCell>Gold Monthly</TableCell>
                                <TableCell className="font-medium">$99.00</TableCell>
                                <TableCell>
                                    <Badge variant={item % 3 === 0 ? 'warning' : 'success'}>
                                        {item % 3 === 0 ? 'Pending' : 'Paid'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                        Download
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default Payments;
