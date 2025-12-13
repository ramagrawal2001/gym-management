import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';

// @desc    Get all payments
// @route   GET /api/v1/payments
// @access  Private
export const getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, memberId, invoiceId, status } = req.query;
    const skip = (page - 1) * limit;
    const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.user.gymId;

    const query = { gymId };
    
    if (memberId) {
      query.memberId = memberId;
    }

    if (invoiceId) {
      query.invoiceId = invoiceId;
    }

    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('invoiceId', 'invoiceNumber total')
      .populate('memberId', 'memberId')
      .populate('memberId.userId', 'firstName lastName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ paidAt: -1 });

    const total = await Payment.countDocuments(query);

    sendSuccess(res, 'Payments retrieved successfully', payments, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get payments', error.message);
  }
};

// @desc    Get single payment
// @route   GET /api/v1/payments/:id
// @access  Private
export const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('invoiceId', 'invoiceNumber total items')
      .populate('memberId', 'memberId')
      .populate('memberId.userId', 'firstName lastName email phone');

    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    sendSuccess(res, 'Payment retrieved successfully', payment);
  } catch (error) {
    sendError(res, 500, 'Failed to get payment', error.message);
  }
};

// @desc    Create payment
// @route   POST /api/v1/payments
// @access  Private (Staff or above)
export const createPayment = async (req, res) => {
  try {
    const { invoiceId, amount, method, transactionId, notes } = req.body;
    const gymId = req.user.gymId;

    // Get invoice
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return sendError(res, 404, 'Invoice not found');
    }

    // Create payment
    const payment = await Payment.create({
      invoiceId,
      memberId: invoice.memberId,
      gymId,
      amount: amount || invoice.total,
      method,
      transactionId,
      notes,
      status: 'completed',
      paidAt: new Date()
    });

    // Update invoice status
    invoice.status = 'paid';
    invoice.paidAt = new Date();
    await invoice.save();

    const populated = await Payment.findById(payment._id)
      .populate('invoiceId', 'invoiceNumber total')
      .populate('memberId', 'memberId')
      .populate('memberId.userId', 'firstName lastName email');

    sendCreated(res, 'Payment created successfully', populated);
  } catch (error) {
    sendError(res, 500, 'Failed to create payment', error.message);
  }
};

// @desc    Update payment
// @route   PUT /api/v1/payments/:id
// @access  Private (Staff or above)
export const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('invoiceId', 'invoiceNumber total')
      .populate('memberId', 'memberId')
      .populate('memberId.userId', 'firstName lastName email');

    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    sendSuccess(res, 'Payment updated successfully', payment);
  } catch (error) {
    sendError(res, 500, 'Failed to update payment', error.message);
  }
};

// @desc    Delete payment
// @route   DELETE /api/v1/payments/:id
// @access  Private (Owner or Super Admin)
export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    // Update invoice status back to pending
    const invoice = await Invoice.findById(payment.invoiceId);
    if (invoice) {
      invoice.status = 'pending';
      invoice.paidAt = undefined;
      await invoice.save();
    }

    await payment.deleteOne();

    sendSuccess(res, 'Payment deleted successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to delete payment', error.message);
  }
};

