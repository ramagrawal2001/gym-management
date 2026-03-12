import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const getEquipment = async (params) => {
  try {
    const response = await api.get(API_ENDPOINTS.EQUIPMENT.BASE, { params });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getEquipmentItem = async (equipmentId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.EQUIPMENT.BASE}/${equipmentId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createEquipment = async (equipmentData) => {
  try {
    const response = await api.post(API_ENDPOINTS.EQUIPMENT.BASE, equipmentData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateEquipment = async (equipmentId, equipmentData) => {
  try {
    const response = await api.put(`${API_ENDPOINTS.EQUIPMENT.BASE}/${equipmentId}`, equipmentData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const recordService = async (equipmentId) => {
  try {
    const response = await api.put(API_ENDPOINTS.EQUIPMENT.SERVICE(equipmentId));
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteEquipment = async (equipmentId) => {
  try {
    const response = await api.delete(`${API_ENDPOINTS.EQUIPMENT.BASE}/${equipmentId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get equipment statistics (stats are included in getEquipment response)
export const getEquipmentStats = async (gymId = null) => {
  try {
    const params = gymId ? { gymId } : {};
    const response = await api.get(API_ENDPOINTS.EQUIPMENT.BASE, { params: { ...params, limit: 1 } });
    // Stats are included in the response metadata
    return {
      data: response.data?.meta?.stats || {
        operational: 0,
        maintenanceDue: 0,
        outOfOrder: 0
      }
    };
  } catch (error) {
    throw error;
  }
};

