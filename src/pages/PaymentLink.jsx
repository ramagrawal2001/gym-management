import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Check, AlertCircle, Building2, Calendar, Users, HardDrive } from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import * as subscriptionPlanService from '../services/subscriptionPlanService';
import * as subscriptionService from '../services/subscriptionService';
import { formatCurrency } from '../utils/formatCurrency';

const PaymentLink = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    useEffect(() => {
        loadPlan();
    }, [token]);

    const loadPlan = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await subscriptionPlanService.getPlanByToken(token);
            setPlan(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Payment link not found or expired');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayNow = async () => {
        setIsPaymentLoading(true);
        setError('');
        try {
            // Load Razorpay script
            const loaded = await subscriptionService.loadRazorpayScript();
            if (!loaded) {
                setError('Failed to load payment gateway');
                return;
            }

            // Create order using token
            const orderRes = await subscriptionService.createPaymentOrder({ paymentLinkToken: token });
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

            setPaymentSuccess(true);
        } catch (err) {
            if (err.message !== 'Payment cancelled') {
                setError(err.description || err.message || 'Payment failed. Please try again.');
            }
        } finally {
            setIsPaymentLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error && !plan) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Invalid Payment Link
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {error}
                    </p>
                    <Button onClick={() => navigate('/login')} variant="ghost">
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    if (paymentSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Payment Successful!
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Your subscription has been activated. You can now access all features of your plan.
                    </p>
                    <Button onClick={() => navigate('/login')}>
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Complete Your Subscription
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Secure payment powered by Razorpay
                    </p>
                </div>

                {/* Plan Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
                    {/* Gym Info */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-lg">{plan.gymId?.name || 'Gym'}</h2>
                                <p className="text-blue-100 text-sm">Subscription Payment</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Plan Details */}
                        <div className="mb-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {plan.name}
                                    </h3>
                                    <Badge variant="info" className="mt-1">{plan.duration}</Badge>
                                </div>
                            </div>

                            {plan.description && (
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                                    {plan.description}
                                </p>
                            )}

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

                            {/* Enabled features */}
                            <div className="flex flex-wrap gap-1 mb-6">
                                {Object.entries(plan.features || {})
                                    .filter(([key, value]) => typeof value === 'boolean' && value)
                                    .map(([key]) => (
                                        <span
                                            key={key}
                                            className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded capitalize"
                                        >
                                            <Check size={10} className="inline mr-1" />
                                            {key}
                                        </span>
                                    ))}
                            </div>
                        </div>

                        {/* Price */}
                        <div className="border-t border-gray-100 dark:border-slate-700 pt-6 mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-500 dark:text-gray-400">Plan Price</span>
                                <span className="text-gray-900 dark:text-white">{formatCurrency(plan.price, 'INR')}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-500 dark:text-gray-400">Duration</span>
                                <span className="text-gray-900 dark:text-white capitalize">{plan.duration}</span>
                            </div>
                            <div className="flex items-center justify-between text-lg font-bold pt-4 border-t border-gray-100 dark:border-slate-700">
                                <span className="text-gray-900 dark:text-white">Total</span>
                                <span className="text-blue-600 dark:text-blue-400">{formatCurrency(plan.price, 'INR')}</span>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
                                {error}
                            </div>
                        )}

                        {/* Pay Button */}
                        <Button
                            onClick={handlePayNow}
                            className="w-full py-3"
                            isLoading={isPaymentLoading}
                            disabled={isPaymentLoading}
                        >
                            <CreditCard size={20} className="mr-2" />
                            Pay {formatCurrency(plan.price, 'INR')}
                        </Button>

                        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
                            Secure payment powered by Razorpay. Your payment information is encrypted.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Login here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentLink;
