# Help & Support System

Comprehensive support ticket system and FAQ knowledge base for member support and self-service help.

---

## Overview

The Help & Support System provides a complete customer support solution with a ticket tracking system for member inquiries and a knowledge base (FAQ) for self-service support. Members can create tickets, track their status, and find answers to common questions, while staff can manage tickets, assign them, and maintain the FAQ.

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Help desk module | ✅ Done | Full ticket system with replies and status tracking |
| FAQ & documentation | ✅ Done | Knowledge base with categories and ratings |
| Admin support access | ✅ Done | Staff ticket management and assignment |

---

## Architecture

### Backend

#### Models
| File | Purpose |
|------|---------|
| `SupportTicket.js` | Ticket tracking with replies, attachments, and status |
| `FAQ.js` | Knowledge base articles with categories and helpfulness ratings |

#### Controllers
| File | Purpose |
|------|---------|
| `supportController.js` | Ticket CRUD, replies, assignments, and statistics |
| `faqController.js` | FAQ management, search, and ratings |

#### API Endpoints

**Support Tickets**
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/support/tickets` | Authenticated | Create support ticket |
| GET | `/api/v1/support/tickets` | Authenticated | List tickets (filtered by user role) |
| GET | `/api/v1/support/tickets/:id` | Ticket owner/Staff | Get ticket details |
| PUT | `/api/v1/support/tickets/:id` | Staff+ | Update ticket (status, priority) |
| POST | `/api/v1/support/tickets/:id/reply` | Ticket owner/Staff | Add reply to ticket |
| PUT | `/api/v1/support/tickets/:id/assign` | Owner+ | Assign ticket to staff |
| GET | `/api/v1/support/tickets/stats` | Staff+ | Get ticket statistics |

**FAQ**
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/faqs` | Public (optionalAuth) | List FAQs with search/filter |
| GET | `/api/v1/faqs/:id` | Public | Get single FAQ (increments views) |
| POST | `/api/v1/faqs` | Owner+ | Create FAQ |
| PUT | `/api/v1/faqs/:id` | Owner+ | Update FAQ |
| DELETE | `/api/v1/faqs/:id` | Owner+ | Delete FAQ |
| POST | `/api/v1/faqs/:id/rate` | Authenticated | Rate FAQ as helpful/not helpful |
| GET | `/api/v1/faqs/categories` | Public | Get FAQ categories |

### Frontend

#### Pages
| Page | Route | Access | Purpose |
|------|-------|--------|---------|
| `Support.jsx` | `/support` | All authenticated | User-facing support (create tickets, view FAQs) |
| `SupportTickets.jsx` | `/support-tickets` | Staff/Owner | Admin ticket management |
| `FAQManagement.jsx` | `/faq-management` | Owner+ | Manage FAQ knowledge base |

#### Services
| File | Purpose |
|------|---------|
| `supportService.js` | API client for support ticket endpoints |
| `faqService.js` | API client for FAQ endpoints |

---

## Support Ticket System

### Ticket Lifecycle

```
[Open] → [In Progress] → [Resolved] → [Closed]
   ↑           |
   └───────────┘ (member reply reopens resolved/closed tickets)
```

### Ticket Fields

- **Ticket Number**: Auto-generated unique identifier (e.g., `TICKET-ABC123-0001`)
- **Subject**: Brief description of the issue
- **Description**: Detailed explanation
- **Category**: membership, payments, classes, technical, complaint, other
- **Priority**: low, medium, high, urgent
- **Status**: open, in_progress, resolved, closed
- **Assigned To**: Staff member handling the ticket
- **Replies**: Thread of messages between member and staff
- **Attachments**: File uploads (architected, URLs stored)

### Ticket Workflow

1. **Member creates ticket** → Status: Open
2. **Owner assigns to staff** → Status: In Progress
3. **Staff and member exchange replies** → Conversation thread
4. **Staff marks as resolved** → Status: Resolved
5. **If member replies** → Status: Open (auto-reopened)
6. **After confirmation** → Status: Closed

---

## FAQ Knowledge Base

### FAQ Structure

- **Question**: The question being answered
- **Answer**: Detailed response
- **Category**: membership, payments, classes, technical, general
- **Order**: Display order within category
- **Global vs Gym-Specific**: FAQs can be global (all gyms) or gym-specific
- **Metrics**: Views, helpful count, not helpful count

### FAQ Features

- **Search**: Full-text search across questions and answers
- **Category Filter**: Browse by category
- **Ratings**: Members rate FAQs as helpful/not helpful
- **View Tracking**: Auto-increment view count
- **Priority Ordering**: Control display order

---

## Usage

### For Members

**Create a Support Ticket:**
1. Navigate to **Support** from menu
2. Click **New Ticket**
3. Fill in subject, description, category, and priority
4. Submit ticket
5. Track ticket status in **My Tickets** tab

**Reply to Ticket:**
1. Open ticket from **My Tickets**
2. View conversation thread
3. Type reply at bottom
4. Send reply

**Browse FAQs:**
1. Navigate to **Support**
2. Click **FAQ** tab
3. Search or filter by category
4. Rate FAQs as helpful/not helpful

### For Staff/Owners

**Manage Tickets:**
1. Navigate to **Support Tickets** (admin menu)
2. View all open tickets with stats dashboard
3. Filter by status or priority
4. Click ticket to view details
5. Update status via dropdown
6. Assign to staff member

**Reply to Tickets:**
1. Open ticket details
2. Read member's messages
3. Add staff reply (marked with "Staff" badge)
4. Update status as needed

**Manage FAQs:**
1. Navigate to **FAQ Management**  
2. Click **Add FAQ** to create new
3. Enter question, answer, category
4. Set order number (lower = higher priority)
5. Check "Global FAQ" for system-wide (super_admin only)
6. Edit or delete existing FAQs
7. View engagement metrics (views, ratings)

---

## Permission Matrix

| Action | Member | Staff | Owner | Super Admin |
|--------|--------|-------|-------|-------------|
| Create Ticket | ✅ | ✅ | ✅ | ✅ |
| View Own Tickets | ✅ | ✅ | ✅ | ✅ |
| View All Tickets | ❌ | ✅ | ✅ | ✅ |
| Reply to Own Ticket | ✅ | ✅ | ✅ | ✅ |
| Reply to Any Ticket | ❌ | ✅ | ✅ | ✅ |
| Update Ticket Status | ❌ | ✅ | ✅ | ✅ |
| Assign Tickets | ❌ | ❌ | ✅ | ✅ |
| View FAQs | ✅ | ✅ | ✅ | ✅ |
| Rate FAQs | ✅ | ✅ | ✅ | ✅ |
| Create/Edit FAQs | ❌ | ❌ | ✅ | ✅ |
| Create Global FAQs | ❌ | ❌ | ❌ | ✅ |

---

## Database Schema

### SupportTicket
```javascript
{
  gymId: ObjectId,
  userId: ObjectId (ticket creator),
  ticketNumber: String (unique),
  subject: String,
  description: String,
  category: String (enum),
  priority: String (enum),
  status: String (enum),
  assignedTo: ObjectId (staff),
  replies: [{
    userId: ObjectId,
    message: String,
    isStaff: Boolean,
    createdAt: Date
  }],
  attachments: [{
    fileName: String,
    fileUrl: String
  }],
  resolvedAt: Date,
  closedAt: Date,
  timestamps: true
}
```

### FAQ
```javascript
{
  gymId: ObjectId (null for global),
  question: String,
  answer: String,
  category: String (enum),
  isGlobal: Boolean,
  order: Number,
  isActive: Boolean,
  views: Number,
  helpful: Number,
  notHelpful: Number,
  timestamps: true
}
```

---

## Statistics & Analytics

### Ticket Stats
- Total tickets
- Open tickets
- In progress tickets
- Resolved tickets
- Closed tickets
- Average resolution time (future)
- Tickets per category (future)

### FAQ Analytics
- View count per FAQ
- Helpful vs not helpful ratio
- Most viewed FAQs
- Least helpful FAQs (candidates for improvement)

---

## Future Enhancements

### Support Tickets
- [ ] Email notifications for ticket updates
- [ ] File attachment support (currently URLs only)
- [ ] Ticket templates for common issues
- [ ] SLA tracking and alerts
- [ ] Internal staff notes (hidden from members)
- [ ] Ticket merging and linking
- [ ] Auto-assignment based on category
- [ ] Canned responses for staff
- [ ] Ticket escalation workflow

### FAQ
- [ ] Rich text editor for answers
- [ ] FAQ search analytics (popular searches)
- [ ] Video/image embeds in FAQ answers
- [ ] FAQ versioning and changelog
- [ ] Community Q&A (members can submit questions)
- [ ] AI-powered FAQ suggestions
- [ ] Multi-language support

---

## Security

- All routes protected by appropriate authentication
- RBAC enforces role-based access
- Gym scoping prevents cross-gym ticket access
- Members can only view/reply to their own tickets
- Staff can access all gym tickets
- Global FAQs managed by super_admin only

---

## Troubleshooting

### Tickets Not Appearing
- Verify user is authenticated
- Check ticket filters (status, priority)
- Ensure gym scoping is correct

### Cannot Reply to Ticket
- Check if user has permission (ticket owner or staff)
- Verify ticket is not closed
- Check for authentication issues

### FAQs Not Showing
- Verify `isActive: true`
- Check category filter
- Ensure search query is correct
- For gym-specific FAQs, verify correct gym context

---

## Related Documentation

- See [Implementation Plan](file:///Users/ramargawal/.gemini/antigravity/brain/f344603a-3044-42ff-aba5-77833c2b6dd7/implementation_plan.md) for technical details
