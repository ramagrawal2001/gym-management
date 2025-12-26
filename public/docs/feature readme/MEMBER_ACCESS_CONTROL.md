# Member Access Control

Control member portal access, permissions, and feature availability with granular settings at both gym-wide and individual member levels.

---

## Overview

The Member Access Control feature allows gym owners to manage which members can log in and which features they can access in the member portal. This provides flexibility to offer different membership tiers (basic, premium, VIP) and customize access for individual members.

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Member login access control | ✅ Done | Enable/disable login for specific members |
| Feature-based member access | ✅ Done | Control which portal features members can access |
| Member role permissions | ✅ Done | Three permission levels with customizable access |

---

## Permission Levels

### Basic
- View profile only
- View attendance history
- View payments and invoices
- View workout and diet plans
- **Limited**: Cannot edit profile or book classes

### Premium (Default)
- All Basic features
- Edit own profile
- Book classes
- Full access to member portal

### VIP
- All Premium features
- Priority class booking (future enhancement)
- Exclusive content access (future enhancement)

---

## Architecture

### Backend

#### Models
| File | Purpose |
|------|---------|
| `MemberAccessConfig.js` | Gym-level default settings and permission level configurations |
| `User.js` | Extended with `canLogin`, `memberPermissionLevel`, and `accessRestrictions` fields |

#### Controllers
| File | Purpose |
|------|---------|
| `memberAccessController.js` | Manage gym settings and individual member access |

#### Middleware
| File | Purpose |
|------|---------|
| `memberAccessMiddleware.js` | Check login access and feature permissions |
| `auth.js` | Updated to check `canLogin` field during authentication |

#### API Endpoints

**Gym Settings**
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/member-access/gym-settings` | Owner+ | Get gym's default member access settings |
| PUT | `/api/v1/member-access/gym-settings` | Owner+ | Update gym defaults |

**Member Access**
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/member-access/member/:memberId` | Owner/Staff | Get member's access settings |
| PUT | `/api/v1/member-access/member/:memberId` | Owner+ | Update member access |
| POST | `/api/v1/member-access/bulk` | Owner+ | Bulk update member access |

### Frontend

#### Pages
| Page | Route | Access | Purpose |
|------|-------|--------|---------|
| `MemberAccessSettings.jsx` | `/member-access` | Owner+ | Manage gym defaults and individual member access |

#### Services
| File | Purpose |
|------|---------|
| `memberAccessService.js` | API client for member access endpoints |

---

## Feature Access Controls

Member portal features that can be toggled:
- **View Profile** - See own profile information
- **Edit Profile** - Update profile details
- **View Attendance** - See attendance history
- **View Classes** - Browse available classes
- **Book Classes** - Reserve spots in classes
- **View Payments** - See payment history
- **View Invoices** - Access invoice records
- **View Workout Plan** - See assigned workout plans
- **View Diet Plan** - See assigned diet plans

---

## Usage

### Configure Gym Defaults

1. Login as gym owner
2. Navigate to **Member Access** from Settings menu
3. Go to **Default Settings** tab
4. Toggle features on/off for default member access
5. Save settings

All new members will inherit these default settings.

### Configure Permission Levels

1. In **Member Access Settings**, navigate to Permission Levels section
2. Configure access for each level (Basic, Premium, VIP)
3. Save settings

Permission levels apply hierarchically: Individual overrides → Permission level → Gym defaults

### Manage Individual Member Access

1. Navigate to **Member Access** → **Member List** tab
2. Click **Manage** on any member
3. Toggle **Allow Login** to enable/disable member login
4. Select **Permission Level** (basic/premium/VIP)
5. Set custom feature access overrides
6. Save changes

### Disable Member Login

Quick method:
1. Go to **Members** page
2. Select member
3. Edit member and set "Can Login" to false

Or use Member Access Settings for more granular control.

---

## Access Hierarchy

Member effective permissions are calculated in this order (highest priority first):

1. **Individual Overrides** - Custom settings for specific member
2. **Permission Level** - Settings for member's permission level
3. **Gym Defaults** - Gym-wide default settings

Example:
- Gym default: Book Classes = ON
- Basic permission level: Book Classes = OFF
- Member (basic): Custom override = ON
- **Result**: Member CAN book classes (override wins)

---

## Security

- All routes protected by authentication middleware
- RBAC enforces owner-only access to management endpoints
- Gym scoping prevents cross-gym access
- `canLogin` check happens during authentication (middleware level)
- Feature access checked at API endpoint level

---

## Database Schema

### MemberAccessConfig
```javascript
{
  gymId: ObjectId,
  defaultFeatureAccess: {
    viewProfile: Boolean,
    editProfile: Boolean,
    viewAttendance: Boolean,
    // ... more features
  },
  permissionLevels: {
    basic: { /* features */ },
    premium: { /* features */ },
    vip: { /* features */ }
  }
}
```

### User (Extended)
```javascript
{
  // ... existing fields
  canLogin: Boolean (default: true),
  memberPermissionLevel: String (basic|premium|vip, default: premium),
  accessRestrictions: {
    viewProfile: Boolean|null,
    editProfile: Boolean|null,
    // ... more features (null = use defaults)
  }
}
```

---

## Future Enhancements

- [ ] Time-based access controls (temporary suspensions)
- [ ] Automated permission upgrades based on subscription  
- [ ] Access logging and audit trail
- [ ] Member self-service permission requests
- [ ] IP-based access restrictions
- [ ] Device limit per member
- [ ] Session management (kick user from other devices)

---

##Troubleshooting

### Member Can't Login
- Check `canLogin` field is `true`
- Verify account is active (`isActive: true`)
- Check for any error messages in browser console

### Feature Not Accessible
- Verify feature is enabled in gym defaults
- Check member's permission level settings
- Review individual access overrides
- Ensure feature is not disabled at app level (FeatureGuard)

### Changes Not Reflecting
- Clear browser cache
- Have member logout and login again
- Verify changes were saved successfully

---

## Related Documentation

- See [Implementation Plan](file://
/Users/ramargawal/.gemini/antigravity/brain/f344603a-3044-42ff-aba5-77833c2b6dd7/implementation_plan.md) for technical details
