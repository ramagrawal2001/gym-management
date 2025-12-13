import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const getInvoices = async (params) => {
  const response = await api.get(API_ENDPOINTS.INVOICES.BASE, { params });
  return response;
};

export const getInvoice = async (invoiceId) => {
  const response = await api.get(`${API_ENDPOINTS.INVOICES.BASE}/${invoiceId}`);
  return response;
};

export const createInvoice = async (invoiceData) => {
  const response = await api.post(API_ENDPOINTS.INVOICES.BASE, invoiceData);
  return response;
};

export const updateInvoice = async (invoiceId, invoiceData) => {
  const response = await api.put(`${API_ENDPOINTS.INVOICES.BASE}/${invoiceId}`, invoiceData);
  return response;
};

export const markInvoiceAsPaid = async (invoiceId) => {
  const response = await api.put(API_ENDPOINTS.INVOICES.PAID(invoiceId));
  return response;
};

export const deleteInvoice = async (invoiceId) => {
  const response = await api.delete(`${API_ENDPOINTS.INVOICES.BASE}/${invoiceId}`);
  return response;
};

