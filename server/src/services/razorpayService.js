import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_R7hkZuz4gwixPc',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '50Cf69VnPooznrP9ouZkemLr'
});

/**
 * Create a Razorpay order for payment
 * @param {Object} options - Order options
 * @param {number} options.amount - Amount in paise (INR smallest unit)
 * @param {string} options.currency - Currency code (default: INR)
 * @param {string} options.receipt - Unique receipt ID
 * @param {Object} options.notes - Additional notes
 * @returns {Promise<Object>} - Razorpay order object
 */
export const createOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
    try {
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt,
            notes
        });
        return order;
    } catch (error) {
        console.error('Razorpay createOrder error:', error);
        throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
};

/**
 * Verify Razorpay payment signature
 * @param {Object} paymentDetails - Payment details from Razorpay
 * @param {string} paymentDetails.razorpay_order_id - Order ID
 * @param {string} paymentDetails.razorpay_payment_id - Payment ID
 * @param {string} paymentDetails.razorpay_signature - Signature to verify
 * @returns {boolean} - Whether signature is valid
 */
export const verifyPayment = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
    try {
        const keySecret = process.env.RAZORPAY_KEY_SECRET || '50Cf69VnPooznrP9ouZkemLr';
        const body = razorpay_order_id + '|' + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(body.toString())
            .digest('hex');

        return expectedSignature === razorpay_signature;
    } catch (error) {
        console.error('Razorpay verifyPayment error:', error);
        return false;
    }
};

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} - Payment details
 */
export const fetchPayment = async (paymentId) => {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        console.error('Razorpay fetchPayment error:', error);
        throw new Error(`Failed to fetch payment: ${error.message}`);
    }
};

/**
 * Fetch order details from Razorpay
 * @param {string} orderId - Razorpay order ID
 * @returns {Promise<Object>} - Order details
 */
export const fetchOrder = async (orderId) => {
    try {
        const order = await razorpay.orders.fetch(orderId);
        return order;
    } catch (error) {
        console.error('Razorpay fetchOrder error:', error);
        throw new Error(`Failed to fetch order: ${error.message}`);
    }
};

/**
 * Verify webhook signature
 * @param {string} body - Raw request body
 * @param {string} signature - X-Razorpay-Signature header
 * @param {string} secret - Webhook secret (from Razorpay dashboard)
 * @returns {boolean} - Whether signature is valid
 */
export const verifyWebhookSignature = (body, signature, secret) => {
    try {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        return expectedSignature === signature;
    } catch (error) {
        console.error('Razorpay verifyWebhookSignature error:', error);
        return false;
    }
};

/**
 * Get Razorpay key ID for frontend
 * @returns {string} - Key ID
 */
export const getKeyId = () => {
    return process.env.RAZORPAY_KEY_ID || 'rzp_test_R7hkZuz4gwixPc';
};

export default {
    createOrder,
    verifyPayment,
    fetchPayment,
    fetchOrder,
    verifyWebhookSignature,
    getKeyId
};
