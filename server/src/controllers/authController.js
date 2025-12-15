import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { generateToken } from '../utils/generateToken.js';
import { sendSuccess, sendError, sendCreated } from '../utils/responseFormatter.js';
import { sendOtpEmail } from '../services/emailService.js';

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { email, role, gymId, firstName, lastName, phone } = req.body;

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

    // Generate a random password (required by schema, but won't be used for login)
    const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);

    // Create user (password is required by schema but OTP login is used)
    const user = await User.create({
      email,
      password: randomPassword, // Random password, not used for login
      role: role || 'member',
      gymId: role === 'super_admin' ? undefined : gymId,
      firstName,
      lastName,
      phone
    });

    // Generate token
    const token = generateToken(user._id);

    sendCreated(res, 'User registered successfully. Please use OTP login.', {
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

// @desc    Request OTP for login
// @route   POST /api/v1/auth/request-otp
// @access  Public
export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, 'Email is required');
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return sendError(res, 404, 'User not found with this email');
    }

    // Check if user is active
    if (!user.isActive) {
      return sendError(res, 401, 'Account is inactive');
    }

    // For owners, verify this email is associated with a gym as owner
    if (user.role === 'owner') {
      const Gym = (await import('../models/Gym.js')).default;
      const gym = await Gym.findOne({ ownerId: user._id });
      if (!gym) {
        return sendError(res, 403, 'Owner account not associated with any gym');
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing unused OTPs for this email
    await Otp.deleteMany({ email: email.toLowerCase().trim(), isUsed: false });

    // Create new OTP
    const otpRecord = await Otp.create({
      email: email.toLowerCase().trim(),
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // Send OTP email
    try {
      await sendOtpEmail(email, otp, user.role);
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      // In development, continue even if email fails
      if (process.env.NODE_ENV === 'production') {
        await Otp.findByIdAndDelete(otpRecord._id);
        return sendError(res, 500, 'Failed to send OTP email');
      }
    }

    sendSuccess(res, 'OTP sent to your email', {
      email: email.toLowerCase().trim(),
      expiresIn: 600 // 10 minutes in seconds
    });
  } catch (error) {
    sendError(res, 500, 'Failed to send OTP', error.message);
  }
};

// @desc    Verify OTP and login
// @route   POST /api/v1/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendError(res, 400, 'Email and OTP are required');
    }

    // Find valid OTP
    const otpRecord = await Otp.findOne({
      email: email.toLowerCase().trim(),
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      // Increment attempts if OTP exists but is invalid
      const existingOtp = await Otp.findOne({ email: email.toLowerCase().trim(), isUsed: false });
      if (existingOtp) {
        existingOtp.attempts += 1;
        if (existingOtp.attempts >= 5) {
          existingOtp.isUsed = true; // Mark as used after 5 failed attempts
        }
        await existingOtp.save();
      }
      return sendError(res, 401, 'Invalid or expired OTP');
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      otpRecord.isUsed = true;
      await otpRecord.save();
      return sendError(res, 401, 'Too many failed attempts. Please request a new OTP');
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Check if user is active
    if (!user.isActive) {
      return sendError(res, 401, 'Account is inactive');
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

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
    sendError(res, 500, 'OTP verification failed', error.message);
  }
};

// @desc    Login user - DEPRECATED: Use OTP login only
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res) => {
  // Password-based login has been removed. All users must use OTP login.
  return sendError(res, 400, 'Password login is no longer supported. Please use OTP login.');
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

// @desc    Change password - DEPRECATED: Password login removed
// @route   PUT /api/v1/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  // Password-based login has been removed. All users use OTP login.
  return sendError(res, 400, 'Password change is no longer supported. All users use OTP login.');
};

