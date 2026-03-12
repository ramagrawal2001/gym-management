# Attendance System

Comprehensive attendance management system for gym members with multiple check-in methods, reporting, and administrative controls.

---

## Overview

The Attendance System enables gyms to track member visits using various check-in methods. Super admins assign available methods to gyms, and gym owners select which methods to enable. Members can then use the enabled methods to check in/out.

---

## Features

### ✅ Implemented Features (P1)

| Feature | Status | Description |
|---------|--------|-------------|
| Super admin attendance assignment | ✅ Done | Super admin can assign available methods to each gym |
| Gym owner attendance selection | ✅ Done | Gym owners select active methods from assigned ones |
| Attendance enable/disable toggle | ✅ Done | Toggle attendance tracking on/off per gym |
| Attendance import/export | ✅ Done | Export attendance data to CSV format |
| Attendance reports | ✅ Done | Daily, weekly, monthly attendance analytics |
| QR-based check-in | ✅ Done | Members can check in using QR codes |
| Staff override logs | ✅ Done | Full audit trail for staff-initiated changes |

### ✅ Implemented Features (P2)

| Feature | Status | Description |
|---------|--------|-------------|
| Multiple attendance systems | ✅ Done | Support for QR, Manual, NFC, Biometric |
| Multiple active methods | ✅ Done | Enable multiple methods simultaneously |

---

## Check-in Methods

### 1. Manual Entry
- **How it works**: Staff enters member ID or searches for member name
- **Authenticity**: 🟡 **Low** - Relies on staff verification
- **Pros**: Simple, no hardware needed, works for everyone
- **Cons**: Error-prone, requires staff presence, no identity verification

### 2. QR Code
- **How it works**: Each member gets a unique QR code (static or dynamic). Scan at entry.
- **Authenticity**: 🟠 **Medium** - QR codes can be shared or photographed
- **Pros**: Fast, self-service possible, works offline
- **Cons**: QR sharing risk, requires scanner, phone-dependent

### 3. NFC Card/Tag
- **How it works**: Member taps NFC-enabled card or wristband on reader
- **Authenticity**: 🟢 **Medium-High** - Physical card required
- **Pros**: Lightning fast, hard to duplicate, no phone needed
- **Cons**: Requires NFC hardware, card replacement costs, cards can be lost

### 4. Biometric
- **How it works**: Fingerprint or facial recognition scan
- **Authenticity**: 🟢 **High** - Cannot be shared or duplicated
- **Pros**: Maximum security, no cards to lose, no sharing possible
- **Cons**: Expensive hardware, privacy concerns, occasional technical failures

---

## Architecture

### Backend

#### Models
| File | Purpose |
|------|---------|
| `AttendanceConfig.js` | Gym-level configuration (methods, QR settings, auto-checkout) |
| `AttendanceOverrideLog.js` | Audit log for staff overrides |
| `Attendance.js` | Individual attendance records with method tracking |

#### Controllers
| File | Key Functions |
|------|---------------|
| `attendanceController.js` | Check-in, check-out, QR check-in, reports, export/import, override |
| `attendanceConfigController.js` | Config CRUD, method assignment, toggle settings |

#### API Endpoints

**Attendance Routes** (`/api/v1/attendance`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/checkin` | Staff+ | Manual check-in |
| PUT | `/checkout/:id` | Staff+ | Manual check-out |
| POST | `/qr-checkin` | Staff+ | QR-based check-in |
| GET | `/qr/:memberId` | Staff+ | Generate member QR code |
| PUT | `/override` | Staff+ | Staff override with logging |
| GET | `/reports` | Staff+ | Get attendance reports |
| GET | `/export` | Owner | Export attendance CSV |
| POST | `/import` | Owner | Import attendance CSV |
| GET | `/override-logs` | Owner | View override audit logs |

**Config Routes** (`/api/v1/attendance-config`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Staff+ | Get gym's config |
| PUT | `/` | Owner | Update config |
| PUT | `/toggle` | Owner | Enable/disable attendance |
| PUT | `/methods` | Super Admin | Assign available methods to gym |
| GET | `/:gymId` | Super Admin | Get config for any gym |

### Frontend

#### Pages
| Component | Location | Purpose |
|-----------|----------|---------|
| `Attendance.jsx` | `/attendance` | Main attendance dashboard with tabs |
| `GymDetails.jsx` | `/gyms/:id` | Super admin method assignment |

#### Attendance Page Tabs
1. **Today's Attendance** - Real-time check-ins, stats, quick actions
2. **Reports** - Daily/weekly/monthly analytics
3. **Settings** - Configure methods, QR settings, auto-checkout

---

## User Flows

### Super Admin Flow
1. Go to **Gyms** → Select a gym
2. Scroll to **Attendance Configuration**
3. Enable/disable available methods (checkboxes)
4. Click **Save Methods**

### Gym Owner Flow
1. Go to **Attendance** → **Settings** tab
2. View available methods (assigned by super admin)
3. Enable/disable methods as needed (multiple allowed)
4. Configure QR settings and auto-checkout

### Staff Flow
1. Go to **Attendance** → **Today's Attendance**
2. Use Quick Check-in card (shows all active methods)
3. Enter member ID or scan QR
4. View today's logs and stats

---

## Configuration Options

### Attendance Config Schema
```javascript
{
  gymId: ObjectId,
  availableMethods: ['manual', 'qr', 'nfc', 'biometric'],  // Set by super admin
  activeMethods: ['manual', 'qr'],                         // Selected by owner
  isEnabled: true,
  qrSettings: {
    type: 'static' | 'dynamic',
    expiryMinutes: 1440,
    allowMultipleCheckins: false
  },
  autoCheckout: {
    enabled: false,
    afterHours: 4,
    fixedTime: '22:00'
  },
  workingHours: {
    enabled: false,
    start: '06:00',
    end: '22:00'
  }
}
```

---

## Override System

Staff can modify attendance records with full audit logging:

### Override Actions
- **Force Checkout** - Check out a member who forgot
- **Modify Time** - Adjust check-in/out times
- **Invalidate** - Mark a record as invalid

### Logged Information
- Staff ID and details
- Original values
- New values
- Reason (required, min 10 chars)
- Timestamp
- Device info

---

## Reports

### Available Periods
- Daily (today)
- Weekly (last 7 days)
- Monthly (last 30 days)
- Custom date range

### Report Metrics
- Total check-ins
- Unique members
- Average duration
- Peak hour
- Daily breakdown
- Method breakdown

---

## Export Format

CSV export includes:
- Member ID
- Member Name
- Check-in Time
- Check-out Time
- Duration (minutes)
- Method
- Status

---

## Security

- All routes protected by authentication
- Role-based access control (RBAC)
- Gym scoping prevents cross-gym access
- Override actions require reason and are logged
- QR codes can be configured for expiry
