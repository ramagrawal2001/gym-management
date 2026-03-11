import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../../common/Modal';
import { formatDate } from '../../../utils/formatDate';
import { formatCurrency } from '../../../utils/formatCurrency';
import Badge from '../../common/Badge';

const PaymentHistoryModal = ({ isOpen, onClose, payments = [], isLoading = false, gymName = '', planName = '' }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Payment History`}
            size="2xl"
        >
            <div className="space-y-4">
                <div className="px-1">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Gym</h3>
                    <p className="text-gray-900 dark:text-white font-medium">{gymName || 'Unknown'}</p>
                </div>
                <div className="px-1">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</h3>
                    <p className="text-gray-900 dark:text-white font-medium">{planName || 'Unknown'}</p>
                </div>

                <div className="mt-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                            No payment history found for this plan.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {payments.map((payment) => (
                                <div key={payment._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${payment.status === 'captured' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                                            {payment.status === 'captured' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {formatCurrency(payment.amount, payment.currency || 'INR')}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDate(payment.paidAt || payment.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <Badge variant={payment.status === 'captured' ? 'success' : 'danger'}>
                                            {payment.status}
                                        </Badge>
                                        <span className="mt-1 text-xs text-gray-500 capitalize">
                                            {payment.method || 'Unknown method'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default PaymentHistoryModal;
