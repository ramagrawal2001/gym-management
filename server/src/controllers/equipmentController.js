import Equipment from '../models/Equipment.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';

// @desc    Get all equipment
// @route   GET /api/v1/equipment
// @access  Private (Staff can view, Owner can manage)
export const getEquipment = async (req, res) => {
  try {
    // Members cannot access equipment
    if (req.user.role === 'member') {
      return sendError(res, 403, 'Access denied: Members cannot access equipment');
    }

    const { page = 1, limit = 10, category, status, search } = req.query;
    const skip = (page - 1) * limit;
    const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.gymId || req.user.gymId;

    const query = { gymId };
    
    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }

    const equipment = await Equipment.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Equipment.countDocuments(query);

    // Get stats
    const stats = {
      operational: await Equipment.countDocuments({ gymId, status: 'operational' }),
      maintenanceDue: await Equipment.countDocuments({ gymId, status: 'maintenance_due' }),
      outOfOrder: await Equipment.countDocuments({ gymId, status: 'out_of_order' })
    };

    sendSuccess(res, 'Equipment retrieved successfully', equipment, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get equipment', error.message);
  }
};

// @desc    Get single equipment
// @route   GET /api/v1/equipment/:id
// @access  Private
export const getEquipmentItem = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('gymId', 'name');

    if (!equipment) {
      return sendError(res, 404, 'Equipment not found');
    }

    sendSuccess(res, 'Equipment retrieved successfully', equipment);
  } catch (error) {
    sendError(res, 500, 'Failed to get equipment', error.message);
  }
};

// @desc    Create equipment
// @route   POST /api/v1/equipment
// @access  Private (Owner or Super Admin only)
export const createEquipment = async (req, res) => {
  try {
    // Staff and members cannot create equipment
    if (req.user.role === 'staff' || req.user.role === 'member') {
      return sendError(res, 403, 'Access denied: Only owners can create equipment');
    }

    const gymId = req.gymId || req.user.gymId;
    const equipment = await Equipment.create({ ...req.body, gymId });
    
    sendCreated(res, 'Equipment created successfully', equipment);
  } catch (error) {
    sendError(res, 500, 'Failed to create equipment', error.message);
  }
};

// @desc    Update equipment
// @route   PUT /api/v1/equipment/:id
// @access  Private (Owner or Super Admin only)
export const updateEquipment = async (req, res) => {
  try {
    // Staff and members cannot update equipment
    if (req.user.role === 'staff' || req.user.role === 'member') {
      return sendError(res, 403, 'Access denied: Only owners can update equipment');
    }

    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return sendError(res, 404, 'Equipment not found');
    }

    // Verify gym scope for non-super-admin
    if (req.user.role !== 'super_admin') {
      if (equipment.gymId.toString() !== req.user.gymId.toString()) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
    }

    const updated = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Auto-update status based on condition
    if (req.body.condition) {
      if (req.body.condition === 'needs_repair') {
        equipment.status = 'out_of_order';
      } else if (req.body.condition === 'poor') {
        equipment.status = 'maintenance_due';
      } else {
        equipment.status = 'operational';
      }
      await equipment.save();
    }

    sendSuccess(res, 'Equipment updated successfully', equipment);
  } catch (error) {
    sendError(res, 500, 'Failed to update equipment', error.message);
  }
};

// @desc    Record service
// @route   PUT /api/v1/equipment/:id/service
// @access  Private (Owner or Super Admin only)
export const recordService = async (req, res) => {
  try {
    // Staff and members cannot record service
    if (req.user.role === 'staff' || req.user.role === 'member') {
      return sendError(res, 403, 'Access denied: Only owners can record equipment service');
    }

    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return sendError(res, 404, 'Equipment not found');
    }

    // Verify gym scope for non-super-admin
    if (req.user.role !== 'super_admin') {
      if (equipment.gymId.toString() !== req.user.gymId.toString()) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
    }

    equipment.lastService = new Date();
    if (equipment.serviceInterval) {
      const nextService = new Date();
      nextService.setDate(nextService.getDate() + equipment.serviceInterval);
      equipment.nextService = nextService;
    }
    equipment.status = 'operational';
    await equipment.save();

    sendSuccess(res, 'Service recorded successfully', equipment);
  } catch (error) {
    sendError(res, 500, 'Failed to record service', error.message);
  }
};

// @desc    Delete equipment
// @route   DELETE /api/v1/equipment/:id
// @access  Private (Owner or Super Admin)
export const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return sendError(res, 404, 'Equipment not found');
    }

    await equipment.deleteOne();

    sendSuccess(res, 'Equipment deleted successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to delete equipment', error.message);
  }
};

