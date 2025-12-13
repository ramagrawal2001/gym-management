import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { sendSuccess, sendError } from '../utils/responseFormatter.js';

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { email, password, role, gymId, firstName, lastName, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 400, 'User already exists');
    }

    // Validate role
    const validRoles = ['owner', 'staff', 'member'];
    if (role && !validRoles.includes(role)) {
      return sendError(res, 400, 'Invalid role');
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role: role || 'member',
      gymId: role === 'super_admin' ? undefined : gymId,
      firstName,
      lastName,
      phone
    });

    // Generate token
    const token = generateToken(user._id);

    sendCreated(res, 'User registered successfully', {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        gymId: user.gymId
      }
    });
  } catch (error) {
    sendError(res, 500, 'Registration failed', error.message);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return sendError(res, 400, 'Please provide email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      return sendError(res, 401, 'Account is inactive');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    sendSuccess(res, 'Login successful', {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        gymId: user.gymId,
        avatar: user.avatar
      }
    });
  } catch (error) {
    sendError(res, 500, 'Login failed', error.message);
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('gymId', 'name features branding');
    
    sendSuccess(res, 'User retrieved successfully', {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        gymId: user.gymId,
        isActive: user.isActive
      }
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get user', error.message);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;

    await user.save();

    sendSuccess(res, 'Profile updated successfully', {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    sendError(res, 500, 'Profile update failed', error.message);
  }
};

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, 'Please provide current and new password');
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    sendSuccess(res, 'Password changed successfully');
  } catch (error) {
    sendError(res, 500, 'Password change failed', error.message);
  }
};

