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
    
    // Handle gymId: super_admin can filter by gymId from query, others use their gymId
    let gymId;
    if (req.user.role === 'super_admin') {
      gymId = req.query.gymId || null; // null means all gyms for super admin
    } else {
      // For non-super-admin, use gymId from middleware or user
      gymId = req.gymId || (req.user.gymId ? (req.user.gymId._id || req.user.gymId) : null);
      
      if (!gymId) {
        return sendError(res, 403, 'Access denied: User does not have a gym association');
      }
    }

    const query = {};
    
    // Only add gymId to query if it's specified (for non-super-admin or super-admin filtering)
    if (gymId) {
      query.gymId = gymId;
    }
    
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

    // Get stats - use same query filter for stats
    const statsQuery = gymId ? { gymId } : {};
    const stats = {
      operational: await Equipment.countDocuments({ ...statsQuery, status: 'operational' }),
      maintenanceDue: await Equipment.countDocuments({ ...statsQuery, status: 'maintenance_due' }),
      outOfOrder: await Equipment.countDocuments({ ...statsQuery, status: 'out_of_order' })
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
    // Members cannot access equipment
    if (req.user.role === 'member') {
      return sendError(res, 403, 'Access denied: Members cannot access equipment');
    }

    const equipment = await Equipment.findById(req.params.id)
      .populate('gymId', 'name');

    if (!equipment) {
      return sendError(res, 404, 'Equipment not found');
    }

    // Verify gym scope for non-super-admin
    if (req.user.role !== 'super_admin') {
      // Get user's gymId - handle both object and string formats
      const userGymId = req.gymId || (req.user.gymId ? (req.user.gymId._id || req.user.gymId) : null);
      
      if (!userGymId) {
        return sendError(res, 403, 'Access denied: User does not have a gym association');
      }
      
      // Get equipment's gymId - handle both object and string formats
      const equipmentGymId = equipment.gymId ? (equipment.gymId._id || equipment.gymId) : null;
      
      if (!equipmentGymId) {
        return sendError(res, 500, 'Equipment has no gym association');
      }
      
      // Compare as strings to avoid ObjectId comparison issues
      if (equipmentGymId.toString() !== userGymId.toString()) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
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

    // Get gymId - handle both object and string formats
    const gymId = req.gymId || (req.user.gymId ? (req.user.gymId._id || req.user.gymId) : null);
    
    if (!gymId) {
      return sendError(res, 403, 'Access denied: User does not have a gym association');
    }
    
    // Validate serviceInterval if provided
    if (req.body.serviceInterval !== undefined) {
      if (req.body.serviceInterval < 1) {
        return sendError(res, 400, 'Service interval must be at least 1 day');
      }
    }

    // Auto-calculate nextService if lastService and serviceInterval are provided
    if (req.body.lastService && req.body.serviceInterval) {
      const nextService = new Date(req.body.lastService);
      nextService.setDate(nextService.getDate() + parseInt(req.body.serviceInterval));
      req.body.nextService = nextService;
    }

    // Auto-set status based on condition if not provided
    if (req.body.condition && !req.body.status) {
      if (req.body.condition === 'needs_repair') {
        req.body.status = 'out_of_order';
      } else if (req.body.condition === 'poor') {
        req.body.status = 'maintenance_due';
      } else {
        req.body.status = 'operational';
      }
    }

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
      const userGymId = req.gymId || (req.user.gymId ? (req.user.gymId._id || req.user.gymId) : null);
      
      if (!userGymId) {
        return sendError(res, 403, 'Access denied: User does not have a gym association');
      }
      
      const equipmentGymId = equipment.gymId ? (equipment.gymId._id || equipment.gymId) : null;
      
      if (!equipmentGymId || equipmentGymId.toString() !== userGymId.toString()) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
    }

    // Auto-update status based on condition
    if (req.body.condition) {
      if (req.body.condition === 'needs_repair') {
        req.body.status = 'out_of_order';
      } else if (req.body.condition === 'poor') {
        req.body.status = 'maintenance_due';
      } else if (!req.body.status) {
        // Only auto-set to operational if status wasn't explicitly provided
        req.body.status = 'operational';
      }
    }

    // Auto-calculate nextService when lastService or serviceInterval changes
    if (req.body.lastService && req.body.serviceInterval) {
      const nextService = new Date(req.body.lastService);
      nextService.setDate(nextService.getDate() + parseInt(req.body.serviceInterval));
      req.body.nextService = nextService;
    } else if (req.body.lastService && equipment.serviceInterval) {
      const nextService = new Date(req.body.lastService);
      nextService.setDate(nextService.getDate() + parseInt(equipment.serviceInterval));
      req.body.nextService = nextService;
    } else if (req.body.serviceInterval && equipment.lastService) {
      const nextService = new Date(equipment.lastService);
      nextService.setDate(nextService.getDate() + parseInt(req.body.serviceInterval));
      req.body.nextService = nextService;
    }

    // Validate serviceInterval if provided
    if (req.body.serviceInterval !== undefined) {
      if (req.body.serviceInterval < 1) {
        return sendError(res, 400, 'Service interval must be at least 1 day');
      }
    }

    const updated = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    sendSuccess(res, 'Equipment updated successfully', updated);
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
      const userGymId = req.gymId || (req.user.gymId ? (req.user.gymId._id || req.user.gymId) : null);
      
      if (!userGymId) {
        return sendError(res, 403, 'Access denied: User does not have a gym association');
      }
      
      const equipmentGymId = equipment.gymId ? (equipment.gymId._id || equipment.gymId) : null;
      
      if (!equipmentGymId || equipmentGymId.toString() !== userGymId.toString()) {
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
    // Staff and members cannot delete equipment
    if (req.user.role === 'staff' || req.user.role === 'member') {
      return sendError(res, 403, 'Access denied: Only owners can delete equipment');
    }

    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return sendError(res, 404, 'Equipment not found');
    }

    // Verify gym scope for non-super-admin
    if (req.user.role !== 'super_admin') {
      const userGymId = req.gymId || (req.user.gymId ? (req.user.gymId._id || req.user.gymId) : null);
      
      if (!userGymId) {
        return sendError(res, 403, 'Access denied: User does not have a gym association');
      }
      
      const equipmentGymId = equipment.gymId ? (equipment.gymId._id || equipment.gymId) : null;
      
      if (!equipmentGymId || equipmentGymId.toString() !== userGymId.toString()) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
    }

    await equipment.deleteOne();

    sendSuccess(res, 'Equipment deleted successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to delete equipment', error.message);
  }
};

