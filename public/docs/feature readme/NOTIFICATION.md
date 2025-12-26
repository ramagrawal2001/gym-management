# Notification System

Email-first notification system with in-app notifications, enabling automated communication with members through multiple channels.

---

## Overview

The Notification System allows gyms to communicate with members automatically or manually through email and in-app notifications. SMS and WhatsApp channels are architected but not yet enabled (can be added by simply configuring API credentials).

---

## Features

### ✅ Implemented Features (P1)

| Feature | Status | Description |
|---------|--------|-------------|
| Email notifications | ✅ Done | Send emails via Gmail SMTP (FREE) |
| In-app notifications | ✅ Done | Bell icon with dropdown, read/unread tracking |
| Notification manager | ✅ Done | Backend API for managing notifications |

### 🔜 Pending Features (P1)

| Feature | Status | Description |
|---------|--------|-------------|
| SMS notifications | 🔜 Ready | Architected for Fast2SMS (add API key to enable) |
| WhatsApp notifications | 🔜 Future | Planned for future implementation |

---

## Notification Channels

### 1. Email (Gmail SMTP) - ✅ Active
- **Provider**: Gmail SMTP
- **Cost**: FREE (500 emails/day)
- **Setup**: Requires Gmail App Password
- **Use Cases**: All notification types
- **Pros**: Free, reliable, professional, no registration needed
- **Cons**: Daily send limit (500)

### 2. In-App - ✅ Active
- **Provider**: Database-based
- **Cost**: FREE
- **Setup**: Already configured
- **Features**: Real-time bell icon, unread badges, read/unread tracking
- **Pros**: Instant, no external dependencies, unlimited
- **Cons**: Only works when user is logged in

### 3. SMS (Fast2SMS) - 🔜 Ready
- **Provider**: Fast2SMS
- **Cost**: ₹0.25/SMS (₹50 free credit on signup)
- **Setup**: Add API key to `.env`
- **Note**: Code is ready, just needs credentials
- **Alternatives**: MSG91, Twilio

### 4. WhatsApp - 🔜 Future
- **Provider**: TBD (Fast2SMS, Meta Cloud API, etc.)
- **Cost**: ₹0.40-1.50/message
- **Setup**: Requires business verification
- **Timeline**: To be implemented when needed

---

## Architecture

### Backend

#### Models
| File | Purpose |
|------|---------|
| `Notification.js` | Individual notification records with delivery status |
| `NotificationTemplate.js` | Reusable templates with variable substitution |
| `NotificationSettings.js` | Gym-level channel configuration and credentials |

#### Services
| File | Purpose |
|------|---------|
| `notificationService.js` | Central orchestrator for all channels |
| `emailService.js` | Gmail SMTP integration (existing, enhanced) |
| `inAppNotificationService.js` | Database CRUD for in-app notifications |
| `smsService.js` | Fast2SMS integration (ready, not active) |

#### Controllers & Routes
| File | Purpose |
|------|---------|
| `notificationController.js` | API endpoints for notifications |
| `notificationRoutes.js` | Route definitions |

#### API Endpoints

**User Routes** (`/api/v1/notifications`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Authenticated | Get user's notifications |
| GET | `/unread-count` | Authenticated | Get unread count |
| PATCH | `/:id/read` | Authenticated | Mark notification as read |
| PATCH | `/read-all` | Authenticated | Mark all as read |

**Admin Routes** (Gym Owner/Super Admin)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/settings` | Owner+ | Get notification settings |
| PUT | `/settings` | Owner+ | Update settings |
| GET | `/templates` | Owner+ | Get notification templates |
| POST | `/templates` | Owner+ | Create/update template |
| DELETE | `/templates/:id` | Owner+ | Delete template |
| POST | `/test` | Owner+ | Send test notification |
| GET | `/logs` | Owner+ | View notification logs |
| GET | `/sms-balance` | Owner+ | Check SMS balance |

### Frontend

#### Components
| Component | Location | Purpose |
|-----------|----------|---------|
| `NotificationCenter.jsx` | Header | Bell icon with dropdown |
| `notificationService.js` | Services | API client |

---

## Notification Types

| Type | Email | SMS | WhatsApp | In-App |
|------|-------|-----|----------|--------|
| Membership Expiry Warning | ✅ | 🔜 | 🔜 | ✅ |
| Membership Expired | ✅ | 🔜 | 🔜 | ✅ |
| Payment Reminder | ✅ | 🔜 | 🔜 | ✅ |
| Payment Received | ✅ | 🔜 | 🔜 | ✅ |
| Welcome Message | ✅ | 🔜 | 🔜 | ✅ |
| Birthday Wish | ✅ | 🔜 | 🔜 | ✅ |
| OTP | ✅ | 🔜 | ❌ | ❌ |
| General Announcement | ✅ | 🔜 | 🔜 | ✅ |

---

## Configuration

### Email Setup (Gmail)

1. **Enable 2-Step Verification** in Google Account
2. **Generate App Password**:
   - Google Account → Security → App Passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated password

3. **Add to `server/.env`**:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

### SMS Setup (When Ready)

1. **Register** at https://fast2sms.com (₹50 free credit)
2. **Get API Key** from Dev API section
3. **Add to `server/.env`**:
   ```env
   FAST2SMS_API_KEY=your-api-key
   FAST2SMS_SENDER_ID=TXTIND  # For testing
   FAST2SMS_ROUTE=quick_transactional  # or dlt_manual
   ```

### Notification Settings Schema
```javascript
{
  gymId: ObjectId,
  channels: {
    email: { enabled: true, useSystemDefault: true },
    sms: { enabled: false, provider: 'fast2sms', credentials: { apiKey, senderId } },
    inApp: { enabled: true }
  },
  notificationTypes: {
    membership_expiry_warning: { email: true, sms: true, inApp: true },
    payment_received: { email: true, sms: false, inApp: true }
    // ... more types
  }
}
```

---

## Usage Examples

### Backend - Send Notifications

```javascript
import notificationService from './services/notificationService.js';

// Automatic - Uses enabled channels from settings
await notificationService.sendMembershipExpiryWarning(gymId, member, 7);

// Manual - Specify channels
await notificationService.sendNotification({
  gymId,
  type: 'general',
  recipient: { userId, email, phone, name },
  data: { title: 'Title', message: 'Message' },
  channels: ['email', 'in_app'] // optional override
});
```

### Frontend - Display Notifications

Already integrated in `Header.jsx`:
```jsx
import { NotificationCenter } from '../components/notifications';

<NotificationCenter />
```

---

## Testing

### Method 1: Test Script
```bash
cd server
node src/utils/testNotifications.js
```

Creates 5 sample notifications for testing.

### Method 2: API Call
```bash
POST /api/v1/notifications/test
Headers: { Authorization: 'Bearer TOKEN' }
Body: { type: 'general', recipient: { email: 'test@example.com' } }
```

### What to Verify
1. **Bell Icon** appears in header
2. **Badge count** shows unread notifications
3. **Dropdown** displays notifications when clicked
4. **Email received** (if configured)
5. **Read/unread** status updates

---

## Features to Implement

### Phase 3: Email Templates (Optional)
- [ ] Create default email templates
- [ ] Template variable replacement
- [ ] HTML email design
- [ ] Template management UI

### Phase 4: SMS Integration (When Needed)
- [ ] Configure Fast2SMS API key
- [ ] Test SMS delivery
- [ ] Create DLT templates (for production)

### Phase 5: Notification Manager UI (Optional)
- [ ] Settings page for channel configuration
- [ ] Template CRUD interface
- [ ] Notification logs viewer
- [ ] Test notification sender UI
- [ ] Bulk notification sender

### Future Enhancements
- [ ] WhatsApp integration
- [ ] Push notifications (PWA)
- [ ] Notification scheduling
- [ ] Automated triggers (cron jobs)
- [ ] Notification preferences per member
- [ ] Quiet hours configuration
- [ ] Notification analytics

---

## Security

- All routes protected by authentication
- Role-based access control (RBAC)
- Gym scoping prevents cross-gym access
- Email rate limiting (500/day Gmail limit)
- SMS quota tracking in settings
- API credentials encrypted in database

---

## Cost Breakdown

| Channel | Provider | Initial Cost | Ongoing Cost |
|---------|----------|--------------|--------------|
| Email | Gmail SMTP | **FREE** | **FREE** (500/day limit) |
| In-App | Database | **FREE** | **FREE** |
| SMS | Fast2SMS | ₹50 free credit | ₹0.25/SMS |
| WhatsApp | TBD | To be decided | ₹0.40-1.50/message |

**Total Initial Investment: ₹0** (Email + In-App only)

---

## Troubleshooting

### Email Not Sending
- Check Gmail App Password is correct
-Verify `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- Check Gmail 2-Step Verification is enabled
- Look for errors in server console

### Notifications Not Appearing
- Check server is running
- Verify routes are registered in `app.js`
- Check browser console for errors
- Test with test script first

### Bell Icon Not Visible
- Verify `NotificationCenter` is imported in `Header.jsx`
- Check for build errors
- Clear browser cache and rebuild

---

## Related Documentation

- See [Walkthrough](/Users/ramargawal/.gemini/antigravity/brain/86a20332-77d6-4ad2-a874-17914f18c336/walkthrough.md) for setup instructions
- See [Implementation Plan](/Users/ramargawal/.gemini/antigravity/brain/86a20332-77d6-4ad2-a874-17914f18c336/implementation_plan.md) for technical details
