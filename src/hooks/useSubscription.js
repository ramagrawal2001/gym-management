import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { getMySubscription } from '../services/subscriptionService';

/**
 * Hook to check subscription status
 * Returns subscription info and helper functions
 */
export const useSubscription = () => {
    const { user } = useSelector((state) => state.auth);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState('unknown');

    const fetchSubscription = useCallback(async () => {
        // Super admins don't need subscription
        if (user?.role === 'super_admin') {
            setSubscriptionStatus('active');
            setLoading(false);
            return;
        }

        // Members don't need subscription check
        if (user?.role === 'member') {
            setSubscriptionStatus('active');
            setLoading(false);
            return;
        }

        // Only check for users with a gym (owner/staff)
        if (!user?.gymId) {
            setSubscriptionStatus('none');
            setLoading(false);
            return;
        }

        try {
            const response = await getMySubscription();
            const sub = response.data;
            setSubscription(sub);

            if (!sub) {
                setSubscriptionStatus('none');
                return;
            }

            const now = new Date();
            const status = sub.status;

            if (status === 'active' || status === 'trial') {
                const endDate = status === 'trial'
                    ? new Date(sub.trialEndsAt)
                    : new Date(sub.endDate);

                if (endDate && endDate < now) {
                    // Check grace period (3 days)
                    const gracePeriodMs = 3 * 24 * 60 * 60 * 1000;
                    const graceEndDate = new Date(endDate.getTime() + gracePeriodMs);

                    if (now < graceEndDate) {
                        setSubscriptionStatus('grace');
                    } else {
                        setSubscriptionStatus('expired');
                    }
                } else {
                    setSubscriptionStatus('active');
                }
            } else {
                setSubscriptionStatus(status);
            }
        } catch (error) {
            console.error('Failed to fetch subscription:', error);
            setSubscriptionStatus('error');
        } finally {
            setLoading(false);
        }
    }, [user?.gymId, user?.role]);

    useEffect(() => {
        if (user) {
            fetchSubscription();
        }
    }, [user, fetchSubscription]);

    /**
     * Check if user has active subscription
     * Returns true for super_admin, members, and users with active/trial/grace status
     */
    const hasActiveSubscription = () => {
        if (user?.role === 'super_admin' || user?.role === 'member') {
            return true;
        }
        return ['active', 'trial', 'grace'].includes(subscriptionStatus);
    };

    /**
     * Check if subscription is expiring soon (within 7 days)
     */
    const isExpiringSoon = () => {
        if (!subscription) return false;
        const endDate = subscription.status === 'trial'
            ? new Date(subscription.trialEndsAt)
            : new Date(subscription.endDate);

        if (!endDate) return false;

        const now = new Date();
        const daysRemaining = Math.ceil((endDate - now) / (24 * 60 * 60 * 1000));
        return daysRemaining > 0 && daysRemaining <= 7;
    };

    return {
        subscription,
        subscriptionStatus,
        loading,
        hasActiveSubscription,
        isExpiringSoon,
        refetch: fetchSubscription
    };
};

export default useSubscription;
