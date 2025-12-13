import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const getPayments = async (params) => {
  const response = await api.get(API_ENDPOINTS.PAYMENTS.BASE, { params });
  return response;
};

export const getPayment = async (paymentId) => {
  const response = await api.get(`${API_ENDPOINTS.PAYMENTS.BASE}/${paymentId}`);
  return response;
};

export const createPayment = async (paymentData) => {
  const response = await api.post(API_ENDPOINTS.PAYMENTS.BASE, paymentData);
  return response;
};

export const updatePayment = async (paymentId, paymentData) => {
  const response = await api.put(`${API_ENDPOINTS.PAYMENTS.BASE}/${paymentId}`, paymentData);
  return response;
};

export const deletePayment = async (paymentId) => {
  const response = await api.delete(`${API_ENDPOINTS.PAYMENTS.BASE}/${paymentId}`);
  return response;
};

