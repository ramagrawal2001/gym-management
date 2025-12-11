# GymPro - The Ultimate Gym Management Solution

**GymPro** is a state-of-the-art, premium web application designed to revolutionize how fitness centers operate. Built with a focus on aesthetics, speed, and usability, it provides gym owners and staff with a powerful command center to manage members, finances, and day-to-day operations.

![GymPro Dashboard](https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop)
> *A modern, dark-mode capability dashboard for the fitness industry.*

---

## 🌟 Why GymPro?

*   **Premium Aesthetic:** Escaping the boring "spreadsheet" look of traditional software. GymPro uses modern glassmorphism, smooth transitions, and a refined color palette.
*   **Speed First:** Built on Vite + React 19, pages load instantly.
*   **Dark Mode Native:** Designed from the ground up to look stunning in both Light and Dark modes.

---

## 🚀 Comprehensive Feature Suite

### 1. 📊 Interactive Dashboard
A centralized command center giving you immediate visibility into your gym's health.
*   **Live Metrics:** Real-time counters for Total Members, Monthly Revenue, New Joinings, and Members Expiring Soon.
*   **Revenue Analytics:** Interactive Area Chart distinguishing income trends over the last 12 months.
*   **Retention Tracking:** [Coming Soon] Visualizations for churn rate and retention analysis.
*   **Recent Registrations:** Quick-access table showing the latest member sign-ups and their payment status.

### 2. 👥 Advanced Member Management
Detailed operational tools to manage your community.
*   **Smart Member List:** Searchable, sortable, and filterable table. Filter by Plan (Gold/Silver) or Status (Active/Expired).
*   **360° Member Profile:**
    *   **Personal Info:** Contact details, emergency contacts, and joining dates.
    *   **Subscription Logic:** visual progress bar showing days remaining in current membership.
    *   **Activity Log:** Historical record of every check-in.
    *   **Diet & Workout Plans:** Tabs to view and assign personalized fitness routines.
*   **Quick Actions:** One-click renewal, profile editing, or member deletion.

### 3. 🎯 Leads CRM (Customer Relationship Management)
Convert more prospects with a dedicated sales pipeline.
*   **Kanban Board Interface:** Drag-and-drop leads between stages: **New** → **Contacted** → **Trial Started** → **Negotiation** → **Converted**.
*   **Lead Source Tracking:** Identify if leads came from Instagram, Walk-ins, Website, or Referrals.
*   **Interaction History:** [Planned] Log calls and notes for each potential member.

### 4. 📅 Class Scheduling & Booking
Manage your group fitness ecosystem.
*   **Weekly Calendar View:** A familiar Google-Calendar-style interface to visualize the week's schedule.
*   **Class Types:** Support for various formats like Yoga, HIIT, Zumba, Pilates, and CrossFit.
*   **Instructor Management:** Assign specific trainers to classes.
*   **Capacity Indicators:** Visual cues for how full a class is (e.g., "12/20 booked").

### 5. 💰 Finance & Point of Sale
*   **Invoicing System:** Generate professional invoices for membership renewals.
*   **Payment Tracking:** Monitor Paid vs Pending transactions with color-coded badges.
*   **Membership Plans:** Configurable tier system (e.g., "Gold Yearly", "Silver Monthly") with feature lists and pricing.

### 6. 🛠 Operations & Facility
*   **Smart Attendance:**
    *   **Check-in Kiosk:** A dedicated simplified view for scanning member cards or entering IDs.
    *   **Live Occupancy:** Real-time "Currently In" counter to monitor gym crowding.
*   **Staff & Trainers:** Profile cards for all employees, tracking their specializations and client load.
*   **Inventory Manager:** Track equipment health.
    *   **Status Alerts:** Auto-flag items marked as "Repairs Needed" or "Maintenance Due".
    *   **Asset Tracking:** Purchase dates, warranty info, and categorization (Cardio/Strength).

### 7. ⚙️ System Configuration
*   **Theme Engine:** Global toggle for Light/Dark mode with persistence.
*   **Global Search:** Header-based global search to find members or pages instantly.
*   **Notifications:** Alert system for expiring memberships or pending tasks.

---

## � Technical Architecture

*   **Frontend Framework:** React 19
*   **Build Tool:** Vite (Ultra-fast HMR)
*   **Styling Engine:** Tailwind CSS v4
*   **State Management:** React Context API (Theme) + Local State
*   **Routing:** React Router v6 (Nested Routes)
*   **Drag & Drop:** `@dnd-kit/core` (Accessible, lightweight drag and drop)
*   **Data Visualization:** Recharts (Composable React charts)
*   **Icons:** Lucide React (Consistency and small bundle size)
*   **Date Management:** date-fns

---

## 📂 Project Structure

```bash
jymManagement/
├── src/
│   ├── components/
│   │   ├── common/         # Atomic UI (Button, Card, Input, Modal)
│   │   ├── crm/            # Kanban Board components
│   │   ├── dashboard/      # Charts and Stat Cards
│   │   ├── members/        # Forms and Tables
│   │   └── scheduling/     # Calendar components
│   ├── context/            # React Context (ThemeContext)
│   ├── layouts/            # App Shell (Sidebar, Header)
│   ├── pages/              # Route Components (Dashboard, Members, CRM...)
│   ├── App.jsx             # Main Router Configuration
│   └── index.css           # Tailwind v4 Imports & Base Styles
├── public/                 # Static Assets
└── package.json            # Dependencies
```

---

## 🔮 Future Roadmap

We are actively working on:
1.  **Member Portal PWA:** A mobile app for members to book classes and view workouts.
2.  **Gamification:** Leaderboards for "Most Consistent Member" to boost engagement.
3.  **Expense Tracker:** A debit/credit ledger to calculate Net Profit directly in the dashboard.
4.  **Hardware Integration:** API webhooks for biometric turnstiles.
5.  **Multi-branch Support:** Managing multiple gym locations from a Super Admin view.

---

Developed with ❤️ by **Ram Agrawal**
