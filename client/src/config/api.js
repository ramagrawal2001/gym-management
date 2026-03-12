// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REQUEST_OTP: '/auth/request-otp',
    VERIFY_OTP: '/auth/verify-otp',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  // Gym
  GYMS: {
    BASE: '/gyms',
    FEATURES: (id) => `/gyms/${id}/features`,
    BRANDING: (id) => `/gyms/${id}/branding`
  },
  // Plans
  PLANS: {
    BASE: '/plans'
  },
  // Members
  MEMBERS: {
    BASE: '/members',
    RENEW: (id) => `/members/${id}/renew`
  },
  // Leads
  LEADS: {
    BASE: '/leads',
    STATUS: (id) => `/leads/${id}/status`
  },
  // Classes
  CLASSES: {
    BASE: '/classes',
    BOOK: (id) => `/classes/${id}/book`,
    CANCEL_BOOKING: (id, bookingId) => `/classes/${id}/book/${bookingId}`
  },
  // Attendance
  ATTENDANCE: {
    BASE: '/attendance',
    TODAY: '/attendance/today',
    CHECKIN: '/attendance/checkin',
    CHECKOUT: (id) => `/attendance/checkout/${id}`,
    MEMBER: (memberId) => `/attendance/member/${memberId}`,
    QR_CHECKIN: '/attendance/qr-checkin',
    QR: (memberId) => `/attendance/qr/${memberId}`,
    OVERRIDE: '/attendance/override',
    OVERRIDE_LOGS: '/attendance/override-logs',
    REPORTS: '/attendance/reports',
    EXPORT: '/attendance/export',
    IMPORT: '/attendance/import'
  },
  // Attendance Config
  ATTENDANCE_CONFIG: {
    BASE: '/attendance-config',
    TOGGLE: '/attendance-config/toggle',
    METHODS: '/attendance-config/methods',
    BY_GYM: (gymId) => `/attendance-config/${gymId}`
  },
  // Invoices
  INVOICES: {
    BASE: '/invoices',
    PAID: (id) => `/invoices/${id}/paid`
  },
  // Payments
  PAYMENTS: {
    BASE: '/payments'
  },
  // Staff
  STAFF: {
    BASE: '/staff'
  },
  // Equipment
  EQUIPMENT: {
    BASE: '/equipment',
    SERVICE: (id) => `/equipment/${id}/service`
  }
};

