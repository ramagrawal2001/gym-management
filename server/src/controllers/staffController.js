import Staff from '../models/Staff.js';
import User from '../models/User.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';

// @desc    Get all staff
// @route   GET /api/v1/staff
// @access  Private (Staff can view, Owner/Super Admin can manage)
export const getStaff = async (req, res) => {
  try {
    // Members cannot access staff
    if (req.user.role === 'member') {
      return sendError(res, 403, 'Access denied: Members cannot access staff information');
    }

    const { page = 1, limit = 10, search, isActive } = req.query;
    const skip = (page - 1) * limit;
    const gymId = req.user.role === 'super_admin' ? req.query.gymId : req.gymId || req.user.gymId;

    const query = { gymId };
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const staff = await Staff.find(query)
      .populate('userId', 'email firstName lastName phone avatar')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Staff.countDocuments(query);

    // Filter by search if provided
    let filteredStaff = staff;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredStaff = staff.filter(s => {
        const user = s.userId;
        return (
          user?.email?.toLowerCase().includes(searchLower) ||
          user?.firstName?.toLowerCase().includes(searchLower) ||
          user?.lastName?.toLowerCase().includes(searchLower) ||
          s.specialty?.toLowerCase().includes(searchLower)
        );
      });
    }

    sendSuccess(res, 'Staff retrieved successfully', filteredStaff, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: search ? filteredStaff.length : total,
        pages: Math.ceil((search ? filteredStaff.length : total) / limit)
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get staff', error.message);
  }
};

// @desc    Get single staff
// @route   GET /api/v1/staff/:id
// @access  Private
export const getStaffMember = async (req, res) => {
  try {
    // Members cannot access staff
    if (req.user.role === 'member') {
      return sendError(res, 403, 'Access denied: Members cannot access staff information');
    }

    const staff = await Staff.findById(req.params.id)
      .populate('userId', 'email firstName lastName phone avatar')
      .populate('gymId', 'name');

    if (!staff) {
      return sendError(res, 404, 'Staff member not found');
    }

    // Verify gym scope for non-super-admin
    if (req.user.role !== 'super_admin') {
      if (staff.gymId.toString() !== req.user.gymId.toString()) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
    }

    sendSuccess(res, 'Staff member retrieved successfully', staff);
  } catch (error) {
    sendError(res, 500, 'Failed to get staff member', error.message);
  }
};

// @desc    Create staff
// @route   POST /api/v1/staff
// @access  Private (Owner or Super Admin only)
export const createStaff = async (req, res) => {
  try {
    // Staff and members cannot create staff
    if (req.user.role === 'staff' || req.user.role === 'member') {
      return sendError(res, 403, 'Access denied: Only owners can create staff');
    }

    // Handle photo upload if present
    let profileImage = null;
    if (req.file) {
      try {
        const { uploadFile } = await import('../services/uploadService.js');
        const uploadResult = await uploadFile(req.file.path, 'staff');
        profileImage = {
          url: uploadResult.url,
          publicId: uploadResult.publicId
        };
      } catch (uploadError) {
        return sendError(res, 500, 'Failed to upload profile image', uploadError.message);
      }
    }

    // Parse JSON body if it's a string (when using multipart/form-data)
    let bodyData = req.body;
    if (req.body.data && typeof req.body.data === 'string') {
      try {
        bodyData = JSON.parse(req.body.data);
      } catch (e) {
        // If parsing fails, use body as is (excluding the data field)
        const { data, ...rest } = req.body;
        bodyData = rest;
      }
    }

    const { 
      email, 
      firstName, 
      lastName, 
      phone, 
      userId, // This will be ignored for creation but good to destructure out
      specialty, 
      certifications, 
      schedule, 
      hourlyRate,
      ...otherData 
    } = bodyData;
    
    const gymId = req.gymId || req.user.gymId;

    // --- BACKEND VALIDATION ---
    if (!email || !firstName || !lastName) {
      return sendError(res, 400, 'Email, firstName, and lastName are required.');
    }
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Validate hourlyRate if provided
    if (hourlyRate !== undefined && hourlyRate !== null && hourlyRate !== '') {
      const rate = parseFloat(hourlyRate);
      if (isNaN(rate) || rate < 0) {
        return sendError(res, 400, 'Hourly rate must be a positive number.');
      }
    }
    // --- END VALIDATION ---

    // Check if user with this email already exists
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // If user exists, check if they are already a staff member of THIS gym
      const existingStaffInGym = await Staff.findOne({ userId: user._id, gymId });
      if (existingStaffInGym) {
        return sendError(res, 409, 'This user is already a staff member of your gym.');
      }
      
      // Prevent downgrading owners or super_admins to staff
      if (user.role === 'owner' || user.role === 'super_admin') {
        return sendError(res, 403, `Cannot create staff record for user with role: ${user.role}. Users with this role cannot be staff members.`);
      }
      
      // If user exists with different gymId, check if we should allow it
      if (user.gymId && user.gymId.toString() !== gymId.toString()) {
        // Allow if user is a member (they can be staff in a different gym)
        // But if they're already staff elsewhere, we might want to prevent it
        // For now, we'll allow it but keep their original gymId
      } else if (!user.gymId) {
        // If user doesn't have gymId, set it
        user.gymId = gymId;
      }
      
      // If user exists but doesn't have staff role, update their role
      if (user.role !== 'staff') {
        user.role = 'staff';
        await user.save();
      }
    } else {
      // If user doesn't exist, create a new user record for them
      const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
      user = await User.create({
        email: normalizedEmail,
        firstName,
        lastName,
        phone,
        password: randomPassword, // OTP login is used, so this is a placeholder
        role: 'staff',
        gymId, // Associate user with the gym
      });
    }

    // Now, create the staff record
    let staff;
    try {
      staff = await Staff.create({
        userId: user._id, // Use the definite user ID
        gymId,
        specialty,
        certifications: Array.isArray(certifications) ? certifications : [],
        schedule,
        hourlyRate: hourlyRate !== undefined && hourlyRate !== null && hourlyRate !== '' ? parseFloat(hourlyRate) : undefined,
        profileImage: profileImage || otherData.profileImage,
        ...otherData
      });
    } catch (createError) {
      // If staff creation fails but image was uploaded, clean it up
      if (profileImage?.publicId) {
        try {
          const { deleteFile } = await import('../services/uploadService.js');
          await deleteFile(profileImage.publicId);
        } catch (cleanupError) {
          console.error('Error cleaning up profile image after failed staff creation:', cleanupError);
        }
      }
      throw createError;
    }

    const populated = await Staff.findById(staff._id)
      .populate('userId', 'email firstName lastName phone avatar');

    sendCreated(res, 'Staff created successfully', populated);
  } catch (error) {
    // Catch duplicate email error from User model
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return sendError(res, 409, 'A user with this email already exists but could not be added.');
    }
    // Catch validation errors
    if (error.name === 'ValidationError') {
      return sendError(res, 400, 'Validation failed', Object.values(error.errors).map(e => e.message).join(', '));
    }
    sendError(res, 500, 'Failed to create staff', error.message);
  }
};

// @desc    Update staff
// @route   PUT /api/v1/staff/:id
// @access  Private (Owner or Super Admin only)
export const updateStaff = async (req, res) => {
  try {
    // Staff and members cannot update staff
    if (req.user.role === 'staff' || req.user.role === 'member') {
      return sendError(res, 403, 'Access denied: Only owners can update staff');
    }

    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return sendError(res, 404, 'Staff member not found');
    }

    // Verify gym scope for non-super-admin
    if (req.user.role !== 'super_admin') {
      if (staff.gymId.toString() !== req.user.gymId.toString()) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
    }

    // Handle photo upload if present
    if (req.file) {
      try {
        const { uploadFile, deleteFile } = await import('../services/uploadService.js');
        // Delete old image if exists
        if (staff.profileImage?.publicId) {
          await deleteFile(staff.profileImage.publicId);
        }
        
        const uploadResult = await uploadFile(req.file.path, 'staff');
        req.body.profileImage = {
          url: uploadResult.url,
          publicId: uploadResult.publicId
        };
      } catch (uploadError) {
        return sendError(res, 500, 'Failed to upload profile image', uploadError.message);
      }
    }

    // Parse JSON body if it's a string (when using multipart/form-data)
    let bodyData = req.body;
    if (req.body.data && typeof req.body.data === 'string') {
      try {
        bodyData = JSON.parse(req.body.data);
        // Merge profileImage from req.body if it was set by file upload
        if (req.body.profileImage) {
          bodyData.profileImage = req.body.profileImage;
        }
      } catch (e) {
        // If parsing fails, use body as is (excluding the data field)
        const { data, ...rest } = req.body;
        bodyData = rest;
      }
    }

    const { email, firstName, lastName, phone, hourlyRate, certifications, ...staffData } = bodyData;

    // Validate hourlyRate if provided
    if (hourlyRate !== undefined && hourlyRate !== null && hourlyRate !== '') {
      const rate = parseFloat(hourlyRate);
      if (isNaN(rate) || rate < 0) {
        return sendError(res, 400, 'Hourly rate must be a positive number.');
      }
      staffData.hourlyRate = rate;
    }

    // Validate certifications if provided
    if (certifications !== undefined) {
      staffData.certifications = Array.isArray(certifications) ? certifications : [];
    }

    // Update User model if necessary
    if (email || firstName || lastName || phone) {
      const user = await User.findById(staff.userId);
      if (user) {
        if (email && email !== user.email) {
          // Normalize email
          const normalizedEmail = email.toLowerCase().trim();
          // Check if new email already exists
          const existingUser = await User.findOne({ email: normalizedEmail });
          if (existingUser && existingUser._id.toString() !== user._id.toString()) {
            return sendError(res, 409, 'Email already in use by another user');
          }
          user.email = normalizedEmail;
        }
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        await user.save();
      }
    }

    const updated = await Staff.findByIdAndUpdate(req.params.id, staffData, {
      new: true,
      runValidators: true
    })
      .populate('userId', 'email firstName lastName phone avatar');

    sendSuccess(res, 'Staff updated successfully', updated);
  } catch (error) {
    // Catch validation errors
    if (error.name === 'ValidationError') {
      return sendError(res, 400, 'Validation failed', Object.values(error.errors).map(e => e.message).join(', '));
    }
    sendError(res, 500, 'Failed to update staff', error.message);
  }
};

// @desc    Delete staff
// @route   DELETE /api/v1/staff/:id
// @access  Private (Owner or Super Admin only)
export const deleteStaff = async (req, res) => {
  try {
    // Staff and members cannot delete staff
    if (req.user.role === 'staff' || req.user.role === 'member') {
      return sendError(res, 403, 'Access denied: Only owners can delete staff');
    }

    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return sendError(res, 404, 'Staff member not found');
    }

    // Verify gym scope for non-super-admin
    if (req.user.role !== 'super_admin') {
      if (staff.gymId.toString() !== req.user.gymId.toString()) {
        return sendError(res, 403, 'Access denied: Invalid gym scope');
      }
    }

    // Check if staff is assigned to any classes
    const Class = (await import('../models/Class.js')).default;
    const classesWithStaff = await Class.find({ trainerId: staff.userId, isActive: true });
    if (classesWithStaff.length > 0) {
      return sendError(res, 409, `Cannot delete staff member. They are assigned to ${classesWithStaff.length} active class(es). Please reassign or deactivate those classes first.`);
    }

    // Delete profile image if exists
    if (staff.profileImage?.publicId) {
      try {
        const { deleteFile } = await import('../services/uploadService.js');
        await deleteFile(staff.profileImage.publicId);
      } catch (deleteError) {
        console.error('Error deleting staff profile image:', deleteError);
        // Continue with staff deletion even if image deletion fails
      }
    }

    await staff.deleteOne();

    sendSuccess(res, 'Staff deleted successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to delete staff', error.message);
  }
};

