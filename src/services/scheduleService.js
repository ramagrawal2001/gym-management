import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const getClasses = async (params) => {
  const response = await api.get(API_ENDPOINTS.CLASSES.BASE, { params });
  return response;
};

export const getClass = async (classId) => {
  const response = await api.get(`${API_ENDPOINTS.CLASSES.BASE}/${classId}`);
  return response;
};

export const createClass = async (classData) => {
  const response = await api.post(API_ENDPOINTS.CLASSES.BASE, classData);
  return response;
};

export const updateClass = async (classId, classData) => {
  const response = await api.put(`${API_ENDPOINTS.CLASSES.BASE}/${classId}`, classData);
  return response;
};

export const bookClass = async (classId, memberId) => {
  const response = await api.post(API_ENDPOINTS.CLASSES.BOOK(classId), { memberId });
  return response;
};

export const cancelBooking = async (classId, bookingId) => {
  const response = await api.delete(API_ENDPOINTS.CLASSES.CANCEL_BOOKING(classId, bookingId));
  return response;
};

export const deleteClass = async (classId) => {
  const response = await api.delete(`${API_ENDPOINTS.CLASSES.BASE}/${classId}`);
  return response;
};

