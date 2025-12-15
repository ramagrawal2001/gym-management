import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const register = async (userData) => {
  const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  return response;
};

export const getCurrentUser = async () => {
  const response = await api.get(API_ENDPOINTS.AUTH.ME);
  return response;
};

export const updateProfile = async (profileData) => {
  const response = await api.put(API_ENDPOINTS.AUTH.PROFILE, profileData);
  return response;
};

// Password-based login has been removed. All users use OTP login.
// export const changePassword = async (passwordData) => {
//   const response = await api.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
//   return response;
// };

export const requestOtp = async (email) => {
  const response = await api.post(API_ENDPOINTS.AUTH.REQUEST_OTP, { email });
  return response;
};

export const verifyOtp = async (email, otp) => {
  const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp });
  return response;
};

