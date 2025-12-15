# GymOS - Complete Gym Management System

A full-stack SaaS application for managing gym operations, built with React 19, Node.js, Express, and MongoDB.

## Architecture

```
Frontend (React 19 + Vite + TailwindCSS)
├── Redux store for state management
├── Protected routes with role-based access
├── Feature-based conditional rendering
└── API service layer (axios)

Backend (Node.js + Express + MongoDB)
├── Multi-tenant architecture (gymId scoping)
├── JWT authentication
├── RBAC (Super Admin, Owner, Staff, Member)
├── Feature toggles per gym
└── RESTful API at /api/v1
```

## Features

- **Dashboard** - Analytics and overview
- **Members Management** - CRUD operations, subscriptions, renewals
- **CRM (Leads)** - Kanban board for lead management
- **Class Scheduling** - Weekly calendar, booking system
- **Attendance System** - Check-in/out, live tracking
- **Finance/Invoices** - Invoice generation, payment tracking
- **Staff Management** - Trainer and staff CRUD
- **Inventory** - Equipment tracking and maintenance
- **Settings** - Theme, branding, feature toggles
- **Role-based Access Control** - Multi-level permissions
- **Feature Toggles** - Enable/disable features per gym
- **White-label Branding** - Custom logos and colors

## Tech Stack

### Frontend
- React 19
- Vite
- TailwindCSS
- Redux Toolkit
- React Router 6
- Recharts
- dnd-kit
- Axios

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT
- bcryptjs
- Multer (file uploads)
- Cloudinary (optional)

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gymos
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
SUPER_ADMIN_EMAIL=admin@gymos.com
SUPER_ADMIN_PASSWORD=Admin@123
```

5. Seed super admin (optional):
```bash
npm run seed
```

6. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to project root:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env`:
```env
VITE_API_URL=http://localhost:3001/api/v1
```

5. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/v1/auth/request-otp` - Request OTP for login (All users)
- `POST /api/v1/auth/verify-otp` - Verify OTP and login (All users)
- `POST /api/v1/auth/register` - Register new user (no password required)
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update profile
- **Note:** Password-based login has been removed. All users must use OTP login.

### Gyms (Super Admin only)
- `GET /api/v1/gyms` - List all gyms
- `GET /api/v1/gyms/:id` - Get gym
- `POST /api/v1/gyms` - Create gym
- `PUT /api/v1/gyms/:id` - Update gym
- `PUT /api/v1/gyms/:id/features` - Update features
- `PUT /api/v1/gyms/:id/branding` - Update branding

### Members
- `GET /api/v1/members` - List members
- `GET /api/v1/members/:id` - Get member
- `POST /api/v1/members` - Create member
- `PUT /api/v1/members/:id` - Update member
- `PUT /api/v1/members/:id/renew` - Renew subscription
- `DELETE /api/v1/members/:id` - Delete member

### Leads (CRM)
- `GET /api/v1/leads` - List leads
- `GET /api/v1/leads/:id` - Get lead
- `POST /api/v1/leads` - Create lead
- `PUT /api/v1/leads/:id` - Update lead
- `PUT /api/v1/leads/:id/status` - Update status
- `DELETE /api/v1/leads/:id` - Delete lead

### Classes
- `GET /api/v1/classes` - List classes
- `GET /api/v1/classes/:id` - Get class
- `POST /api/v1/classes` - Create class
- `PUT /api/v1/classes/:id` - Update class
- `POST /api/v1/classes/:id/book` - Book class
- `DELETE /api/v1/classes/:id/book/:bookingId` - Cancel booking
- `DELETE /api/v1/classes/:id` - Delete class

### Attendance
- `GET /api/v1/attendance` - List attendance
- `GET /api/v1/attendance/today` - Today's attendance
- `POST /api/v1/attendance/checkin` - Check in
- `PUT /api/v1/attendance/checkout/:id` - Check out
- `GET /api/v1/attendance/member/:memberId` - Member attendance

### Invoices
- `GET /api/v1/invoices` - List invoices
- `GET /api/v1/invoices/:id` - Get invoice
- `POST /api/v1/invoices` - Create invoice
- `PUT /api/v1/invoices/:id` - Update invoice
- `PUT /api/v1/invoices/:id/paid` - Mark as paid
- `DELETE /api/v1/invoices/:id` - Delete invoice

### Payments
- `GET /api/v1/payments` - List payments
- `GET /api/v1/payments/:id` - Get payment
- `POST /api/v1/payments` - Create payment
- `PUT /api/v1/payments/:id` - Update payment
- `DELETE /api/v1/payments/:id` - Delete payment

### Staff
- `GET /api/v1/staff` - List staff
- `GET /api/v1/staff/:id` - Get staff member
- `POST /api/v1/staff` - Create staff
- `PUT /api/v1/staff/:id` - Update staff
- `DELETE /api/v1/staff/:id` - Delete staff

### Equipment
- `GET /api/v1/equipment` - List equipment
- `GET /api/v1/equipment/:id` - Get equipment
- `POST /api/v1/equipment` - Create equipment
- `PUT /api/v1/equipment/:id` - Update equipment
- `PUT /api/v1/equipment/:id/service` - Record service
- `DELETE /api/v1/equipment/:id` - Delete equipment

## User Roles

- **Super Admin** - Full system access, can manage all gyms (OTP login only)
- **Owner** - Full access to their gym (OTP login only)
- **Staff** - Limited access (members, attendance, classes) (OTP login only)
- **Member** - View-only access to their own data (OTP login only)

## Login Methods

- **OTP Login (All Users)**: 
  - Enter email → Receive OTP via email → Enter OTP to login
  - OTP expires in 10 minutes
  - Maximum 5 verification attempts per OTP
  - All users must use OTP login (password-based login has been removed)

## Feature Toggles

Features can be enabled/disabled per gym:
- CRM
- Scheduling
- Attendance
- Inventory
- Staff Management
- Payments
- Reports

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRE` - JWT expiration (default: 7d)
- `SUPER_ADMIN_EMAIL` - Super admin email
- `SUPER_ADMIN_PASSWORD` - Super admin password (not used for login - OTP only)
- `SMTP_HOST` - SMTP server host (default: smtp.gmail.com)
- `SMTP_PORT` - SMTP server port (default: 587)
- `SMTP_USER` or `EMAIL_USER` - SMTP username/email
- `SMTP_PASS` or `EMAIL_PASSWORD` - SMTP password
- `EMAIL_FROM` - Email sender address (default: noreply@gymos.com)
- `CLOUDINARY_CLOUD_NAME` - (Optional) Cloudinary cloud name
- `CLOUDINARY_API_KEY` - (Optional) Cloudinary API key
- `CLOUDINARY_API_SECRET` - (Optional) Cloudinary API secret

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:3001/api/v1)

## Development

### Backend
```bash
cd server
npm run dev  # Start with watch mode
npm start    # Start production mode
npm run seed # Seed super admin
```

### Frontend
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run preview # Preview production build
```

## Project Structure

```
jymManagement/
├── server/                 # Backend
│   ├── src/
│   │   ├── models/        # Mongoose models
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, RBAC, etc.
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utilities
│   │   └── app.js         # Express app
│   └── package.json
├── src/                   # Frontend
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── store/             # Redux store
│   ├── services/           # API services
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utilities
│   └── config/             # Configuration
└── package.json
```

## License

MIT
