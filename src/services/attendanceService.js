import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const getAttendance = async (params) => {
  const response = await api.get(API_ENDPOINTS.ATTENDANCE.BASE, { params });
  return response;
};

export const getTodayAttendance = async () => {
  const response = await api.get(API_ENDPOINTS.ATTENDANCE.TODAY);
  return response;
};

export const checkIn = async (memberId) => {
  const response = await api.post(API_ENDPOINTS.ATTENDANCE.CHECKIN, { memberId });
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

