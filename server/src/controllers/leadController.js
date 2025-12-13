import Lead from '../models/Lead.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';

// @desc    Get all leads
// @route   GET /api/v1/leads
// @access  Private
export const getLeads = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;
    const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.user.gymId;

    const query = { gymId };
    
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const leads = await Lead.find(query)
      .populate('assignedTo', 'firstName lastName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Lead.countDocuments(query);

    sendSuccess(res, 'Leads retrieved successfully', leads, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get leads', error.message);
  }
};

// @desc    Get single lead
// @route   GET /api/v1/leads/:id
// @access  Private
export const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('convertedToMember', 'memberId');

    if (!lead) {
      return sendError(res, 404, 'Lead not found');
    }

    sendSuccess(res, 'Lead retrieved successfully', lead);
  } catch (error) {
    sendError(res, 500, 'Failed to get lead', error.message);
  }
};

// @desc    Create lead
// @route   POST /api/v1/leads
// @access  Private
export const createLead = async (req, res) => {
  try {
    const gymId = req.user.gymId;
    const lead = await Lead.create({ ...req.body, gymId });
    
    const populated = await Lead.findById(lead._id)
      .populate('assignedTo', 'firstName lastName email');

    sendCreated(res, 'Lead created successfully', populated);
  } catch (error) {
    sendError(res, 500, 'Failed to create lead', error.message);
  }
};

// @desc    Update lead
// @route   PUT /api/v1/leads/:id
// @access  Private
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('assignedTo', 'firstName lastName email');

    if (!lead) {
      return sendError(res, 404, 'Lead not found');
    }

    sendSuccess(res, 'Lead updated successfully', lead);
  } catch (error) {
    sendError(res, 500, 'Failed to update lead', error.message);
  }
};

// @desc    Update lead status
// @route   PUT /api/v1/leads/:id/status
// @access  Private
export const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return sendError(res, 404, 'Lead not found');
    }

    lead.status = status;
    
    if (status === 'converted' && req.body.memberId) {
      lead.convertedToMember = req.body.memberId;
      lead.convertedAt = new Date();
    }

    await lead.save();

    const populated = await Lead.findById(lead._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('convertedToMember', 'memberId');

    sendSuccess(res, 'Lead status updated successfully', populated);
  } catch (error) {
    sendError(res, 500, 'Failed to update lead status', error.message);
  }
};

// @desc    Delete lead
// @route   DELETE /api/v1/leads/:id
// @access  Private
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return sendError(res, 404, 'Lead not found');
    }

    await lead.deleteOne();

    sendSuccess(res, 'Lead deleted successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to delete lead', error.message);
  }
};

