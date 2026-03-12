import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

// Basic Attendance Operations
export const getAttendance = async (params) => {
  const response = await api.get(API_ENDPOINTS.ATTENDANCE.BASE, { params });
  return response;
};

export const getTodayAttendance = async () => {
  const response = await api.get(API_ENDPOINTS.ATTENDANCE.TODAY);
  return response;
};

export const checkIn = async (memberId, notes) => {
  const response = await api.post(API_ENDPOINTS.ATTENDANCE.CHECKIN, { memberId, notes });
  return response;
};

export const checkOut = async (attendanceId) => {
  const response = await api.put(API_ENDPOINTS.ATTENDANCE.CHECKOUT(attendanceId));
  return response;
};

export const getMemberAttendance = async (memberId, params) => {
  const response = await api.get(API_ENDPOINTS.ATTENDANCE.MEMBER(memberId), { params });
  return response;
};

export const getMyAttendance = async (params) => {
  const response = await api.get(`${API_ENDPOINTS.ATTENDANCE.BASE}/me`, { params });
  return response;
};

// QR-Based Check-in
export const qrCheckIn = async (qrCode) => {
  const response = await api.post(API_ENDPOINTS.ATTENDANCE.QR_CHECKIN, { qrCode });
  return response;
};

export const generateQRCode = async (memberId) => {
  const response = await api.get(API_ENDPOINTS.ATTENDANCE.QR(memberId));
  return response;
};

// Staff Override
export const staffOverride = async (data) => {
  const response = await api.post(API_ENDPOINTS.ATTENDANCE.OVERRIDE, data);
  return response;
};

export const getOverrideLogs = async (params) => {
  const response = await api.get(API_ENDPOINTS.ATTENDANCE.OVERRIDE_LOGS, { params });
  return response;
};

// Reports
export const getReports = async (params) => {
  const response = await api.get(API_ENDPOINTS.ATTENDANCE.REPORTS, { params });
  return response;
};

// Import/Export
export const exportAttendance = async (params) => {
  const response = await api.get(API_ENDPOINTS.ATTENDANCE.EXPORT, {
    params,
    responseType: 'blob'
  });
  return response;
};

export const importAttendance = async (data) => {
  const response = await api.post(API_ENDPOINTS.ATTENDANCE.IMPORT, { data });
  return response;
};

// Attendance Config
export const getAttendanceConfig = async () => {
  const response = await api.get(API_ENDPOINTS.ATTENDANCE_CONFIG.BASE);
  return response;
};

export const updateAttendanceConfig = async (data) => {
  const response = await api.put(API_ENDPOINTS.ATTENDANCE_CONFIG.BASE, data);
  return response;
};

export const toggleAttendance = async (isEnabled) => {
  const response = await api.put(API_ENDPOINTS.ATTENDANCE_CONFIG.TOGGLE, { isEnabled });
  return response;
};

export const assignAttendanceMethods = async (gymId, methods) => {
  const response = await api.put(API_ENDPOINTS.ATTENDANCE_CONFIG.METHODS, { gymId, methods });
  return response;
};

export const getAttendanceConfigByGym = async (gymId) => {
  const response = await api.get(API_ENDPOINTS.ATTENDANCE_CONFIG.BY_GYM(gymId));
  return response;
};
