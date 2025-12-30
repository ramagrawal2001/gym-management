import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { getMySubscription } from '../../services/subscriptionService';

/**
 * SubscriptionGuard - Protects routes based on subscription status
 * 
 * Behavior:
 * - Super admins bypass subscription checks
 * - Members bypass subscription checks (they use the gym, not own it)
 * - Owners/Staff with active or trial subscription can access
 * - Expired/cancelled subscriptions redirect to /my-subscription
 * - Shows warning banner for subscriptions expiring soon or in grace period
 */
const SubscriptionGuard = ({ children }) => {
    const { user } = useAuth();
    const { isSuperAdmin, isMember } = useRole();
    const location = useLocation();
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [warning, setWarning] = useState(null);

    useEffect(() => {
        const checkSubscription = async () => {
            // Super admins and members bypass subscription checks
            if (isSuperAdmin() || isMember()) {
                setSubscriptionStatus('active');
                setLoading(false);
                return;
            }

            // Only check for users with a gym
            if (!user?.gymId) {
                setSubscriptionStatus('none');
                setLoading(false);
                return;
            }

            try {
                const response = await getMySubscription();
                const subscription = response.data;

                if (!subscription) {
                    setSubscriptionStatus('none');
                    setLoading(false);
                    return;
                }

                const now = new Date();
                const status = subscription.status;

                // Check for active subscription
                if (status === 'active' || status === 'trial') {
                    const endDate = status === 'trial'
                        ? new Date(subscription.trialEndsAt)
                        : new Date(subscription.endDate);

                    // Check if actually expired (end date passed)
                    if (endDate && endDate < now) {
                        // Check grace period (3 days)
                        const gracePeriodMs = 3 * 24 * 60 * 60 * 1000;
                        const graceEndDate = new Date(endDate.getTime() + gracePeriodMs);

                        if (now < graceEndDate) {
                            const daysLeft = Math.ceil((graceEndDate - now) / (24 * 60 * 60 * 1000));
                            setWarning(`Your subscription has expired. You have ${daysLeft} day(s) grace period remaining.`);
                            setSubscriptionStatus('grace');
                        } else {
                            setSubscriptionStatus('expired');
                        }
                    } else if (endDate) {
                        // Check if expiring soon (within 7 days)
                        const daysRemaining = Math.ceil((endDate - now) / (24 * 60 * 60 * 1000));
                        if (daysRemaining <= 7 && daysRemaining > 0) {
                            setWarning(`Your ${status === 'trial' ? 'trial' : 'subscription'} expires in ${daysRemaining} day(s). Renew now to avoid interruption.`);
                        }
                        setSubscriptionStatus('active');
                    } else {
                        setSubscriptionStatus('active');
                    }
                } else if (status === 'expired' || status === 'cancelled') {
                    setSubscriptionStatus(status);
                } else if (status === 'pending') {
                    setSubscriptionStatus('pending');
                } else {
                    setSubscriptionStatus('active'); // Default fallback
                }
            } catch (error) {
                console.error('Failed to check subscription:', error);
                // On error, allow access but log the issue
                setSubscriptionStatus('active');
            } finally {
                setLoading(false);
            }
        };

        checkSubscription();
    }, [user?.gymId, isSuperAdmin, isMember]);

    // Show loading spinner
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Redirect to subscription page if subscription is not valid
    if (subscriptionStatus === 'expired' || subscriptionStatus === 'cancelled' || subscriptionStatus === 'none') {
        // Don't redirect if already on the subscription page
        if (location.pathname === '/my-subscription') {
            return children;
        }
        return <Navigate to="/my-subscription" state={{ from: location, reason: subscriptionStatus }} replace />;
    }

    // Render children with optional warning banner
    return (
        <>
            {warning && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                {warning}
                                <a href="/my-subscription" className="font-medium underline ml-2 hover:text-yellow-600">
                                    Manage Subscription
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {children}
        </>
    );
};

export default SubscriptionGuard;
