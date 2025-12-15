import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';

// @desc    Get member's own payments
// @route   GET /api/v1/payments/me
// @access  Private (Member)
export const getMyPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Find member record
    const Member = (await import('../models/Member.js')).default;
    const member = await Member.findOne({ userId: req.user._id });
    
    if (!member) {
      return sendError(res, 404, 'Member profile not found');
    }

    const query = { memberId: member._id };
    
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

// @desc    Get all payments
// @route   GET /api/v1/payments
// @access  Private (Owner, Super Admin - Staff and Members cannot access)
export const getPayments = async (req, res) => {
  try {
    // Staff and members cannot access all payments
    if (req.user.role === 'staff' || req.user.role === 'member') {
      if (req.user.role === 'member') {
        return getMyPayments(req, res);
      }
      return sendError(res, 403, 'Access denied: Staff cannot access payments');
    }

    const { page = 1, limit = 10, memberId, invoiceId, status } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query - super admin can see all or filter by gymId
    const query = {};
    if (req.user.role === 'super_admin') {
      if (req.query.gymId) {
        query.gymId = req.query.gymId;
      }
      // If no gymId provided, query will be empty and return all payments
    } else {
      query.gymId = req.gymId || req.user.gymId;
    }
    
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
      .populate('gymId', 'name')
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
      .populate('memberId', 'memberId userId')
      .populate('memberId.userId', 'firstName lastName email phone');

    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    // Members can only view their own payments
    if (req.user.role === 'member') {
      if (payment.memberId.userId._id.toString() !== req.user._id.toString()) {
        return sendError(res, 403, 'Access denied: Cannot view other members\' payments');
      }
    }

    // Staff cannot access payments
    if (req.user.role === 'staff') {
      return sendError(res, 403, 'Access denied: Staff cannot access payments');
    }

    // Owner/Super Admin can view payments from their gym
    if (req.user.role !== 'super_admin' && req.user.role !== 'member') {
      if (payment.gymId.toString() !== req.user.gymId.toString()) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
    }

    sendSuccess(res, 'Payment retrieved successfully', payment);
  } catch (error) {
    sendError(res, 500, 'Failed to get payment', error.message);
  }
};

// @desc    Create payment
// @route   POST /api/v1/payments
// @access  Private (Owner or Super Admin only)
export const createPayment = async (req, res) => {
  try {
    // Staff and members cannot create payments
    if (req.user.role === 'staff' || req.user.role === 'member') {
      return sendError(res, 403, 'Access denied: Only owners can create payments');
    }

    const { invoiceId, amount, method, transactionId, notes } = req.body;
    const gymId = req.gymId || req.user.gymId;

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
// @access  Private (Owner or Super Admin only)
export const updatePayment = async (req, res) => {
  try {
    // Staff and members cannot update payments
    if (req.user.role === 'staff' || req.user.role === 'member') {
      return sendError(res, 403, 'Access denied: Only owners can update payments');
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    // Verify gym scope for non-super-admin
    if (req.user.role !== 'super_admin') {
      if (payment.gymId.toString() !== req.user.gymId.toString()) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
    }

    const updated = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('invoiceId', 'invoiceNumber total')
      .populate('memberId', 'memberId')
      .populate('memberId.userId', 'firstName lastName email');

    sendSuccess(res, 'Payment updated successfully', updated);
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

