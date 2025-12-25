import api from './api';

// Get all subscriptions (Super Admin)
export const getSubscriptions = async (params = {}) => {
    const response = await api.get('/subscriptions', { params });
    return response.data;
};

// Get my subscription (Owner)
export const getMySubscription = async () => {
    const response = await api.get('/subscriptions/me');
    return response.data;
};

// Create Razorpay order
export const createPaymentOrder = async (data) => {
    const response = await api.post('/subscriptions/create-order', data);
    return response.data;
};

// Verify payment
export const verifyPayment = async (paymentData) => {
    const response = await api.post('/subscriptions/verify-payment', paymentData);
    return response.data;
};

// Get payment history
export const getPaymentHistory = async (gymId = null) => {
    const params = gymId ? { gymId } : {};
    const response = await api.get('/subscriptions/payments', { params });
    return response.data;
};

// Get invoices
export const getInvoices = async (gymId = null) => {
    const params = gymId ? { gymId } : {};
    const response = await api.get('/subscriptions/invoices', { params });
    return response.data;
};

// Cancel subscription (Super Admin)
export const cancelSubscription = async (id) => {
    const response = await api.put(`/subscriptions/${id}/cancel`);
    return response.data;
};

/**
 * Load Razorpay checkout script
 * @returns {Promise<boolean>}
 */
export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

/**
 * Open Razorpay checkout
 * @param {Object} options - Checkout options
 * @returns {Promise<Object>} - Payment response
 */
export const openRazorpayCheckout = (options) => {
    return new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay({
            key: options.keyId,
            amount: options.amount,
            currency: options.currency || 'INR',
            name: options.name || 'GymOS',
            description: options.description,
            order_id: options.orderId,
            prefill: options.prefill || {},
            theme: {
                color: '#2563eb'
            },
            handler: function (response) {
                resolve(response);
            },
            modal: {
                ondismiss: function () {
                    reject(new Error('Payment cancelled'));
                }
            }
        });

        razorpay.on('payment.failed', function (response) {
            reject(response.error);
        });

        razorpay.open();
    });
};

export default {
    getSubscriptions,
    getMySubscription,
    createPaymentOrder,
    verifyPayment,
    getPaymentHistory,
    getInvoices,
    cancelSubscription,
    loadRazorpayScript,
    openRazorpayCheckout
};
