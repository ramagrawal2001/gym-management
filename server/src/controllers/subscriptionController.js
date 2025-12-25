import Subscription from '../models/Subscription.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import SubscriptionInvoice from '../models/SubscriptionInvoice.js';
import SubscriptionPayment from '../models/SubscriptionPayment.js';
import SubscriptionAuditLog from '../models/SubscriptionAuditLog.js';
import Gym from '../models/Gym.js';
import { createOrder, verifyPayment, getKeyId, fetchPayment } from '../services/razorpayService.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';

// Helper function to log audit events
const logAudit = async (data) => {
    try {
        await SubscriptionAuditLog.log(data);
    } catch (error) {
        console.error('Audit log error:', error);
    }
};

// @desc    Get all subscriptions (Super Admin)
// @route   GET /api/v1/subscriptions
// @access  Private (Super Admin)
export const getSubscriptions = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, gymId } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (status) query.status = status;
        if (gymId) query.gymId = gymId;

        const subscriptions = await Subscription.find(query)
            .populate('gymId', 'name contact.email')
            .populate('planId', 'name price duration')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Subscription.countDocuments(query);

        sendSuccess(res, 'Subscriptions retrieved successfully', subscriptions, {
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        sendError(res, 500, 'Failed to get subscriptions', error.message);
    }
};

// @desc    Get my gym's subscription (Owner)
// @route   GET /api/v1/subscriptions/me
// @access  Private (Owner)
export const getMySubscription = async (req, res) => {
    try {
        if (!req.user.gymId) {
            return sendError(res, 400, 'Gym ID not found for this user');
        }

        const subscription = await Subscription.findOne({
            gymId: req.user.gymId
        })
            .populate('planId', 'name price duration features')
            .populate('gymId', 'name');

        sendSuccess(res, 'Subscription retrieved successfully', subscription);
    } catch (error) {
        sendError(res, 500, 'Failed to get subscription', error.message);
    }
};

// @desc    Create Razorpay order for payment
// @route   POST /api/v1/subscriptions/create-order
// @access  Private or Public (via token)
export const createPaymentOrder = async (req, res) => {
    try {
        const { planId, paymentLinkToken } = req.body;
        let plan;

        // Get plan either by ID (logged in) or by token (public link)
        if (paymentLinkToken) {
            plan = await SubscriptionPlan.findOne({
                paymentLinkToken,
                isActive: true
            }).populate('gymId', 'name');
        } else if (planId) {
            plan = await SubscriptionPlan.findById(planId).populate('gymId', 'name');
        }

        if (!plan) {
            return sendError(res, 404, 'Subscription plan not found');
        }

        if (plan.isPaid) {
            return sendError(res, 400, 'This plan has already been paid');
        }

        // Create invoice
        const invoice = await SubscriptionInvoice.create({
            gymId: plan.gymId._id,
            planId: plan._id,
            amount: plan.price,
            tax: 0,
            total: plan.price,
            currency: 'INR',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            description: `Subscription: ${plan.name} - ${plan.duration}`
        });

        // Create Razorpay order
        const order = await createOrder({
            amount: plan.price,
            currency: 'INR',
            receipt: invoice.invoiceNumber,
            notes: {
                planId: plan._id.toString(),
                gymId: plan.gymId._id.toString(),
                invoiceId: invoice._id.toString()
            }
        });

        // Create payment record
        await SubscriptionPayment.create({
            invoiceId: invoice._id,
            gymId: plan.gymId._id,
            planId: plan._id,
            razorpayOrderId: order.id,
            amount: plan.price,
            currency: 'INR',
            status: 'created'
        });

        // Log audit
        await logAudit({
            gymId: plan.gymId._id,
            planId: plan._id,
            action: 'payment_initiated',
            description: `Payment order created for ${plan.name}`,
            metadata: { amount: plan.price, currency: 'INR' },
            performedByRole: 'system'
        });

        sendCreated(res, 'Payment order created successfully', {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: getKeyId(),
            plan: {
                id: plan._id,
                name: plan.name,
                duration: plan.duration,
                price: plan.price
            },
            gym: {
                id: plan.gymId._id,
                name: plan.gymId.name
            }
        });
    } catch (error) {
        sendError(res, 500, 'Failed to create payment order', error.message);
    }
};

// @desc    Verify payment and activate subscription
// @route   POST /api/v1/subscriptions/verify-payment
// @access  Public
export const verifyPaymentAndActivate = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            planId
        } = req.body;

        // Verify signature
        const isValid = verifyPayment({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        });

        if (!isValid) {
            return sendError(res, 400, 'Payment verification failed - invalid signature');
        }

        // Find payment record
        const payment = await SubscriptionPayment.findOne({
            razorpayOrderId: razorpay_order_id
        });

        if (!payment) {
            return sendError(res, 404, 'Payment record not found');
        }

        // Fetch payment details from Razorpay
        const paymentDetails = await fetchPayment(razorpay_payment_id);

        // Update payment record
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.status = 'captured';
        payment.method = paymentDetails.method;
        payment.bank = paymentDetails.bank;
        payment.wallet = paymentDetails.wallet;
        payment.vpa = paymentDetails.vpa;
        payment.paidAt = new Date();
        await payment.save();

        // Update invoice
        const invoice = await SubscriptionInvoice.findById(payment.invoiceId);
        if (invoice) {
            invoice.status = 'paid';
            invoice.paidAt = new Date();
            await invoice.save();
        }

        // Get plan and update
        const plan = await SubscriptionPlan.findById(payment.planId);
        if (plan) {
            plan.isPaid = true;
            plan.paidAt = new Date();
            await plan.save();

            // Create or update subscription
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + plan.durationDays);

            let subscription = await Subscription.findOne({ gymId: plan.gymId });
            const previousState = subscription ? { ...subscription.toObject() } : null;

            if (subscription) {
                // Extend existing subscription
                if (subscription.endDate && subscription.endDate > startDate) {
                    // Add to existing end date
                    endDate.setDate(subscription.endDate.getDate() + plan.durationDays);
                }
                subscription.planId = plan._id;
                subscription.status = 'active';
                subscription.startDate = startDate;
                subscription.endDate = endDate;
                await subscription.save();
            } else {
                // Create new subscription
                subscription = await Subscription.create({
                    gymId: plan.gymId,
                    planId: plan._id,
                    status: 'active',
                    startDate,
                    endDate
                });
            }

            // Update gym features based on plan
            await Gym.findByIdAndUpdate(plan.gymId, {
                'features.crm': plan.features.crm,
                'features.scheduling': plan.features.scheduling,
                'features.attendance': plan.features.attendance,
                'features.inventory': plan.features.inventory,
                'features.staff': plan.features.staff,
                'features.payments': plan.features.payments,
                'features.reports': plan.features.reports
            });

            // Log audit
            await logAudit({
                subscriptionId: subscription._id,
                gymId: plan.gymId,
                planId: plan._id,
                action: previousState ? 'subscription_activated' : 'subscription_created',
                description: `Subscription ${previousState ? 'activated' : 'created'} for ${plan.name}`,
                previousState,
                newState: subscription.toObject(),
                metadata: {
                    paymentId: razorpay_payment_id,
                    amount: plan.price
                },
                performedByRole: 'system'
            });
        }

        sendSuccess(res, 'Payment verified and subscription activated successfully', {
            paymentId: razorpay_payment_id,
            status: 'success'
        });
    } catch (error) {
        sendError(res, 500, 'Failed to verify payment', error.message);
    }
};

// @desc    Get payment history for a gym
// @route   GET /api/v1/subscriptions/payments
// @access  Private
export const getPaymentHistory = async (req, res) => {
    try {
        const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.user.gymId;

        if (!gymId) {
            return sendError(res, 400, 'Gym ID is required');
        }

        const payments = await SubscriptionPayment.find({ gymId })
            .populate('planId', 'name price duration')
            .populate('invoiceId', 'invoiceNumber total')
            .sort({ createdAt: -1 });

        sendSuccess(res, 'Payment history retrieved successfully', payments);
    } catch (error) {
        sendError(res, 500, 'Failed to get payment history', error.message);
    }
};

// @desc    Get invoices for a gym
// @route   GET /api/v1/subscriptions/invoices
// @access  Private
export const getInvoices = async (req, res) => {
    try {
        const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.user.gymId;

        if (!gymId) {
            return sendError(res, 400, 'Gym ID is required');
        }

        const invoices = await SubscriptionInvoice.find({ gymId })
            .populate('planId', 'name price duration')
            .sort({ createdAt: -1 });

        sendSuccess(res, 'Invoices retrieved successfully', invoices);
    } catch (error) {
        sendError(res, 500, 'Failed to get invoices', error.message);
    }
};

// @desc    Cancel subscription
// @route   PUT /api/v1/subscriptions/:id/cancel
// @access  Private (Super Admin)
export const cancelSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return sendError(res, 404, 'Subscription not found');
        }

        const previousState = { ...subscription.toObject() };
        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
        await subscription.save();

        // Log audit
        await logAudit({
            subscriptionId: subscription._id,
            gymId: subscription.gymId,
            planId: subscription.planId,
            action: 'subscription_cancelled',
            description: 'Subscription cancelled by admin',
            previousState,
            newState: subscription.toObject(),
            performedBy: req.user._id,
            performedByRole: req.user.role
        });

        sendSuccess(res, 'Subscription cancelled successfully', subscription);
    } catch (error) {
        sendError(res, 500, 'Failed to cancel subscription', error.message);
    }
};

// @desc    Upgrade subscription plan
// @route   PUT /api/v1/subscriptions/:id/upgrade
// @access  Private (Super Admin, Owner)
export const upgradeSubscription = async (req, res) => {
    try {
        const { newPlanId } = req.body;
        const subscription = await Subscription.findById(req.params.id).populate('planId');

        if (!subscription) {
            return sendError(res, 404, 'Subscription not found');
        }

        const newPlan = await SubscriptionPlan.findById(newPlanId);
        if (!newPlan) {
            return sendError(res, 404, 'New plan not found');
        }

        // Verify it's an upgrade (new plan price >= current)
        if (newPlan.price < subscription.planId.price) {
            return sendError(res, 400, 'Use downgrade endpoint for lower-priced plans');
        }

        const previousState = { ...subscription.toObject() };

        // Calculate proration credit
        const now = new Date();
        const daysRemaining = Math.max(0, Math.ceil((subscription.endDate - now) / (1000 * 60 * 60 * 24)));
        const dailyRate = subscription.planId.price / subscription.planId.durationDays;
        const proratedCredit = Math.round(daysRemaining * dailyRate);
        const amountDue = Math.max(0, newPlan.price - proratedCredit);

        // Update subscription
        subscription.planId = newPlan._id;
        subscription.endDate = new Date(now.getTime() + newPlan.durationDays * 24 * 60 * 60 * 1000);
        await subscription.save();

        // Update gym features
        await Gym.findByIdAndUpdate(subscription.gymId, {
            'features.crm': newPlan.features.crm,
            'features.scheduling': newPlan.features.scheduling,
            'features.attendance': newPlan.features.attendance,
            'features.inventory': newPlan.features.inventory,
            'features.staff': newPlan.features.staff,
            'features.payments': newPlan.features.payments,
            'features.reports': newPlan.features.reports
        });

        // Log audit
        await logAudit({
            subscriptionId: subscription._id,
            gymId: subscription.gymId,
            planId: newPlan._id,
            action: 'subscription_upgraded',
            description: `Upgraded from ${previousState.planId.name} to ${newPlan.name}`,
            previousState,
            newState: subscription.toObject(),
            metadata: { proratedCredit, amountDue },
            performedBy: req.user._id,
            performedByRole: req.user.role
        });

        sendSuccess(res, 'Subscription upgraded successfully', {
            subscription,
            proration: {
                daysRemaining,
                proratedCredit,
                amountDue
            }
        });
    } catch (error) {
        sendError(res, 500, 'Failed to upgrade subscription', error.message);
    }
};

// @desc    Downgrade subscription plan
// @route   PUT /api/v1/subscriptions/:id/downgrade
// @access  Private (Super Admin, Owner)
export const downgradeSubscription = async (req, res) => {
    try {
        const { newPlanId, effectiveDate } = req.body;
        const subscription = await Subscription.findById(req.params.id).populate('planId');

        if (!subscription) {
            return sendError(res, 404, 'Subscription not found');
        }

        const newPlan = await SubscriptionPlan.findById(newPlanId);
        if (!newPlan) {
            return sendError(res, 404, 'New plan not found');
        }

        // Verify it's a downgrade (new plan price < current)
        if (newPlan.price >= subscription.planId.price) {
            return sendError(res, 400, 'Use upgrade endpoint for higher-priced plans');
        }

        const previousState = { ...subscription.toObject() };

        // Downgrade takes effect at end of current period or specified date
        const downgradeDate = effectiveDate ? new Date(effectiveDate) : subscription.endDate;

        // Store pending downgrade
        subscription.pendingDowngrade = {
            planId: newPlan._id,
            effectiveDate: downgradeDate
        };
        await subscription.save();

        // Log audit
        await logAudit({
            subscriptionId: subscription._id,
            gymId: subscription.gymId,
            planId: newPlan._id,
            action: 'subscription_downgraded',
            description: `Downgrade scheduled to ${newPlan.name} on ${downgradeDate.toISOString()}`,
            previousState,
            newState: subscription.toObject(),
            performedBy: req.user._id,
            performedByRole: req.user.role
        });

        sendSuccess(res, 'Subscription downgrade scheduled successfully', {
            subscription,
            effectiveDate: downgradeDate
        });
    } catch (error) {
        sendError(res, 500, 'Failed to downgrade subscription', error.message);
    }
};

// @desc    Approve manual payment
// @route   PUT /api/v1/subscriptions/invoices/:id/approve-manual
// @access  Private (Super Admin)
export const approveManualPayment = async (req, res) => {
    try {
        const { paymentMethod, transactionId, notes } = req.body;
        const invoice = await SubscriptionInvoice.findById(req.params.id);

        if (!invoice) {
            return sendError(res, 404, 'Invoice not found');
        }

        if (invoice.status === 'paid') {
            return sendError(res, 400, 'Invoice already paid');
        }

        // Update invoice
        invoice.status = 'paid';
        invoice.paidAt = new Date();
        invoice.notes = notes || `Manual payment approved - ${paymentMethod}`;
        await invoice.save();

        // Create payment record for manual payment
        const payment = await SubscriptionPayment.create({
            invoiceId: invoice._id,
            gymId: invoice.gymId,
            planId: invoice.planId,
            razorpayOrderId: `MANUAL-${Date.now()}`,
            razorpayPaymentId: transactionId || `MANUAL-${Date.now()}`,
            amount: invoice.total,
            currency: invoice.currency,
            status: 'captured',
            method: paymentMethod || 'manual',
            paidAt: new Date(),
            notes: 'Manual payment'
        });

        // Update plan as paid
        const plan = await SubscriptionPlan.findById(invoice.planId);
        if (plan) {
            plan.isPaid = true;
            plan.paidAt = new Date();
            await plan.save();

            // Create or update subscription
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + plan.durationDays);

            let subscription = await Subscription.findOne({ gymId: invoice.gymId });

            if (subscription) {
                if (subscription.endDate && subscription.endDate > startDate) {
                    endDate.setDate(subscription.endDate.getDate() + plan.durationDays);
                }
                subscription.planId = plan._id;
                subscription.status = 'active';
                subscription.startDate = startDate;
                subscription.endDate = endDate;
                await subscription.save();
            } else {
                subscription = await Subscription.create({
                    gymId: invoice.gymId,
                    planId: plan._id,
                    status: 'active',
                    startDate,
                    endDate
                });
            }

            // Update gym features
            await Gym.findByIdAndUpdate(invoice.gymId, {
                'features.crm': plan.features.crm,
                'features.scheduling': plan.features.scheduling,
                'features.attendance': plan.features.attendance,
                'features.inventory': plan.features.inventory,
                'features.staff': plan.features.staff,
                'features.payments': plan.features.payments,
                'features.reports': plan.features.reports
            });
        }

        // Log audit
        await logAudit({
            gymId: invoice.gymId,
            planId: invoice.planId,
            action: 'manual_payment_approved',
            description: `Manual payment approved for invoice ${invoice.invoiceNumber}`,
            metadata: {
                invoiceId: invoice._id.toString(),
                paymentMethod,
                transactionId,
                amount: invoice.total
            },
            performedBy: req.user._id,
            performedByRole: req.user.role
        });

        sendSuccess(res, 'Manual payment approved successfully', { invoice, payment });
    } catch (error) {
        sendError(res, 500, 'Failed to approve manual payment', error.message);
    }
};

// @desc    Check and update expired subscriptions (called by cron/scheduler)
// @route   POST /api/v1/subscriptions/check-expiry
// @access  Private (Super Admin or System)
export const checkAndExpireSubscriptions = async (req, res) => {
    try {
        const now = new Date();
        const gracePeriodDays = 3; // 3 days grace period
        const graceDate = new Date(now.getTime() - gracePeriodDays * 24 * 60 * 60 * 1000);

        // Find expired subscriptions
        const expiredSubscriptions = await Subscription.find({
            status: 'active',
            endDate: { $lt: graceDate }
        }).populate('gymId', 'name');

        const results = [];

        for (const subscription of expiredSubscriptions) {
            const previousState = { ...subscription.toObject() };
            subscription.status = 'expired';
            await subscription.save();

            // Log audit
            await logAudit({
                subscriptionId: subscription._id,
                gymId: subscription.gymId._id,
                planId: subscription.planId,
                action: 'subscription_expired',
                description: `Subscription expired for ${subscription.gymId.name}`,
                previousState,
                newState: subscription.toObject(),
                performedByRole: 'system'
            });

            results.push({
                gymId: subscription.gymId._id,
                gymName: subscription.gymId.name,
                expiredAt: subscription.endDate
            });
        }

        // Process pending downgrades
        const pendingDowngrades = await Subscription.find({
            'pendingDowngrade.effectiveDate': { $lte: now }
        }).populate('pendingDowngrade.planId');

        for (const subscription of pendingDowngrades) {
            if (subscription.pendingDowngrade?.planId) {
                const newPlan = subscription.pendingDowngrade.planId;
                subscription.planId = newPlan._id;
                subscription.endDate = new Date(now.getTime() + newPlan.durationDays * 24 * 60 * 60 * 1000);
                subscription.pendingDowngrade = undefined;
                await subscription.save();

                // Update gym features
                await Gym.findByIdAndUpdate(subscription.gymId, {
                    'features.crm': newPlan.features.crm,
                    'features.scheduling': newPlan.features.scheduling,
                    'features.attendance': newPlan.features.attendance,
                    'features.inventory': newPlan.features.inventory,
                    'features.staff': newPlan.features.staff,
                    'features.payments': newPlan.features.payments,
                    'features.reports': newPlan.features.reports
                });
            }
        }

        sendSuccess(res, 'Expiry check completed', {
            expiredCount: results.length,
            processedDowngrades: pendingDowngrades.length,
            expired: results
        });
    } catch (error) {
        sendError(res, 500, 'Failed to check expired subscriptions', error.message);
    }
};

// @desc    Get audit logs for a gym
// @route   GET /api/v1/subscriptions/audit-logs
// @access  Private (Super Admin, Owner)
export const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, action } = req.query;
        const skip = (page - 1) * limit;

        const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.user.gymId;

        const query = {};
        if (gymId) query.gymId = gymId;
        if (action) query.action = action;

        const logs = await SubscriptionAuditLog.find(query)
            .populate('gymId', 'name')
            .populate('planId', 'name')
            .populate('performedBy', 'firstName lastName email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await SubscriptionAuditLog.countDocuments(query);

        sendSuccess(res, 'Audit logs retrieved successfully', logs, {
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        sendError(res, 500, 'Failed to get audit logs', error.message);
    }
};

// @desc    Razorpay webhook handler
// @route   POST /api/v1/webhooks/razorpay
// @access  Public
export const handleRazorpayWebhook = async (req, res) => {
    try {
        const { event, payload } = req.body;

        // Handle different webhook events
        switch (event) {
            case 'payment.captured':
                const paymentEntity = payload.payment.entity;
                const payment = await SubscriptionPayment.findOne({
                    razorpayOrderId: paymentEntity.order_id
                });

                if (payment && payment.status !== 'captured') {
                    payment.razorpayPaymentId = paymentEntity.id;
                    payment.status = 'captured';
                    payment.method = paymentEntity.method;
                    payment.paidAt = new Date();
                    await payment.save();

                    // Update invoice and subscription if not already done
                    const invoice = await SubscriptionInvoice.findById(payment.invoiceId);
                    if (invoice && invoice.status !== 'paid') {
                        invoice.status = 'paid';
                        invoice.paidAt = new Date();
                        await invoice.save();
                    }

                    // Log audit
                    await logAudit({
                        gymId: payment.gymId,
                        planId: payment.planId,
                        action: 'payment_completed',
                        description: `Payment completed via webhook`,
                        metadata: {
                            paymentId: paymentEntity.id,
                            amount: paymentEntity.amount / 100,
                            method: paymentEntity.method
                        },
                        performedByRole: 'system'
                    });
                }
                break;

            case 'payment.failed':
                const failedPayment = payload.payment.entity;
                const failedRecord = await SubscriptionPayment.findOne({
                    razorpayOrderId: failedPayment.order_id
                });

                if (failedRecord) {
                    failedRecord.status = 'failed';
                    failedRecord.errorCode = failedPayment.error_code;
                    failedRecord.errorDescription = failedPayment.error_description;
                    await failedRecord.save();

                    // Update invoice
                    const failedInvoice = await SubscriptionInvoice.findById(failedRecord.invoiceId);
                    if (failedInvoice) {
                        failedInvoice.status = 'failed';
                        await failedInvoice.save();
                    }

                    // Log audit
                    await logAudit({
                        gymId: failedRecord.gymId,
                        planId: failedRecord.planId,
                        action: 'payment_failed',
                        description: `Payment failed: ${failedPayment.error_description}`,
                        metadata: {
                            errorCode: failedPayment.error_code,
                            errorDescription: failedPayment.error_description
                        },
                        performedByRole: 'system'
                    });
                }
                break;

            default:
                console.log('Unhandled webhook event:', event);
        }

        // Always respond with 200 to acknowledge receipt
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(200).json({ status: 'ok' }); // Always return 200 to prevent retries
    }
};

