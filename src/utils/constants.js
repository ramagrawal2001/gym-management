// User Roles
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  OWNER: 'owner',
  STAFF: 'staff',
  MEMBER: 'member'
};

// Lead Statuses
export const LEAD_STATUSES = {
  NEW: 'new',
  CONTACTED: 'contacted',
  TRIAL: 'trial',
  NEGOTIATION: 'negotiation',
  CONVERTED: 'converted',
  LOST: 'lost'
};

// Member Statuses
export const MEMBER_STATUSES = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled'
};

// Invoice Statuses
export const INVOICE_STATUSES = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  ONLINE: 'online',
  OTHER: 'other'
};

// Equipment Categories
export const EQUIPMENT_CATEGORIES = {
  CARDIO: 'cardio',
  STRENGTH: 'strength',
  FUNCTIONAL: 'functional',
  ACCESSORIES: 'accessories',
  OTHER: 'other'
};

// Equipment Conditions
export const EQUIPMENT_CONDITIONS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
  NEEDS_REPAIR: 'needs_repair'
};

// Equipment Statuses
export const EQUIPMENT_STATUSES = {
  OPERATIONAL: 'operational',
  MAINTENANCE_DUE: 'maintenance_due',
  OUT_OF_ORDER: 'out_of_order',
  RETIRED: 'retired'
};

// Lead Sources
export const LEAD_SOURCES = {
  WALK_IN: 'walk-in',
  WEBSITE: 'website',
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  REFERRAL: 'referral',
  OTHER: 'other'
};

// Plan Durations
export const PLAN_DURATIONS = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly'
};

// Days of Week
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

