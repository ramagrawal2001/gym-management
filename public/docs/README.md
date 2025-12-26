# GymOS - Complete Gym Management System

A comprehensive full-stack SaaS application for managing gym operations, built with modern web technologies. This system provides multi-tenant support, role-based access control, feature toggles, and a complete suite of gym management tools.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [Database Models](#database-models)
- [Development Guidelines](#development-guidelines)
- [Deployment](#deployment)

---

## 🎯 Overview

GymOS is a multi-tenant gym management system that allows:
- **Super Admins** to manage multiple gyms/branches
- **Gym Owners** to manage their gym operations
- **Staff Members** to handle daily operations
- **Members** to access their personal information

The system supports feature toggles, white-label branding, and comprehensive management of members, classes, attendance, payments, inventory, and more.

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Redux      │  │  React Router│  │   Components │       │
│  │   Store      │  │   (v7)       │  │   & Pages    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  API Service   │                        │
│                    │    (Axios)     │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │ HTTP/REST
┌────────────────────────────▼─────────────────────────────────┐
│              Backend (Node.js + Express)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Middleware  │  │  Controllers │  │   Services   │       │
│  │  - Auth      │  │  - CRUD      │  │  - Business  │       │
│  │  - RBAC      │  │  - Logic     │  │  - Logic     │       │
│  │  - Validation│  │              │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │   Mongoose     │                        │
│                    │     ODM        │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                    MongoDB Database                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Users      │  │     Gyms     │  │   Members    │       │
│  │   Plans      │  │   Classes    │  │  Attendance  │       │
│  │   Leads      │  │  Invoices   │  │   Payments   │       │
│  │   Staff      │  │  Equipment  │  │     OTP      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

### Multi-Tenant Architecture

The system implements **gym-scoped data isolation**:
- Each user (except super_admin) is associated with a `gymId`
- All data operations are automatically scoped to the user's gym
- Super admins can access all gyms or filter by `gymId` query parameter
- Middleware (`gymScope.js`) enforces data isolation at the API level

### Authentication Flow

```
1. User enters email
   ↓
2. System sends OTP via email
   ↓
3. User enters OTP
   ↓
4. System verifies OTP (max 5 attempts, 10 min expiry)
   ↓
5. JWT token generated and stored
   ↓
6. User data persisted in Redux (with redux-persist)
   ↓
7. Gym features loaded and persisted
```

### State Management

- **Redux Toolkit** for global state
- **Redux Persist** for auth and gym features persistence
- **Slices**: auth, gym, members, leads, notifications, ui

---

## ✨ Features

### Core Features

#### 1. **Multi-Gym Management** (Super Admin)
- Create and manage multiple gyms/branches
- Gym activation/deactivation
- Feature toggles per gym
- White-label branding (logo, colors)
- Gym settings (currency, timezone, contact info)

#### 2. **User Management & Authentication**
- OTP-based authentication (email)
- Role-based access control (Super Admin, Owner, Staff, Member)
- User profile management
- Last login tracking
- Account activation/deactivation

#### 3. **Member Management**
- Complete CRUD operations
- Membership lifecycle (active, expired, suspended, cancelled)
- Subscription management (start/end dates)
- Member renewal functionality
- Auto-generated member IDs
- Emergency contact information
- Medical information tracking
- Workout & diet plan notes

#### 4. **CRM & Lead Management**
- Lead capture and tracking
- Kanban board interface
- Lead status workflow (new → contacted → trial → negotiation → converted/lost)
- Lead source tracking (walk-in, website, social media, referral)
- Lead assignment to staff
- Conversion tracking

#### 5. **Class Scheduling**
- Weekly calendar view
- Class creation and management
- Trainer assignment
- Class booking system
- Capacity management
- Recurring class support
- Booking cancellation

#### 6. **Attendance System**
- Check-in/check-out functionality
- Duration tracking
- Today's attendance view
- Member attendance history
- Attendance status (active, completed)

#### 7. **Notification System** ✨ NEW
- Email notifications (Gmail SMTP - FREE)
- In-app notifications with bell icon
- Real-time unread badges
- Read/unread tracking
- SMS support (architected for Fast2SMS)
- WhatsApp support (planned for future)
- Notification templates with variable substitution
- Notification manager for admin control

#### 8. **Financial Management** ✨ ENHANCED
- **Expense Tracking**:
  - Create, edit, and delete expenses with categories
  - Custom expense categories with icons and colors
  - Expense approval workflow (pending → approved/rejected)
  - Filter by date, category, status, vendor
  - Receipt URL attachment support
  - Export expenses to CSV
  - Import expenses from JSON
  - Soft delete for audit trail
- **Revenue Management**:
  - Track revenue from multiple sources (POS, personal training, merchandise, classes)
  - Automatic membership payment tracking
  - Link revenue to payments and members
  - Revenue statistics by source
  - Date range filtering
- **Profit & Loss Reports**:
  - Comprehensive P&L calculations (income - expenses = profit)
  - Visual trend charts (Revenue vs Expenses)
  - Category breakdown with pie charts
  - Daily/weekly/monthly period grouping
  - Profit margin percentage
  - Dashboard financial summary widget
- **Legacy Features**:
  - Membership plan creation (monthly, quarterly, yearly)
  - Invoice generation with items
  - Tax and discount support
  - Payment tracking (cash, card, bank transfer, online)
  - Payment status management
  - Invoice status tracking (draft, pending, paid, overdue, cancelled)
  - Transaction ID tracking

#### 8. **Staff Management**
- Staff CRUD operations
- Specialty and certifications tracking
- Staff assignment to classes
- Role-based staff access

#### 9. **Inventory Management**
- Equipment tracking
- Equipment service/maintenance records
- Equipment CRUD operations
- Category management (cardio, strength, functional, accessories)
- Condition tracking (excellent, good, fair, poor, needs_repair)
- Status management (operational, maintenance_due, out_of_order, retired)

#### 10. **Dashboard & Analytics**
- Super admin dashboard (total gyms, active gyms, total members, monthly revenue)
- Gym-level dashboard (members, revenue, attendance)
- Revenue charts
- Membership distribution charts
- Recent members display
- Attendance statistics

#### 11. **Settings & Configuration**
- Feature toggles per gym (CRM, Scheduling, Attendance, Inventory, Staff, Payments, Reports)
- White-label branding
- Currency settings
- Timezone settings
- Gym contact information

#### 12. **Member Portal**
- Member profile view
- Member attendance history
- Member invoice view
- Class bookings view

#### 13. **Subscription & Billing** ✨ NEW
- Custom subscription plans per gym
- Razor pay payment integration
- Gym-specific payment links (shareable)
- Public checkout page for payments
- Subscription status tracking (pending, active, expired)
- Subscription invoices and payment history
- Feature-based plans (member limits, branch limits, storage)
- Monthly/Quarterly/Yearly plan durations
- Trial period support

#### 14. **Member Access Control** ✨ NEW
- Member login enable/disable by gym owner
- Feature-based member portal access (customizable permissions)
- Three permission levels: Basic, Premium, VIP
- Individual member access overrides
- Granular control over 9 member portal features
- Hierarchical permission system (individual → level → gym defaults)

#### 15. **Help & Support** ✨ NEW
- Support ticket system for member inquiries
- Ticket categories, priorities, and status tracking
- Ticket assignment to staff members
- Reply system with conversation threading
- FAQ knowledge base with search and categories
- FAQ rating system (helpful/not helpful)
- Global and gym-specific FAQs
- Admin FAQ management interface
- Support ticket statistics dashboard

### Feature Toggles

Each gym can enable/disable:
- **CRM** - Lead management system
- **Scheduling** - Class scheduling and booking
- **Attendance** - Check-in/check-out system
- **Inventory** - Equipment management
- **Staff** - Staff management
- **Payments** - Payment and invoice management
- **Reports** - Analytics and reporting
- **Financial** - Expense & revenue management with P&L reports ✨ NEW

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **Vite** | 7.2.4 | Build tool and dev server |
| **TailwindCSS** | 4.1.17 | Utility-first CSS framework |
| **Redux Toolkit** | 2.2.1 | State management |
| **Redux Persist** | 6.0.0 | State persistence |
| **React Router** | 7.10.1 | Client-side routing |
| **Axios** | 1.6.7 | HTTP client |
| **Recharts** | 3.5.1 | Chart library |
| **dnd-kit** | 6.3.1 | Drag and drop for Kanban |
| **Framer Motion** | 12.23.26 | Animation library |
| **Lucide React** | 0.559.0 | Icon library |
| **date-fns** | 4.1.0 | Date utilities |
| **clsx** | 2.1.1 | Conditional class names |
| **tailwind-merge** | 3.4.0 | Tailwind class merging |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express** | 4.18.2 | Web framework |
| **MongoDB** | Latest | NoSQL database |
| **Mongoose** | 8.0.0 | ODM for MongoDB |
| **JWT** | 9.0.0 | Authentication tokens |
| **bcryptjs** | 2.4.3 | Password hashing |
| **express-validator** | 7.0.1 | Request validation |
| **Joi** | 17.11.0 | Schema validation |
| **Multer** | 1.4.5-lts.1 | File upload handling |
| **Cloudinary** | 1.41.0 | Cloud image storage (optional) |
| **Nodemailer** | 7.0.11 | Email service (OTP) |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **dotenv** | 16.3.1 | Environment variables |

### Development Tools

- **ESLint** - Code linting
- **Nodemon** - Auto-restart for development
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

---

## 📁 Folder Structure

```
jymManagement/
│
├── server/                          # Backend Application
│   ├── src/
│   │   ├── app.js                  # Express app entry point
│   │   │
│   │   ├── models/                 # Mongoose Models
│   │   │   ├── User.js             # User model (super_admin, owner, staff, member)
│   │   │   ├── Gym.js              # Gym model with features & branding
│   │   │   ├── Member.js           # Member model
│   │   │   ├── Plan.js             # Membership plan model
│   │   │   ├── Lead.js             # Lead/CRM model
│   │   │   ├── Class.js            # Class/schedule model
│   │   │   ├── Attendance.js       # Attendance tracking model
│   │   │   ├── AttendanceConfig.js # Attendance configuration model
│   │   │   ├── Invoice.js          # Invoice model
│   │   │   ├── Payment.js          # Payment model
│   │   │   ├── Notification.js     # Notification model (in-app)
│   │   │   ├── NotificationTemplate.js # Notification templates
│   │   │   ├── NotificationSettings.js # Gym notification config
│   │   │   ├── Staff.js            # Staff model
│   │   │   ├── Equipment.js        # Equipment/inventory model
│   │   │   └── Otp.js              # OTP model for authentication
│   │   │
│   │   ├── controllers/            # Route Controllers
│   │   │   ├── authController.js   # Authentication (OTP, login, register)
│   │   │   ├── gymController.js    # Gym CRUD & settings
│   │   │   ├── memberController.js # Member management
│   │   │   ├── planController.js   # Plan management
│   │   │   ├── leadController.js   # Lead/CRM management
│   │   │   ├── classController.js  # Class scheduling
│   │   │   ├── attendanceController.js # Attendance tracking
│   │   │   ├── invoiceController.js    # Invoice management
│   │   │   ├── paymentController.js    # Payment management
│   │   │   ├── notificationController.js # Notification management
│   │   │   ├── staffController.js      # Staff management
│   │   │   └── equipmentController.js  # Equipment management
│   │   │
│   │   ├── routes/                 # API Routes
│   │   │   ├── authRoutes.js       # /api/v1/auth
│   │   │   ├── gymRoutes.js        # /api/v1/gyms
│   │   │   ├── memberRoutes.js     # /api/v1/members
│   │   │   ├── planRoutes.js       # /api/v1/plans
│   │   │   ├── leadRoutes.js       # /api/v1/leads
│   │   │   ├── classRoutes.js      # /api/v1/classes
│   │   │   ├── attendanceRoutes.js # /api/v1/attendance
│   │   │   ├── invoiceRoutes.js    # /api/v1/invoices
│   │   │   ├── paymentRoutes.js    # /api/v1/payments
│   │   │   ├── notificationRoutes.js # /api/v1/notifications
│   │   │   ├── staffRoutes.js      # /api/v1/staff
│   │   │   └── equipmentRoutes.js  # /api/v1/equipment
│   │   │
│   │   ├── middleware/             # Express Middleware
│   │   │   ├── auth.js             # JWT authentication
│   │   │   ├── rbac.js             # Role-based access control
│   │   │   ├── gymScope.js         # Multi-tenant gym scoping
│   │   │   ├── featureGuard.js     # Feature toggle enforcement
│   │   │   ├── validate.js         # Request validation
│   │   │   ├── errorHandler.js     # Global error handler
│   │   │   └── upload.js            # File upload handling
│   │   │
│   │   ├── services/               # Business Logic Services
│   │   │   ├── emailService.js     # Email sending (OTP + notifications)
│   │   │   ├── smsService.js       # SMS sending (Fast2SMS)
│   │   │   ├── notificationService.js # Notification orchestrator
│   │   │   ├── inAppNotificationService.js # In-app notifications
│   │   │   ├── invoiceService.js   # Invoice generation logic
│   │   │   └── uploadService.js    # File upload service
│   │   │
│   │   └── utils/                  # Utility Functions
│   │       ├── generateToken.js    # JWT token generation
│   │       ├── hashPassword.js    # Password hashing
│   │       ├── responseFormatter.js # API response formatting
│   │       └── seed.js             # Database seeding (super admin)
│   │
│   ├── uploads/                    # Uploaded files directory
│   ├── package.json                # Backend dependencies
│   └── .env                        # Backend environment variables
│
├── src/                            # Frontend Application
│   ├── main.jsx                    # React entry point
│   ├── App.jsx                     # Main App component with routes
│   │
│   ├── components/                 # React Components
│   │   ├── auth/                   # Authentication Components
│   │   │   ├── ProtectedRoute.jsx  # Route protection wrapper
│   │   │   ├── RoleGuard.jsx       # Role-based route guard
│   │   │   └── FeatureGuard.jsx    # Feature-based route guard
│   │   │
│   │   ├── common/                 # Reusable UI Components
│   │   │   ├── Button.jsx          # Button component
│   │   │   ├── Input.jsx           # Input component
│   │   │   ├── Card.jsx            # Card component
│   │   │   ├── Modal.jsx           # Modal component
│   │   │   ├── Table.jsx           # Table component
│   │   │   ├── Badge.jsx           # Badge component
│   │   │   ├── ConfirmModal.jsx    # Confirmation modal
│   │   │   └── ImageUpload.jsx     # Image upload component
│   │   │
│   │   ├── dashboard/              # Dashboard Components
│   │   │   ├── StatCard.jsx        # Statistics card
│   │   │   ├── RevenueChart.jsx    # Revenue chart
│   │   │   ├── AttendanceChart.jsx # Attendance chart
│   │   │   └── MembershipDistribution.jsx # Membership chart
│   │   │
│   │   ├── crm/                    # CRM Components
│   │   │   ├── KanbanBoard.jsx     # Main Kanban board
│   │   │   ├── KanbanColumn.jsx    # Kanban column
│   │   │   └── LeadCard.jsx        # Lead card component
│   │   │
│   │   ├── leads/                  # Lead Components
│   │   │   └── LeadForm.jsx        # Lead form
│   │   │
│   │   ├── members/                # Member Components
│   │   │   └── MemberForm.jsx      # Member form
│   │   │
│   │   ├── plans/                  # Plan Components
│   │   │   └── CreatePlanModal.jsx  # Plan creation modal
│   │   │
│   │   ├── scheduling/             # Scheduling Components
│   │   │   └── WeeklyCalendar.jsx  # Weekly calendar view
│   │   │
│   │   └── staff/                  # Staff Components
│   │       └── StaffForm.jsx      # Staff form
│   │
│   ├── pages/                      # Page Components
│   │   ├── Login.jsx               # Login page
│   │   ├── Register.jsx            # Registration page
│   │   ├── Dashboard.jsx           # Dashboard page
│   │   ├── Members.jsx             # Members list page
│   │   ├── MemberProfile.jsx       # Member detail page
│   │   ├── MemberInvoices.jsx      # Member invoices page
│   │   ├── MemberClasses.jsx       # Member classes page
│   │   ├── Plans.jsx               # Plans page
│   │   ├── Payments.jsx            # Payments page
│   │   ├── Attendance.jsx          # Attendance page
│   │   ├── Trainers.jsx            # Trainers/Staff page
│   │   ├── Inventory.jsx           # Inventory page
│   │   ├── Settings.jsx            # Settings page
│   │   ├── CRM.jsx                 # CRM/Leads page
│   │   ├── Schedule.jsx            # Schedule page
│   │   ├── Gyms.jsx                # Gyms list (Super Admin)
│   │   ├── GymDetails.jsx          # Gym details (Super Admin)
│   │   ├── NotFound.jsx            # 404 page
│   │   └── Unauthorized.jsx        # 403 page
│   │
│   ├── layouts/                    # Layout Components
│   │   ├── MainLayout.jsx          # Main app layout
│   │   ├── Header.jsx              # Header component
│   │   └── Sidebar.jsx             # Sidebar navigation
│   │
│   ├── store/                      # Redux Store
│   │   ├── index.js                # Store configuration
│   │   └── slices/                 # Redux Slices
│   │       ├── authSlice.js        # Authentication state
│   │       ├── gymSlice.js         # Gym state & features
│   │       ├── memberSlice.js      # Members state
│   │       ├── leadSlice.js        # Leads state
│   │       ├── notificationSlice.js # Notifications state
│   │       └── uiSlice.js          # UI state
│   │
│   ├── services/                   # API Service Layer
│   │   ├── api.js                  # Axios instance & interceptors
│   │   ├── authService.js          # Auth API calls
│   │   ├── gymService.js           # Gym API calls
│   │   ├── memberService.js        # Member API calls
│   │   ├── planService.js          # Plan API calls
│   │   ├── leadService.js          # Lead API calls
│   │   ├── scheduleService.js      # Schedule API calls
│   │   ├── attendanceService.js    # Attendance API calls
│   │   ├── invoiceService.js       # Invoice API calls
│   │   ├── paymentService.js       # Payment API calls
│   │   ├── staffService.js         # Staff API calls
│   │   └── inventoryService.js     # Inventory API calls
│   │
│   ├── hooks/                      # Custom React Hooks
│   │   ├── useAuth.js              # Authentication hook
│   │   ├── useRole.js              # Role checking hook
│   │   ├── useFeature.js           # Feature toggle hook
│   │   ├── usePagination.js        # Pagination hook
│   │   ├── useDebounce.js          # Debounce hook
│   │   ├── useNotification.js      # Notification hook
│   │   └── useGlobalSearch.js      # Global search hook
│   │
│   ├── context/                    # React Context
│   │   └── ThemeContext.jsx        # Theme context provider
│   │
│   ├── config/                     # Configuration
│   │   └── api.js                  # API endpoints configuration
│   │
│   ├── utils/                      # Utility Functions
│   │   ├── constants.js            # App constants (roles, statuses, etc.)
│   │   ├── formatCurrency.js       # Currency formatting
│   │   ├── formatDate.js           # Date formatting
│   │   └── validate.js             # Validation utilities
│   │
│   ├── assets/                     # Static Assets
│   │   └── react.svg               # Images, icons, etc.
│   │
│   ├── App.css                     # Global styles
│   └── index.css                   # Base styles
│
├── public/                         # Public Assets
│   └── vite.svg                    # Public images
│
├── dist/                           # Production Build Output
│   ├── index.html
│   └── assets/
│
├── package.json                    # Frontend dependencies
├── vite.config.js                 # Vite configuration
├── tailwind.config.js              # TailwindCSS configuration
├── postcss.config.js               # PostCSS configuration
├── eslint.config.js                # ESLint configuration
├── index.html                      # HTML entry point
├── TODO.md                         # Feature todo list
└── README.md                       # This file

```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env  # If .env.example exists
   # Or create .env manually
   ```

4. **Configure `.env` file:**
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/gymos
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gymos

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # Super Admin (for seeding)
   SUPER_ADMIN_EMAIL=admin@gymos.com
   SUPER_ADMIN_PASSWORD=Admin@123

   # Email Configuration (for OTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM=noreply@gymos.com

   # Optional: Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

5. **Seed super admin (optional):**
   ```bash
   npm run seed
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:3001`

### Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd ..  # If you're in server directory
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env  # If .env.example exists
   # Or create .env manually
   ```

4. **Configure `.env` file:**
   ```env
   VITE_API_URL=http://localhost:3001/api/v1
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

### Running Both Servers

You can run both servers simultaneously:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/request-otp` | Request OTP for login | No |
| POST | `/auth/verify-otp` | Verify OTP and login | No |
| POST | `/auth/register` | Register new user | No |
| GET | `/auth/me` | Get current user | Yes |
| PUT | `/auth/profile` | Update profile | Yes |

### Gym Endpoints (Super Admin Only)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/gyms` | List all gyms | Yes (super_admin) |
| GET | `/gyms/:id` | Get gym details | Yes (super_admin) |
| POST | `/gyms` | Create gym | Yes (super_admin) |
| PUT | `/gyms/:id` | Update gym | Yes (super_admin) |
| PUT | `/gyms/:id/features` | Update features | Yes (super_admin) |
| PUT | `/gyms/:id/branding` | Update branding | Yes (super_admin) |

### Member Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/members` | List members | Yes (owner, staff) |
| GET | `/members/:id` | Get member | Yes |
| POST | `/members` | Create member | Yes (owner, staff) |
| PUT | `/members/:id` | Update member | Yes (owner, staff) |
| PUT | `/members/:id/renew` | Renew subscription | Yes (owner, staff) |
| DELETE | `/members/:id` | Delete member | Yes (owner) |

### Lead (CRM) Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/leads` | List leads | Yes (owner, staff) |
| GET | `/leads/:id` | Get lead | Yes (owner, staff) |
| POST | `/leads` | Create lead | Yes (owner, staff) |
| PUT | `/leads/:id` | Update lead | Yes (owner, staff) |
| PUT | `/leads/:id/status` | Update status | Yes (owner, staff) |
| DELETE | `/leads/:id` | Delete lead | Yes (owner, staff) |

### Class Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/classes` | List classes | Yes |
| GET | `/classes/:id` | Get class | Yes |
| POST | `/classes` | Create class | Yes (owner, staff) |
| PUT | `/classes/:id` | Update class | Yes (owner, staff) |
| POST | `/classes/:id/book` | Book class | Yes |
| DELETE | `/classes/:id/book/:bookingId` | Cancel booking | Yes |
| DELETE | `/classes/:id` | Delete class | Yes (owner, staff) |

### Attendance Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/attendance` | List attendance | Yes (owner, staff) |
| GET | `/attendance/today` | Today's attendance | Yes (owner, staff) |
| POST | `/attendance/checkin` | Check in | Yes |
| PUT | `/attendance/checkout/:id` | Check out | Yes |
| GET | `/attendance/member/:memberId` | Member attendance | Yes |

### Invoice Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/invoices` | List invoices | Yes (owner, staff) |
| GET | `/invoices/:id` | Get invoice | Yes |
| POST | `/invoices` | Create invoice | Yes (owner, staff) |
| PUT | `/invoices/:id` | Update invoice | Yes (owner, staff) |
| PUT | `/invoices/:id/paid` | Mark as paid | Yes (owner, staff) |
| DELETE | `/invoices/:id` | Delete invoice | Yes (owner) |

### Payment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/payments` | List payments | Yes (owner, staff) |
| GET | `/payments/:id` | Get payment | Yes (owner, staff) |
| POST | `/payments` | Create payment | Yes (owner, staff) |
| PUT | `/payments/:id` | Update payment | Yes (owner, staff) |
| DELETE | `/payments/:id` | Delete payment | Yes (owner) |

### Staff Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/staff` | List staff | Yes (owner, staff) |
| GET | `/staff/:id` | Get staff | Yes (owner, staff) |
| POST | `/staff` | Create staff | Yes (owner) |
| PUT | `/staff/:id` | Update staff | Yes (owner) |
| DELETE | `/staff/:id` | Delete staff | Yes (owner) |

### Equipment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/equipment` | List equipment | Yes (owner, staff) |
| GET | `/equipment/:id` | Get equipment | Yes (owner, staff) |
| POST | `/equipment` | Create equipment | Yes (owner, staff) |
| PUT | `/equipment/:id` | Update equipment | Yes (owner, staff) |
| PUT | `/equipment/:id/service` | Record service | Yes (owner, staff) |
| DELETE | `/equipment/:id` | Delete equipment | Yes (owner) |

### Plan Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/plans` | List plans | Yes |
| GET | `/plans/:id` | Get plan | Yes |
| POST | `/plans` | Create plan | Yes (owner) |
| PUT | `/plans/:id` | Update plan | Yes (owner) |
| DELETE | `/plans/:id` | Delete plan | Yes (owner) |

### Expense & Revenue Endpoints ✨ NEW

#### Expense Categories

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/expense-categories` | List categories | Yes (owner, staff) |
| GET | `/expense-categories/:id` | Get category | Yes (owner, staff) |
| POST | `/expense-categories` | Create category | Yes (owner) |
| PUT | `/expense-categories/:id` | Update category | Yes (owner) |
| DELETE | `/expense-categories/:id` | Delete category | Yes (owner) |

#### Expenses

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/expenses` | List expenses (with filters) | Yes (owner, staff) |
| GET | `/expenses/:id` | Get expense | Yes (owner, staff) |
| POST | `/expenses` | Create expense | Yes (owner, staff) |
| PUT | `/expenses/:id` | Update expense | Yes (owner, staff) |
| DELETE | `/expenses/:id` | Soft delete expense | Yes (owner) |
| POST | `/expenses/:id/approve` | Approve expense | Yes (owner) |
| POST | `/expenses/:id/reject` | Reject expense | Yes (owner) |
| GET | `/expenses/stats` | Get expense statistics | Yes (owner) |
| GET | `/expenses/export` | Export to CSV | Yes (owner) |
| POST | `/expenses/import` | Import from JSON | Yes (owner) |

#### Revenues

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/revenues` | List revenues (with filters) | Yes (owner, staff) |
| GET | `/revenues/:id` | Get revenue | Yes (owner, staff) |
| POST | `/revenues` | Create revenue | Yes (owner, staff) |
| PUT | `/revenues/:id` | Update revenue | Yes (owner, staff) |
| DELETE | `/revenues/:id` | Soft delete revenue | Yes (owner) |
| GET | `/revenues/stats` | Get revenue statistics | Yes (owner) |

#### Financial Reports

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/financial-reports/profit-loss` | P&L report | Yes (owner) |
| GET | `/financial-reports/expense-trends` | Expense trends | Yes (owner) |
| GET | `/financial-reports/revenue-trends` | Revenue trends | Yes (owner) |
| GET | `/financial-reports/category-breakdown` | Category breakdown | Yes (owner) |
| GET | `/financial-reports/summary` | Financial summary | Yes (owner) |

---

## 🔐 Authentication & Authorization

### Authentication Method

The system uses **OTP-based authentication** (password-based login has been removed):

1. User enters email
2. System sends OTP via email
3. User enters OTP
4. System verifies OTP (max 5 attempts, 10 min expiry)
5. JWT token is generated and returned

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **super_admin** | System administrator | Full access to all gyms, can create/manage gyms |
| **owner** | Gym owner | Full access to their gym, can manage staff, members, settings |
| **staff** | Gym staff | Limited access (members, attendance, classes) |
| **member** | Gym member | View-only access to their own data |

### Role-Based Access Control (RBAC)

- **Middleware**: `server/src/middleware/rbac.js`
- **Frontend Guards**: `src/components/auth/RoleGuard.jsx`
- **Routes**: Protected by role-based middleware on backend and components on frontend

### Feature-Based Access Control

- Features can be toggled per gym
- Frontend: `FeatureGuard.jsx` component
- Backend: `featureGuard.js` middleware
- Features: CRM, Scheduling, Attendance, Inventory, Staff, Payments, Reports, Financial ✨ NEW

### Multi-Tenant Data Isolation

- **Middleware**: `server/src/middleware/gymScope.js`
- All data operations are automatically scoped to user's `gymId`
- Super admins can access all gyms or filter by `gymId` query parameter
- Members can only access their own data

---

## 🗄️ Database Models

### User Model
- `email` (unique, required)
- `password` (hashed, required)
- `role` (super_admin, owner, staff, member)
- `gymId` (required for non-super_admin)
- `firstName`, `lastName`, `phone`, `avatar`
- `isActive`, `lastLogin`
- `timestamps`

### Gym Model
- `name` (required)
- `subdomain` (unique, optional)
- `ownerId` (required)
- `planId` (optional)
- `features` (object with boolean flags)
- `branding` (logo, primaryColor, secondaryColor)
- `contact` (email, phone, address, website)
- `settings` (currency, timezone)
- `isActive`
- `timestamps`

### Member Model
- `memberId` (auto-generated, unique)
- `userId` (reference to User)
- `gymId` (required)
- `planId` (reference to Plan)
- `status` (active, expired, suspended, cancelled)
- `startDate`, `endDate`
- `emergencyContact`, `medicalInfo`
- `workoutPlan`, `dietPlan`
- `timestamps`

### Plan Model
- `name`, `description`
- `price`, `duration` (monthly, quarterly, yearly)
- `gymId` (required)
- `features` (array of included features)
- `isActive`
- `timestamps`

### Lead Model
- `name`, `email`, `phone`
- `source` (walk-in, website, social media, referral)
- `status` (new, contacted, trial, negotiation, converted, lost)
- `assignedTo` (reference to Staff)
- `gymId` (required)
- `notes`
- `timestamps`

### Class Model
- `name`, `description`
- `trainerId` (reference to Staff)
- `gymId` (required)
- `schedule` (day, time, duration)
- `capacity`, `recurring`
- `bookings` (array of member bookings)
- `timestamps`

### Attendance Model
- `memberId` (reference to Member)
- `gymId` (required)
- `checkInTime`, `checkOutTime`
- `duration` (calculated)
- `status` (active, completed)
- `timestamps`

### Invoice Model
- `invoiceNumber` (auto-generated)
- `memberId` (reference to Member)
- `gymId` (required)
- `items` (array of invoice items)
- `subtotal`, `tax`, `discount`, `total`
- `status` (draft, pending, paid, overdue, cancelled)
- `dueDate`, `paidDate`
- `timestamps`

### Payment Model
- `invoiceId` (reference to Invoice)
- `memberId` (reference to Member)
- `gymId` (required)
- `amount`, `method` (cash, card, bank_transfer, online)
- `transactionId`
- `status` (pending, completed, failed, refunded)
- `timestamps`

### Staff Model
- `userId` (reference to User)
- `gymId` (required)
- `specialty`, `certifications`
- `hireDate`, `salary`
- `isActive`
- `timestamps`

### Equipment Model
- `name` (required)
- `category` (cardio, strength, functional, accessories)
- `manufacturer`, `model`, `serialNumber`
- `purchaseDate`, `purchasePrice`
- `warrantyExpiry`
- `location`, `condition`, `status`
- `notes`
- `serviceHistory` (array of service records)
- `gymId` (required)
- `timestamps`

### ExpenseCategory Model ✨ NEW
- `name` (required)
- `description`
- `icon` (emoji)
- `color` (hex code)
- `gymId` (required)
- `isDefault` (boolean)
- `isActive` (boolean)
- `timestamps`

### Expense Model ✨ NEW
- `amount` (required, number)
- `categoryId` (required, ref to ExpenseCategory)
- `description` (required)
- `expenseDate` (required, date)
- `paymentMethod` (cash, card, bank_transfer, online, check, other)
- `vendor`
- `receiptUrl`
- `notes`
- `gymId` (required)
- `createdBy` (required, ref to User)
- `approvalStatus` (pending, approved, rejected)
- `approvedBy` (ref to User)
- `approvalNotes`
- `approvedAt` (date)
- `isDeleted` (boolean, soft delete)
- `timestamps`

### Revenue Model ✨ NEW
- `amount` (required, number)
- `source` (membership, pos_sale, personal_training, merchandise, classes, other)
- `description` (required)
- `revenueDate` (required, date)
- `notes`
- `gymId` (required)
- `paymentId` (optional, ref to Payment)
- `memberId` (optional, ref to Member)
- `createdBy` (required, ref to User)
- `isDeleted` (boolean, soft delete)
- `timestamps`

### OTP Model
- `email` (required)
- `otp` (6-digit code)
- `expiresAt` (10 minutes)
- `attempts` (max 5)
- `used` (boolean)
- `timestamps`

---

## 💻 Development Guidelines

### Code Style

- **Frontend**: React functional components with hooks
- **Backend**: Express with async/await
- **Naming**: camelCase for variables, PascalCase for components
- **ESLint**: Configured for React and Node.js

### State Management

- Use **Redux Toolkit** for global state
- Use **local state** (useState) for component-specific state
- Use **Redux Persist** for auth and gym features

### API Calls

- Use **service layer** (`src/services/`) for all API calls
- Use **Axios interceptors** for token injection and error handling
- Handle loading and error states in components

### Error Handling

- Backend: Global error handler middleware
- Frontend: Error boundaries and try-catch blocks
- User-friendly error messages

### File Uploads

- Backend: Multer middleware for file handling
- Optional: Cloudinary integration for cloud storage
- Frontend: ImageUpload component

### Environment Variables

- Backend: `.env` in `server/` directory
- Frontend: `.env` in root directory (prefixed with `VITE_`)

### Database Seeding

```bash
cd server
npm run seed
```

This creates a super admin user with the email and password from `.env`.

---

## 🚢 Deployment

### Backend Deployment

1. **Set environment variables** on your hosting platform
2. **Build and start:**
   ```bash
   npm start
   ```
3. **Ensure MongoDB** is accessible (Atlas or self-hosted)
4. **Configure CORS** for your frontend domain

### Frontend Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```
2. **Deploy `dist/` folder** to hosting (Vercel, Netlify, etc.)
3. **Set environment variables:**
   - `VITE_API_URL` - Your backend API URL

### Recommended Hosting

- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Railway, Render, Heroku, or VPS
- **Database**: MongoDB Atlas (recommended) or self-hosted

### Environment Variables for Production

**Backend:**
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production MongoDB URI
- Set up production email service

**Frontend:**
- Set `VITE_API_URL` to production backend URL

---

## 📋 TODO & Roadmap

This section outlines all planned features and enhancements organized by priority level.

### Priority Levels

- **P1 (Critical)**: Core features essential for production readiness
- **P2 (High)**: Important features that enhance functionality
- **P3 (Medium)**: Nice-to-have features for future iterations

---

### 🔴 P1 Features (Critical Priority)

#### Attendance System
- [ ] **Super admin attendance assignment** - Super admin decides which attendance systems are available per gym
- [ ] **Gym owner attendance selection** - Gym owner selects attendance system after purchasing plan
- [ ] **Attendance enable/disable toggle** - Gym owner can enable or disable any attendance system from settings
- [ ] **Attendance import/export** - CSV import and export of attendance data
- [ ] **Attendance reports** - Daily / weekly / monthly attendance reports
- [ ] **QR-based check-in** - Unique QR per gym or per session
- [ ] **Staff override logs** - Track manual overrides by staff

#### Notifications System
- [ ] **Email notifications** - Non-OTP emails (renewals, payments, classes)
- [ ] **SMS notifications** - SMS alerts for important events
- [ ] **WhatsApp notifications** - WhatsApp message integration
- [ ] **In-app notifications** - Real-time in-app alerts
- [ ] **Notification manager** - Centralized notification control panel

#### Expense & Revenue Manager
- [ ] **Expense tracking** - Track daily/monthly gym expenses
- [ ] **Expense categories** - Rent, salary, utilities, maintenance etc
- [ ] **Revenue tracking** - Memberships, classes, product sales
- [ ] **Profit & loss report** - Auto calculate net profit
- [ ] **Expense import/export** - CSV import/export of expenses
- [ ] **Expense approval workflow** - Owner approval for large expenses

#### Member Access Control
- [ ] **Member login access control** - Allow login based on access provided by gym
- [ ] **Feature-based member access** - Restrict classes, attendance, payments view
- [ ] **Member role permissions** - Granular access for members

#### Communication
- [ ] **WhatsApp integration** - Two-way WhatsApp communication
- [ ] **Class reminders (email)** - Automated class reminder emails
- [ ] **Class reminders (app)** - In-app class reminders
- [ ] **Class reminders (message)** - SMS / WhatsApp reminders

#### Help & Support
- [ ] **Help desk module** - Raise and track support tickets
- [ ] **FAQ & documentation** - In-app help articles
- [ ] **Admin support access** - Super admin support panel

#### Data Management
- [ ] **Member import/export** - Import existing members via CSV
- [ ] **Attendance data migration** - Migrate old attendance data
- [ ] **Backup & restore** - Manual and automated backups

#### Settings Panel
- [ ] **Dynamic settings panel** - Settings shown based on enabled features
- [ ] **Gym-level configuration** - Settings per gym
- [ ] **Role-based settings visibility** - Hide/show settings per role

#### Staff & Trainer Access
- [ ] **Staff access assignment** - Assign module-level access to staff
- [ ] **Trainer-specific permissions** - Limit trainers to classes & attendance
- [ ] **Staff activity logs** - Track staff actions

#### Member Management
- [ ] **Archive member** - Soft delete members
- [ ] **Unarchive member** - Restore archived members
- [ ] **Archive audit log** - Track who archived/unarchived members

#### Subscription & Billing
- [ ] **Gym subscription plans** - Gym owner can create multiple subscription plans
- [ ] **Feature-based plans** - Enable/disable features per subscription plan
- [ ] **Attendance system mapping** - Define which attendance systems are allowed per plan
- [ ] **User limit per plan** - Set max staff/members allowed
- [ ] **Branch limit per plan** - Limit number of branches per gym
- [ ] **Storage limit per plan** - Set document/image storage limits
- [ ] **Custom pricing per gym** - Subscription price can vary gym-to-gym
- [ ] **Plan duration** - Monthly / Quarterly / Yearly plans
- [ ] **Trial plan** - Free trial with expiry
- [ ] **Auto expiry handling** - Auto-disable features on plan expiry
- [ ] **Upgrade plan** - Allow gym owner to upgrade plan
- [ ] **Downgrade plan** - Allow downgrade with restrictions
- [ ] **Plan change proration** - Adjust billing when switching plans
- [ ] **Subscription status tracking** - Active / Expired / Suspended
- [ ] **Subscription invoices** - Auto-generate invoice for subscription
- [ ] **Online payment for subscription** - Razorpay / Stripe payment integration
- [ ] **Manual payment approval** - Super admin can approve offline payments
- [ ] **Subscription payment history** - View all past subscription payments
- [ ] **Dynamic plan links** - Auto-generate unique URL per plan
- [ ] **Gym-specific plan links** - Same plan can have different pricing per gym
- [ ] **Public plan checkout** - Public link for gym subscription purchase
- [ ] **Plan access guard** - Middleware checks plan before allowing feature
- [ ] **Plan audit logs** - Log plan creation and updates

---

### 🟡 P2 Features (High Priority)

#### Attendance System
- [ ] **Multiple attendance systems** - Support QR / Manual / NFC / Biometric etc
- [ ] **Single active attendance** - Only one active session per member

#### UI & UX
- [ ] **Light mode** - Light theme support
- [ ] **Dark mode** - Dark theme support
- [ ] **Theme persistence** - Save user theme preference

---

### 🟢 P3 Features (Medium Priority)

#### Attendance System
- [ ] **Multiple attendance systems at once** - Allow more than one attendance method simultaneously
- [ ] **Document upload & validation** - Upload ID / medical documents for attendance verification

#### Attendance Validation & Abuse Control
- [ ] **Device/IP restriction** - Restrict multiple check-ins from same device/IP

---

### 📊 Reports & Analytics (Priority TBD)

#### Dashboard & Overview
- [ ] **Dashboard Overview** - One screen showing KPIs like total sales, profit, stock and active offers
- [ ] **Real-Time Sales Metrics** - Live updating sales data using polling or WebSockets

#### Sales Reports
- [ ] **Daily Sales Report** - Total sales for a selected date with filters
- [ ] **Weekly Sales Report** - Automatically calculated weekly sales summary
- [ ] **Monthly Sales Report** - Month-wise revenue trends and comparison
- [ ] **Yearly Sales Report** - Annual business performance overview
- [ ] **Payment Mode Report** - Breakup of sales by Cash, UPI, Card etc.
- [ ] **GST / Tax Report** - Tax collected per period as per GST slabs
- [ ] **Refund & Cancellation Report** - Tracks refunded or canceled transactions

#### Product & Inventory Reports
- [ ] **Product-wise Sales Report** - Sales grouped by individual products
- [ ] **Category-wise Sales Report** - Shows which product categories perform best
- [ ] **Brand-wise Sales Report** - Sales analysis by brand
- [ ] **Top Selling Products** - Products with highest quantity or revenue
- [ ] **Slow Moving Products** - Identifies products with very low sales
- [ ] **Profit & Margin Report** - Profit calculated using cost price vs selling price
- [ ] **Purchase Cost vs Sale Price** - Helps understand pricing and margins
- [ ] **Inventory Stock Report** - Real-time available stock levels
- [ ] **Low Stock Report** - Items below minimum stock threshold
- [ ] **Expiring Stock Report** - Products nearing expiry date
- [ ] **Inventory Valuation Report** - Total stock value using FIFO/LIFO
- [ ] **Stock Adjustment History** - Log of manual stock corrections

#### Staff & Customer Reports
- [ ] **Staff-wise Sales Report** - Sales performance per staff member
- [ ] **Counter / POS-wise Sales** - Sales per billing counter or POS
- [ ] **Shift-wise Sales** - Sales data by morning/evening shifts
- [ ] **Customer-wise Purchase Report** - Purchase history of each customer
- [ ] **Member vs Non-Member Sales** - Compares member and walk-in sales

#### Promotion & Discount Reports
- [ ] **Promotion Performance Report** - Measures impact of discounts & offers
- [ ] **Discount Usage Report** - Tracks how often discounts are applied
- [ ] **Gift Card Sales Report** - Tracks gift cards sold
- [ ] **Gift Card Redemption Report** - Track gift card usage

---

### 🎁 Promotions & Offers (Priority TBD)

- [ ] **Date-Based Offers** - Offers valid for a date range
- [ ] **Product-Based Offers** - Discounts on specific products
- [ ] **Category-Based Offers** - Discounts on categories
- [ ] **Brand-Based Offers** - Brand-specific promotions
- [ ] **Customer Segment Offers** - Member / non-member pricing
- [ ] **Location-Based Pricing** - City or branch-based pricing
- [ ] **Auto Apply Rules** - System applies best offer
- [ ] **Promotion Usage Limit** - Limit offer usage
- [ ] **Promotion Performance** - Track offer effectiveness

---

## 🗺️ Implementation Plan

### Phase 1: Foundation & Core Infrastructure (Weeks 1-4)

**Goal**: Establish robust subscription system and member access control

#### Week 1-2: Subscription & Billing System
1. **Backend Development**
   - Create subscription plan models and controllers
   - Implement plan creation, update, delete APIs
   - Add feature-based plan configuration
   - Implement user/branch/storage limits per plan
   - Create plan access guard middleware

2. **Frontend Development**
   - Build subscription plan management UI
   - Create plan selection interface for gym owners
   - Implement plan upgrade/downgrade flows
   - Add subscription status dashboard

3. **Payment Integration**
   - Integrate Razorpay/Stripe for online payments
   - Implement payment webhook handlers
   - Create subscription invoice generation
   - Add payment history tracking

#### Week 3-4: Member Access Control & Settings
1. **Access Control System**
   - Implement member login access control
   - Create feature-based member permissions
   - Build granular role permission system
   - Add access control middleware

2. **Dynamic Settings Panel**
   - Create settings schema based on enabled features
   - Implement gym-level configuration
   - Add role-based settings visibility
   - Build settings UI components

---

### Phase 2: Attendance & Validation (Weeks 5-8)

**Goal**: Complete attendance system with multiple methods and abuse prevention

#### Week 5-6: Attendance Systems
1. **Backend Development**
   - Implement QR-based check-in system
   - Add manual attendance entry
   - Create attendance system assignment (super admin)
   - Build attendance enable/disable toggle
   - Implement single active session validation

2. **Frontend Development**
   - Build QR code generation and scanning UI
   - Create manual attendance entry interface
   - Add attendance system selection for gym owners
   - Implement attendance dashboard

#### Week 7-8: Attendance Reports & Import/Export
1. **Reports**
   - Create daily/weekly/monthly attendance reports
   - Build attendance analytics dashboard
   - Add member attendance history view
   - Implement staff override logging

2. **Data Management**
   - Create CSV import functionality
   - Build CSV export for attendance data
   - Add attendance data migration tools
   - Implement data validation

---

### Phase 3: Communication & Notifications (Weeks 9-12)

**Goal**: Implement comprehensive notification and communication system

#### Week 9-10: Notification System
1. **Backend Development**
   - Set up email notification service
   - Integrate SMS gateway (Twilio/similar)
   - Implement WhatsApp Business API integration
   - Create in-app notification system
   - Build notification queue management

2. **Frontend Development**
   - Create notification center UI
   - Build notification preferences panel
   - Implement real-time notification display
   - Add notification history view

#### Week 11-12: Communication Features
1. **Automated Communications**
   - Implement class reminder emails
   - Add SMS/WhatsApp reminders
   - Create membership renewal notifications
   - Build payment reminder system

2. **Two-way Communication**
   - Implement WhatsApp integration for two-way chat
   - Create communication history tracking
   - Add message templates management
   - Build bulk messaging functionality

---

### Phase 4: Financial Management (Weeks 13-16)

**Goal**: Complete expense tracking and financial reporting

#### Week 13-14: Expense Management
1. **Backend Development**
   - Create expense tracking models
   - Implement expense categories
   - Build expense CRUD APIs
   - Add expense approval workflow
   - Create expense import/export

2. **Frontend Development**
   - Build expense entry interface
   - Create expense category management
   - Implement expense approval UI
   - Add expense dashboard

#### Week 15-16: Revenue & P&L Reports
1. **Revenue Tracking**
   - Implement revenue tracking from multiple sources
   - Create revenue categorization
   - Build revenue analytics

2. **Financial Reports**
   - Implement profit & loss calculation
   - Create financial dashboard
   - Add revenue vs expense charts
   - Build export functionality for reports

---

### Phase 5: Reports & Analytics (Weeks 17-20)

**Goal**: Comprehensive reporting and analytics system

#### Week 17-18: Sales & Product Reports
1. **Sales Reports**
   - Daily/Weekly/Monthly/Yearly sales reports
   - Payment mode breakup reports
   - GST/Tax reports
   - Refund & cancellation tracking

2. **Product Reports**
   - Product-wise sales analysis
   - Category and brand-wise reports
   - Top selling and slow-moving products
   - Profit margin analysis

#### Week 19-20: Advanced Analytics
1. **Inventory Reports**
   - Real-time stock reports
   - Low stock alerts
   - Expiring stock tracking
   - Inventory valuation (FIFO/LIFO)
   - Stock adjustment history

2. **Performance Reports**
   - Staff-wise sales performance
   - Counter/POS-wise reports
   - Shift-wise analysis
   - Customer purchase history
   - Member vs non-member comparison

---

### Phase 6: Promotions & Support (Weeks 21-24)

**Goal**: Implement promotions system and help desk

#### Week 21-22: Promotions & Offers
1. **Backend Development**
   - Create promotion models
   - Implement date/product/category-based offers
   - Build auto-apply rules engine
   - Add promotion usage limits
   - Create promotion performance tracking

2. **Frontend Development**
   - Build promotion creation UI
   - Implement offer management dashboard
   - Add promotion analytics
   - Create customer-facing offer display

#### Week 23-24: Help & Support
1. **Help Desk Module**
   - Create ticket system
   - Implement ticket assignment and tracking
   - Build FAQ management
   - Add in-app documentation

2. **Support Features**
   - Create super admin support panel
   - Implement ticket status workflow
   - Add support analytics
   - Build knowledge base

---

### Phase 7: Data Management & Polish (Weeks 25-28)

**Goal**: Complete data management features and UI enhancements

#### Week 25-26: Data Management
1. **Import/Export**
   - Member bulk import via CSV
   - Data validation and error handling
   - Attendance data migration tools
   - Complete data export functionality

2. **Backup & Restore**
   - Implement manual backup
   - Create automated backup scheduling
   - Build restore functionality
   - Add backup history tracking

#### Week 27-28: UI/UX Enhancements
1. **Theme System**
   - Implement light mode
   - Create dark mode
   - Add theme persistence
   - Build theme customization options

2. **Staff Management**
   - Complete staff activity logging
   - Implement detailed access assignment
   - Add trainer-specific permissions
   - Create staff performance tracking

---

### Phase 8: Advanced Features (Weeks 29-32)

**Goal**: Implement remaining P2 and P3 features

#### Week 29-30: Advanced Attendance
1. **Multiple Attendance Systems**
   - NFC integration
   - Biometric system support
   - Multiple simultaneous methods
   - Device/IP restriction

2. **Document Management**
   - ID document upload
   - Medical document validation
   - Document expiry tracking
   - Document verification workflow

#### Week 31-32: Final Features & Testing
1. **Member Management**
   - Archive/unarchive functionality
   - Archive audit logging
   - Member lifecycle management
   - Advanced member analytics

2. **Testing & Optimization**
   - Comprehensive testing of all features
   - Performance optimization
   - Security audit
   - Documentation updates

---

### Success Metrics

- **Phase 1-2**: Core subscription and attendance systems operational
- **Phase 3-4**: Communication and financial tracking fully functional
- **Phase 5-6**: Complete reporting suite and promotion system
- **Phase 7-8**: All P1 features complete, P2/P3 features implemented

### Risk Mitigation

1. **Technical Risks**
   - Regular code reviews
   - Automated testing implementation
   - Staging environment for testing

2. **Integration Risks**
   - Early testing of third-party APIs (Razorpay, WhatsApp, SMS)
   - Fallback mechanisms for external services
   - Comprehensive error handling

3. **Timeline Risks**
   - Buffer time built into each phase
   - Prioritization of P1 features
   - Agile approach for flexibility

---

## 📝 License

MIT

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📞 Support

For issues and questions, please open an issue on the repository.

---

**Last Updated**: Based on current codebase analysis
