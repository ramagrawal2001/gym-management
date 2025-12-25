# Subscription & Billing Feature

GymOS Subscription & Billing system allows super admins to create custom subscription plans for individual gyms with Razorpay payment integration.

---

## Overview

The subscription feature enables:
- **Custom Pricing**: Super admin creates tailored plans with negotiated prices per gym
- **Payment Links**: Shareable payment links for gyms to complete payments
- **Dashboard Payment**: Gym owners can pay through their logged-in dashboard
- **Payment Tracking**: Full history of payments, invoices, and subscription status

---

## User Flows

### Super Admin Flow

1. Navigate to **Subscription Plans** in sidebar
2. Click **Create Plan** and select a gym
3. Set custom price, duration, and feature limits
4. Copy the generated payment link to share with gym owner
5. Monitor payment status from the plans list

### Gym Owner Flow

**Option A - Dashboard Payment:**
1. Login to your gym account
2. Navigate to **My Subscription** in sidebar
3. View assigned plan(s) and click **Pay Now**
4. Complete payment via Razorpay checkout

**Option B - Payment Link:**
1. Open the payment link shared by admin
2. Review plan details
3. Click **Pay** and complete Razorpay checkout
4. Subscription activates immediately

---

## API Endpoints

### Subscription Plans

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/subscription-plans` | Super Admin | List all plans |
| GET | `/api/v1/subscription-plans/my` | Owner | Get my gym's plans |
| GET | `/api/v1/subscription-plans/link/:token` | Public | Get plan by payment link |
| POST | `/api/v1/subscription-plans` | Super Admin | Create plan for gym |
| PUT | `/api/v1/subscription-plans/:id` | Super Admin | Update plan |
| DELETE | `/api/v1/subscription-plans/:id` | Super Admin | Delete plan |
| POST | `/api/v1/subscription-plans/:id/regenerate-link` | Super Admin | Regenerate payment link |

### Subscriptions

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/subscriptions` | Super Admin | List all subscriptions |
| GET | `/api/v1/subscriptions/me` | Owner | Get my subscription |
| POST | `/api/v1/subscriptions/create-order` | Public | Create Razorpay order |
| POST | `/api/v1/subscriptions/verify-payment` | Public | Verify payment |
| GET | `/api/v1/subscriptions/payments` | Owner/Admin | Get payment history |
| GET | `/api/v1/subscriptions/invoices` | Owner/Admin | Get invoices |
| PUT | `/api/v1/subscriptions/:id/cancel` | Super Admin | Cancel subscription |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/webhooks/razorpay` | Razorpay payment webhooks |

---

## Data Models

### SubscriptionPlan
| Field | Type | Description |
|-------|------|-------------|
| gymId | ObjectId | Reference to Gym |
| name | String | Plan name |
| description | String | Plan description |
| price | Number | Custom price in INR |
| duration | Enum | monthly, quarterly, yearly |
| features | Object | Feature limits and toggles |
| paymentLinkToken | String | Unique token for payment link |
| isPaid | Boolean | Payment status |

### Subscription
| Field | Type | Description |
|-------|------|-------------|
| gymId | ObjectId | Reference to Gym |
| planId | ObjectId | Reference to SubscriptionPlan |
| status | Enum | pending, trial, active, expired, cancelled |
| startDate | Date | Subscription start |
| endDate | Date | Subscription end |

---

## Plan Features

Each plan includes configurable limits:
- **maxMembers**: Maximum members allowed
- **maxBranches**: Number of branches
- **maxStorage**: Storage limit in MB
- **CRM**: Lead management
- **Scheduling**: Class scheduling
- **Attendance**: Attendance tracking
- **Inventory**: Equipment management
- **Staff**: Staff management
- **Payments**: Payment processing
- **Reports**: Analytics & reports

---

## Payment Integration

### Razorpay Configuration

Add to server `.env`:
```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

### Test Card Details
| Field | Value |
|-------|-------|
| Card Number | 4111 1111 1111 1111 |
| Expiry | Any future date |
| CVV | Any 3 digits |

---

## File Structure

```
server/
├── models/
│   ├── SubscriptionPlan.js
│   ├── Subscription.js
│   ├── SubscriptionInvoice.js
│   └── SubscriptionPayment.js
├── controllers/
│   ├── subscriptionPlanController.js
│   └── subscriptionController.js
├── routes/
│   ├── subscriptionPlanRoutes.js
│   └── subscriptionRoutes.js
└── services/
    └── razorpayService.js

src/
├── pages/
│   ├── SubscriptionPlans.jsx
│   ├── GymSubscription.jsx
│   └── PaymentLink.jsx
└── services/
    ├── subscriptionPlanService.js
    └── subscriptionService.js
```

---

## Routes

| Path | Component | Access |
|------|-----------|--------|
| `/subscription-plans` | SubscriptionPlans | Super Admin |
| `/my-subscription` | GymSubscription | Owner |
| `/pay/:token` | PaymentLink | Public |
