import Subscription from '../models/Subscription.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import SubscriptionInvoice from '../models/SubscriptionInvoice.js';
import SubscriptionPayment from '../models/SubscriptionPayment.js';
import Gym from '../models/Gym.js';
import { createOrder, verifyPayment, getKeyId, fetchPayment } from '../services/razorpayService.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';

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

        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
        await subscription.save();

        sendSuccess(res, 'Subscription cancelled successfully', subscription);
    } catch (error) {
        sendError(res, 500, 'Failed to cancel subscription', error.message);
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
