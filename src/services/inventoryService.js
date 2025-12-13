import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const getEquipment = async (params) => {
  const response = await api.get(API_ENDPOINTS.EQUIPMENT.BASE, { params });
  return response;
};

export const getEquipmentItem = async (equipmentId) => {
  const response = await api.get(`${API_ENDPOINTS.EQUIPMENT.BASE}/${equipmentId}`);
  return response;
};

export const createEquipment = async (equipmentData) => {
  const response = await api.post(API_ENDPOINTS.EQUIPMENT.BASE, equipmentData);
  return response;
};

export const updateEquipment = async (equipmentId, equipmentData) => {
  const response = await api.put(`${API_ENDPOINTS.EQUIPMENT.BASE}/${equipmentId}`, equipmentData);
  return response;
};

export const recordService = async (equipmentId) => {
  const response = await api.put(API_ENDPOINTS.EQUIPMENT.SERVICE(equipmentId));
  return response;
};

export const deleteEquipment = async (equipmentId) => {
  const response = await api.delete(`${API_ENDPOINTS.EQUIPMENT.BASE}/${equipmentId}`);
  return response;
};

