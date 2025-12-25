import Subscription from '../models/Subscription.js';
import { sendError } from '../utils/responseFormatter.js';

/**
 * Middleware to check if a gym's subscription is active
 * Can be used to guard routes that require an active subscription
 * 
 * Options:
 * - gracePeriod: Number of days grace period after expiry (default: 3)
 * - blockAccess: If true, blocks access when expired (default: false - just warns)
 * - requiredFeatures: Array of features that must be enabled in the subscription
 */
export const checkSubscription = (options = {}) => {
    const { gracePeriod = 3, blockAccess = false, requiredFeatures = [] } = options;

    return async (req, res, next) => {
        try {
            // Super admins bypass subscription checks
            if (req.user?.role === 'super_admin') {
                return next();
            }

            // Get gym ID from user
            const gymId = req.user?.gymId;
            if (!gymId) {
                if (blockAccess) {
                    return sendError(res, 403, 'No gym associated with this user');
                }
                return next();
            }

            // Find subscription for this gym
            const subscription = await Subscription.findOne({ gymId })
                .populate('planId', 'name features');

            // No subscription found
            if (!subscription) {
                if (blockAccess) {
                    return sendError(res, 403, 'No active subscription found for this gym');
                }
                req.subscriptionStatus = 'none';
                return next();
            }

            // Check subscription status
            const now = new Date();
            const graceDate = new Date(now.getTime() - gracePeriod * 24 * 60 * 60 * 1000);

            if (subscription.status === 'active' || subscription.status === 'trial') {
                // Check if actually expired (end date passed)
                const endDate = subscription.status === 'trial'
                    ? subscription.trialEndsAt
                    : subscription.endDate;

                if (endDate && endDate < now) {
                    // Within grace period?
                    if (endDate >= graceDate) {
                        req.subscriptionStatus = 'grace';
                        req.subscriptionMessage = `Subscription expired. Grace period ends in ${Math.ceil((graceDate.getTime() - now.getTime() + gracePeriod * 24 * 60 * 60 * 1000) / (24 * 60 * 60 * 1000))} days.`;
                    } else {
                        // Past grace period
                        if (blockAccess) {
                            return sendError(res, 403, 'Subscription has expired. Please renew to continue.', {
                                subscriptionStatus: 'expired',
                                expiredAt: endDate
                            });
                        }
                        req.subscriptionStatus = 'expired';
                    }
                } else {
                    req.subscriptionStatus = 'active';
                }
            } else if (subscription.status === 'expired' || subscription.status === 'cancelled') {
                if (blockAccess) {
                    return sendError(res, 403, `Subscription is ${subscription.status}. Please renew to continue.`, {
                        subscriptionStatus: subscription.status
                    });
                }
                req.subscriptionStatus = subscription.status;
            } else {
                req.subscriptionStatus = subscription.status;
            }

            // Check required features
            if (requiredFeatures.length > 0 && subscription.planId?.features) {
                const missingFeatures = requiredFeatures.filter(
                    feature => !subscription.planId.features[feature]
                );

                if (missingFeatures.length > 0) {
                    if (blockAccess) {
                        return sendError(res, 403, `Your plan does not include: ${missingFeatures.join(', ')}. Please upgrade.`, {
                            missingFeatures
                        });
                    }
                    req.missingFeatures = missingFeatures;
                }
            }

            // Attach subscription to request for use in controllers
            req.subscription = subscription;

            next();
        } catch (error) {
            console.error('Subscription check error:', error);
            // Don't block on errors, just log and continue
            next();
        }
    };
};

/**
 * Strict subscription guard - blocks access if subscription is not active
 */
export const requireActiveSubscription = checkSubscription({ blockAccess: true });

/**
 * Feature guard - blocks access if subscription doesn't have required features
 */
export const requireFeature = (...features) => checkSubscription({
    blockAccess: true,
    requiredFeatures: features
});

export default checkSubscription;
