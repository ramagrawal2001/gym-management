import { useState, useEffect } from 'react';
import { CreditCard, Check, Clock, AlertCircle, Calendar, Users, HardDrive } from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import * as subscriptionPlanService from '../services/subscriptionPlanService';
import * as subscriptionService from '../services/subscriptionService';
import { useNotification } from '../hooks/useNotification';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

const GymSubscription = () => {
    const { success: showSuccess, error: showError } = useNotification();
    const [plans, setPlans] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [plansRes, subRes, historyRes] = await Promise.all([
                subscriptionPlanService.getMySubscriptionPlans(),
                subscriptionService.getMySubscription(),
                subscriptionService.getPaymentHistory()
            ]);
            setPlans(plansRes.data || []);
            setSubscription(subRes.data);
            setPaymentHistory(historyRes.data || []);
        } catch (error) {
            console.error('Failed to load subscription data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayNow = async (plan) => {
        setIsPaymentLoading(true);
        try {
            // Load Razorpay script
            const loaded = await subscriptionService.loadRazorpayScript();
            if (!loaded) {
                showError('Failed to load payment gateway');
                return;
            }

            // Create order
            const orderRes = await subscriptionService.createPaymentOrder({ planId: plan._id });
            const orderData = orderRes.data;

            // Open Razorpay checkout
            const paymentResponse = await subscriptionService.openRazorpayCheckout({
                keyId: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                orderId: orderData.orderId,
                name: 'GymOS Subscription',
                description: `${orderData.plan.name} - ${orderData.plan.duration}`,
                prefill: {}
            });

            // Verify payment
            await subscriptionService.verifyPayment({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                planId: plan._id
            });

            showSuccess('Payment successful! Your subscription is now active.');
            loadData();
        } catch (error) {
            if (error.message !== 'Payment cancelled') {
                showError(error.description || error.message || 'Payment failed');
            }
        } finally {
            setIsPaymentLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            active: 'success',
            trial: 'info',
            expired: 'danger',
            cancelled: 'danger',
            pending: 'warning',
            suspended: 'danger'
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Subscription</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your gym subscription and view payment history.</p>
            </div>

            {/* Current Subscription Status */}
            {subscription && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-semibold mb-1">Current Subscription</h2>
                            <p className="text-blue-100 text-sm">
                                {subscription.planId?.name || 'Unknown Plan'}
                            </p>
                        </div>
                        {getStatusBadge(subscription.status)}
                    </div>

                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <p className="text-blue-200 text-xs">Start Date</p>
                            <p className="font-medium">{formatDate(subscription.startDate)}</p>
                        </div>
                        <div>
                            <p className="text-blue-200 text-xs">End Date</p>
                            <p className="font-medium">{formatDate(subscription.endDate)}</p>
                        </div>
                        <div>
                            <p className="text-blue-200 text-xs">Days Remaining</p>
                            <p className="font-medium">{subscription.daysRemaining || 0} days</p>
                        </div>
                        <div>
                            <p className="text-blue-200 text-xs">Status</p>
                            <p className="font-medium capitalize">{subscription.status}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Available Plans */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {plans.length > 0 ? 'Available Plans' : 'No Plans Available'}
                </h2>

                {plans.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-8 text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-gray-900 dark:text-white font-medium mb-2">No Subscription Plans</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Contact the administrator to get a subscription plan for your gym.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <div
                                key={plan._id}
                                className={`bg-white dark:bg-slate-800 rounded-xl border ${plan.isPaid
                                        ? 'border-green-200 dark:border-green-800'
                                        : 'border-gray-100 dark:border-slate-700'
                                    } shadow-sm overflow-hidden`}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {plan.name}
                                            </h3>
                                            <Badge variant="info" className="mt-1">{plan.duration}</Badge>
                                        </div>
                                        {plan.isPaid ? (
                                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                                        {plan.description || 'Full-featured subscription plan'}
                                    </p>

                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(plan.price, 'INR')}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400">/{plan.duration}</span>
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <Users size={16} className="text-blue-500" />
                                            <span>Up to {plan.features?.maxMembers || 100} members</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <Calendar size={16} className="text-blue-500" />
                                            <span>{plan.features?.maxBranches || 1} branch(es)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <HardDrive size={16} className="text-blue-500" />
                                            <span>{plan.features?.maxStorage || 1024} MB storage</span>
                                        </div>
                                    </div>

                                    {/* Enabled features badges */}
                                    <div className="flex flex-wrap gap-1 mb-6">
                                        {Object.entries(plan.features || {})
                                            .filter(([key, value]) => typeof value === 'boolean' && value)
                                            .map(([key]) => (
                                                <span
                                                    key={key}
                                                    className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded capitalize"
                                                >
                                                    {key}
                                                </span>
                                            ))}
                                    </div>

                                    {plan.isPaid ? (
                                        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-center py-2 px-4 rounded-lg text-sm font-medium">
                                            <Check size={16} className="inline mr-1" />
                                            Paid on {formatDate(plan.paidAt)}
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => handlePayNow(plan)}
                                            className="w-full"
                                            isLoading={isPaymentLoading}
                                            disabled={isPaymentLoading}
                                        >
                                            <CreditCard size={18} className="mr-2" />
                                            Pay Now
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment History */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment History</h2>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                    {paymentHistory.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No payment history yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-slate-700">
                            {paymentHistory.map((payment) => (
                                <div key={payment._id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${payment.status === 'captured'
                                                ? 'bg-green-100 dark:bg-green-900/30'
                                                : 'bg-red-100 dark:bg-red-900/30'
                                            }`}>
                                            {payment.status === 'captured' ? (
                                                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {payment.planId?.name || 'Subscription Payment'}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(payment.paidAt || payment.createdAt)} • {payment.method || 'Online'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(payment.amount, 'INR')}
                                        </p>
                                        <Badge variant={payment.status === 'captured' ? 'success' : 'danger'}>
                                            {payment.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GymSubscription;
