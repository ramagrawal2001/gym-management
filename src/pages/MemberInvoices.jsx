import { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, Clock } from 'lucide-react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/common/Table';
import Badge from '../components/common/Badge';
import * as invoiceService from '../services/invoiceService';
import { useNotification } from '../hooks/useNotification';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import { useRole } from '../hooks/useRole';
import { Navigate } from 'react-router-dom';

const MemberInvoices = () => {
    const { isMember } = useRole();
    const { error: showError } = useNotification();
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isMember()) {
            loadInvoices();
        }
    }, [isMember]);

    if (!isMember()) {
        return <Navigate to="/unauthorized" replace />;
    }

    const loadInvoices = async () => {
        setIsLoading(true);
        try {
            const response = await invoiceService.getMyInvoices({ page: 1, limit: 100 });
            const invoicesData = response.data?.data || response.data || [];
            setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
        } catch (error) {
            showError('Failed to load invoices');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = (invoice) => {
        // TODO: Implement invoice download
        console.log('Download invoice:', invoice);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Invoices</h1>
                <p className="text-gray-500 dark:text-gray-400">View your payment history and invoices</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        No invoices found
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice Number</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow key={invoice._id}>
                                    <TableCell className="font-medium">
                                        {invoice.invoiceNumber || 'N/A'}
                                    </TableCell>
                                    <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                                    <TableCell>{invoice.planId?.name || 'N/A'}</TableCell>
                                    <TableCell>{formatCurrency(invoice.total || 0)}</TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={invoice.status === 'paid' ? 'success' : 'warning'}
                                        >
                                            {invoice.status || 'pending'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => handleDownload(invoice)}
                                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            title="Download Invoice"
                                        >
                                            <Download size={18} />
                                        </button>
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

export default MemberInvoices;

