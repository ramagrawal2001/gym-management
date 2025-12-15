import Invoice from '../models/Invoice.js';
import Member from '../models/Member.js';
import Plan from '../models/Plan.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';
import { generateInvoiceNumber, calculateInvoiceTotal } from '../services/invoiceService.js';

// @desc    Get member's own invoices
// @route   GET /api/v1/invoices/me
// @access  Private (Member)
export const getMyInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Find member record
    const member = await Member.findOne({ userId: req.user._id });
    
    if (!member) {
      return sendError(res, 404, 'Member profile not found');
    }

    const query = { memberId: member._id };
    
    if (status) {
      query.status = status;
    }

    const invoices = await Invoice.find(query)
      .populate('memberId', 'memberId')
      .populate('memberId.userId', 'firstName lastName email')
      .populate('planId', 'name price')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Invoice.countDocuments(query);

    sendSuccess(res, 'Invoices retrieved successfully', invoices, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get invoices', error.message);
  }
};

// @desc    Get all invoices
// @route   GET /api/v1/invoices
// @access  Private (Owner, Super Admin - Staff and Members cannot access)
export const getInvoices = async (req, res) => {
  try {
    // Staff and members cannot access all invoices
    if (req.user.role === 'staff' || req.user.role === 'member') {
      if (req.user.role === 'member') {
        return getMyInvoices(req, res);
      }
      return sendError(res, 403, 'Access denied: Staff cannot access invoices');
    }

    const { page = 1, limit = 10, memberId, status, search } = req.query;
    const skip = (page - 1) * limit;
    const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.gymId || req.user.gymId;

    const query = { gymId };
    
    if (memberId) {
      query.memberId = memberId;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.invoiceNumber = { $regex: search, $options: 'i' };
    }

    const invoices = await Invoice.find(query)
      .populate('memberId', 'memberId')
      .populate('memberId.userId', 'firstName lastName email')
      .populate('planId', 'name price')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Invoice.countDocuments(query);

    sendSuccess(res, 'Invoices retrieved successfully', invoices, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get invoices', error.message);
  }
};

// @desc    Get single invoice
// @route   GET /api/v1/invoices/:id
// @access  Private
export const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('memberId', 'memberId userId')
      .populate('memberId.userId', 'firstName lastName email phone')
      .populate('planId', 'name price duration features');

    if (!invoice) {
      return sendError(res, 404, 'Invoice not found');
    }

    // Members can only view their own invoices
    if (req.user.role === 'member') {
      if (invoice.memberId.userId._id.toString() !== req.user._id.toString()) {
        return sendError(res, 403, 'Access denied: Cannot view other members\' invoices');
      }
    }

    // Staff cannot access invoices
    if (req.user.role === 'staff') {
      return sendError(res, 403, 'Access denied: Staff cannot access invoices');
    }

    // Owner/Super Admin can view invoices from their gym
    if (req.user.role !== 'super_admin' && req.user.role !== 'member') {
      if (invoice.gymId.toString() !== req.user.gymId.toString()) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
    }

    sendSuccess(res, 'Invoice retrieved successfully', invoice);
  } catch (error) {
    sendError(res, 500, 'Failed to get invoice', error.message);
  }
};

// @desc    Create invoice
// @route   POST /api/v1/invoices
// @access  Private (Owner or Super Admin only)
export const createInvoice = async (req, res) => {
  try {
    // Staff and members cannot create invoices
    if (req.user.role === 'staff' || req.user.role === 'member') {
      return sendError(res, 403, 'Access denied: Only owners can create invoices');
    }

    const { memberId, planId, items, taxRate = 0, discount = 0, dueDate } = req.body;
    const gymId = req.gymId || req.user.gymId;

    // Get member
    const member = await Member.findById(memberId);
    if (!member) {
      return sendError(res, 404, 'Member not found');
    }

    // Calculate totals
    const totals = calculateInvoiceTotal(items || [], taxRate, discount);

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(gymId, Invoice);

    // If planId provided, add plan to items
    let invoiceItems = items || [];
    if (planId) {
      const plan = await Plan.findById(planId);
      if (plan) {
        invoiceItems.push({
          description: `${plan.name} - ${plan.duration}`,
          quantity: 1,
          price: plan.price,
          total: plan.price
        });
      }
    }

    // Recalculate if plan was added
    if (planId) {
      const recalculated = calculateInvoiceTotal(invoiceItems, taxRate, discount);
      totals.subtotal = recalculated.subtotal;
      totals.tax = recalculated.tax;
      totals.total = recalculated.total;
    }

    const invoice = await Invoice.create({
      invoiceNumber,
      memberId,
      gymId,
      planId,
      items: invoiceItems,
      subtotal: totals.subtotal,
      tax: totals.tax,
      discount: totals.discount,
      total: totals.total,
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
    });

    const populated = await Invoice.findById(invoice._id)
      .populate('memberId', 'memberId')
      .populate('memberId.userId', 'firstName lastName email')
      .populate('planId', 'name price');

    sendCreated(res, 'Invoice created successfully', populated);
  } catch (error) {
    sendError(res, 500, 'Failed to create invoice', error.message);
  }
};

// @desc    Update invoice
// @route   PUT /api/v1/invoices/:id
// @access  Private (Owner or Super Admin only)
export const updateInvoice = async (req, res) => {
  try {
    // Staff and members cannot update invoices
    if (req.user.role === 'staff' || req.user.role === 'member') {
      return sendError(res, 403, 'Access denied: Only owners can update invoices');
    }

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return sendError(res, 404, 'Invoice not found');
    }

    // Verify gym scope for non-super-admin
    if (req.user.role !== 'super_admin') {
      if (invoice.gymId.toString() !== req.user.gymId.toString()) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
    }

    // Recalculate totals if items changed
    if (req.body.items) {
      const totals = calculateInvoiceTotal(
        req.body.items,
        req.body.taxRate || 0,
        req.body.discount || 0
      );
      req.body.subtotal = totals.subtotal;
      req.body.tax = totals.tax;
      req.body.total = totals.total;
    }

    const updated = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('memberId', 'memberId')
      .populate('memberId.userId', 'firstName lastName email')
      .populate('planId', 'name price');

    sendSuccess(res, 'Invoice updated successfully', updated);
  } catch (error) {
    sendError(res, 500, 'Failed to update invoice', error.message);
  }
};

// @desc    Mark invoice as paid
// @route   PUT /api/v1/invoices/:id/paid
// @access  Private (Owner or Super Admin only)
export const markAsPaid = async (req, res) => {
  try {
    // Staff and members cannot mark invoices as paid
    if (req.user.role === 'staff' || req.user.role === 'member') {
      return sendError(res, 403, 'Access denied: Only owners can mark invoices as paid');
    }

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return sendError(res, 404, 'Invoice not found');
    }

    // Verify gym scope for non-super-admin
    if (req.user.role !== 'super_admin') {
      if (invoice.gymId.toString() !== req.user.gymId.toString()) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
    }

    invoice.status = 'paid';
    invoice.paidAt = new Date();
    await invoice.save();

    const populated = await Invoice.findById(invoice._id)
      .populate('memberId', 'memberId')
      .populate('memberId.userId', 'firstName lastName email')
      .populate('planId', 'name price');

    sendSuccess(res, 'Invoice marked as paid', populated);
  } catch (error) {
    sendError(res, 500, 'Failed to mark invoice as paid', error.message);
  }
};

// @desc    Delete invoice
// @route   DELETE /api/v1/invoices/:id
// @access  Private (Owner or Super Admin)
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return sendError(res, 404, 'Invoice not found');
    }

    await invoice.deleteOne();

    sendSuccess(res, 'Invoice deleted successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to delete invoice', error.message);
  }
};

