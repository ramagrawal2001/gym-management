# Expense & Revenue Manager

A comprehensive financial management module for tracking expenses, revenue, and generating profit & loss reports in GymOS.

## Overview

The Expense & Revenue Manager enables gym owners and super admins to maintain complete financial oversight of their gym operations. Track all expenses with approval workflows, monitor revenue from multiple sources, and generate detailed P&L reports with visual analytics.

---

## Features

### ✅ Expense Tracking
- **Create, edit, and delete expenses** with detailed information
- Track amount, date, payment method, vendor, and notes
- Attach receipt URLs for documentation
- Filter by date range, category, approval status, and search
- Export expenses to CSV for external analysis
- Import expenses from JSON data

### ✅ Expense Categories
- **Custom expense categories** with icons and colors
- Default and user-defined categories
- Prevent deletion of categories in use
- Active/inactive status management
- Categories are gym-scoped for multi-tenant isolation

### ✅ Expense Approval Workflow
- **Three-state approval process**: Pending → Approved/Rejected
- Add approval notes for audit trail
- Track who approved/rejected and when
- Only approved expenses count toward P&L calculations
- Automatic "pending" status on expense creation

### ✅ Revenue Tracking
- **Track revenue from multiple sources**:
  - Membership payments (auto-tracked)
  - POS sales
  - Personal training sessions
  - Merchandise sales
  - Classes
  - Other custom sources
- Link revenue to payments and members
- Filter by source type and date range
- View revenue statistics by source

### ✅ Profit & Loss Reports
- **Comprehensive financial analytics**:
  - Total income (membership + other revenue)
  - Total expenses (approved only)
  - Net profit calculation
  - Profit margin percentage
- **Visual trend charts**:
  - Revenue vs Expenses bar chart
  - Category breakdown pie chart
  - Daily/weekly/monthly period grouping
- **Category analysis**:
  - Total and average expenses per category
  - Transaction counts
  - Visual breakdown with icons

### ✅ Import/Export
- **CSV Export**: Download expenses with full details
- **JSON Import**: Bulk import expenses from structured data
- Compatible with external accounting tools

---

## User Roles & Permissions

### Super Admin
- View all gyms' financial data
- Full access to expenses, revenue, and reports across all gyms
- Manage categories for any gym

### Gym Owner
- View and manage their gym's financial data only
- Create and edit expenses (pending approval)
- Approve/reject expense requests
- View P&L reports for their gym
- Manage expense categories

### Staff
- Can create expense requests (requires owner approval)
- View expenses and revenue (read-only in some configurations)

### Members
- No access to financial management features

---

## API Endpoints

### Expense Categories
```
GET     /api/v1/expense-categories          # Get all categories
GET     /api/v1/expense-categories/:id      # Get single category
POST    /api/v1/expense-categories          # Create category
PUT     /api/v1/expense-categories/:id      # Update category
DELETE  /api/v1/expense-categories/:id      # Delete category
```

### Expenses
```
GET     /api/v1/expenses                    # Get all expenses (with filters)
GET     /api/v1/expenses/:id                # Get single expense
POST    /api/v1/expenses                    # Create expense
PUT     /api/v1/expenses/:id                # Update expense
DELETE  /api/v1/expenses/:id                # Soft delete expense
POST    /api/v1/expenses/:id/approve        # Approve expense
POST    /api/v1/expenses/:id/reject         # Reject expense
GET     /api/v1/expenses/stats              # Get expense statistics
GET     /api/v1/expenses/export             # Export to CSV
POST    /api/v1/expenses/import             # Import from JSON
```

### Revenue
```
GET     /api/v1/revenues                    # Get all revenues (with filters)
GET     /api/v1/revenues/:id                # Get single revenue
POST    /api/v1/revenues                    # Create revenue
PUT     /api/v1/revenues/:id                # Update revenue
DELETE  /api/v1/revenues/:id                # Soft delete revenue
GET     /api/v1/revenues/stats              # Get revenue statistics
```

### Financial Reports
```
GET     /api/v1/financial-reports/profit-loss           # P&L report
GET     /api/v1/financial-reports/expense-trends        # Expense trends
GET     /api/v1/financial-reports/revenue-trends        # Revenue trends
GET     /api/v1/financial-reports/category-breakdown    # Category breakdown
GET     /api/v1/financial-reports/summary               # Dashboard summary
```

---

## Data Models

### ExpenseCategory
```javascript
{
  name: String,           // Category name (e.g., "Utilities")
  description: String,    // Optional description
  icon: String,          // Emoji icon (e.g., "⚡")
  color: String,         // Hex color code (e.g., "#3b82f6")
  gymId: ObjectId,       // Reference to Gym
  isDefault: Boolean,    // Default category (cannot be deleted)
  isActive: Boolean      // Active status
}
```

### Expense
```javascript
{
  amount: Number,                           // Expense amount
  categoryId: ObjectId,                     // Reference to ExpenseCategory
  description: String,                      // Expense description
  expenseDate: Date,                        // Date of expense
  paymentMethod: String,                    // cash, card, bank_transfer, online, check, other
  vendor: String,                           // Vendor/supplier name
  receiptUrl: String,                       // URL to receipt image
  notes: String,                            // Additional notes
  gymId: ObjectId,                          // Reference to Gym
  createdBy: ObjectId,                      // User who created
  approvalStatus: String,                   // pending, approved, rejected
  approvedBy: ObjectId,                     // User who approved/rejected
  approvalNotes: String,                    // Approval/rejection notes
  approvedAt: Date,                         // Timestamp of approval
  isDeleted: Boolean                        // Soft delete flag
}
```

### Revenue
```javascript
{
  amount: Number,                           // Revenue amount
  source: String,                           // membership, pos_sale, personal_training, merchandise, classes, other
  description: String,                      // Revenue description
  revenueDate: Date,                        // Date of revenue
  notes: String,                            // Additional notes
  gymId: ObjectId,                          // Reference to Gym
  paymentId: ObjectId,                      // Optional link to Payment
  memberId: ObjectId,                       // Optional link to Member
  createdBy: ObjectId,                      // User who created
  isDeleted: Boolean                        // Soft delete flag
}
```

---

## Frontend Pages

### Expenses (`/expenses`)
- **Statistics Cards**: Total expenses, pending approvals, category count
- **Advanced Filters**: Search, category, status, date range
- **Expense Table**: Sortable, with inline actions
- **Create/Edit Modal**: Full expense form
- **Category Manager**: Create custom categories
- **Approval Modal**: Approve/reject with notes

### Revenue (`/revenue`)
- **Statistics Cards**: Total revenue, breakdown by source
- **Filters**: Source type, date range, search
- **Revenue Table**: All revenue entries
- **Create/Edit Modal**: Revenue entry form

### Financial Reports (`/financial-reports`)
- **P&L Summary**: Income, expenses, profit, margin
- **Trend Chart**: Revenue vs Expenses (bar chart)
- **Category Breakdown**: Pie chart and detailed list
- **Period Selector**: Daily/weekly/monthly grouping

---

## Feature Toggle

The Expense & Revenue Manager is controlled by the `financial` feature flag in the Gym model:

```javascript
{
  features: {
    financial: { type: Boolean, default: true }
  }
}
```

To disable for a specific gym:
```javascript
// Update gym settings
await Gym.findByIdAndUpdate(gymId, {
  'features.financial': false
});
```

---

## Multi-Tenant Architecture

All financial data is **gym-scoped**:
- Expenses, categories, and revenue are isolated per gym
- Super admins can view all gyms' data
- Gym owners only see their own gym's data
- Middleware (`enforceGymScope`) ensures data isolation

---

## Usage Examples

### Create an Expense
```javascript
const expense = await Expense.create({
  amount: 1500,
  categoryId: equipmentCategoryId,
  description: "New treadmill",
  expenseDate: new Date(),
  paymentMethod: "card",
  vendor: "Fitness Equipment Co",
  gymId: req.gymId,
  createdBy: req.user._id,
  approvalStatus: "pending"
});
```

### Approve an Expense
```javascript
const expense = await Expense.findByIdAndUpdate(expenseId, {
  approvalStatus: "approved",
  approvedBy: req.user._id,
  approvedAt: new Date(),
  approvalNotes: "Approved for Q4 budget"
}, { new: true });
```

### Generate P&L Report
```javascript
const report = await financialReportService.getProfitLoss({
  startDate: "2025-01-01",
  endDate: "2025-01-31",
  period: "monthly"
});

console.log(report.summary);
// {
//   totalIncome: 50000,
//   totalExpenses: 30000,
//   netProfit: 20000,
//   profitMargin: 40
// }
```

---

## Best Practices

### For Gym Owners
1. **Create meaningful categories** with clear icons for easy identification
2. **Set up approval workflow** - require approval for expenses above a threshold
3. **Regular review** - Check pending approvals daily or weekly
4. **Export data** - Download monthly reports for accounting software
5. **Track all revenue sources** - Not just memberships, include all income streams

### For Developers
1. **Always use soft delete** - Never permanently delete financial data
2. **Validate amounts** - Ensure positive numbers and proper decimal handling
3. **Audit trail** - Log all approvals/rejections with user and timestamp
4. **Test multi-tenant** - Verify gym data isolation in all queries
5. **Handle timezone** - Store dates in UTC, display in user's timezone

---

## Testing

### Manual Testing Checklist
- [ ] Create expense category with custom icon
- [ ] Create expense and verify "pending" status
- [ ] Approve expense and verify approval data
- [ ] Reject expense with notes
- [ ] Filter expenses by category, status, date
- [ ] Export expenses to CSV
- [ ] Create revenue from multiple sources
- [ ] View P&L report with charts
- [ ] Verify multi-tenant isolation
- [ ] Test feature toggle on/off

### API Testing (cURL examples in walkthrough.md)

---

## Future Enhancements

- [ ] Recurring expenses support
- [ ] Budget planning and alerts
- [ ] Receipt file upload with image preview
- [ ] Export reports to PDF
- [ ] Advanced analytics dashboard
- [ ] Expense forecasting
- [ ] Multi-currency support
- [ ] Integration with accounting software (QuickBooks, Xero)
- [ ] Automated expense rules
- [ ] Mobile app for expense photo capture

---

## Troubleshooting

### Expenses not appearing in P&L
- **Check approval status**: Only "approved" expenses are counted
- **Verify date range**: Ensure expense dates fall within report period
- **Check soft delete**: Make sure `isDeleted` is false

### Category cannot be deleted
- **In-use validation**: Categories with active expenses cannot be deleted
- Solution: Reassign expenses to different category first

### Permission denied errors
- **Check role**: Ensure user has `owner` or `super_admin` role
- **Verify feature toggle**: Confirm `financial` feature is enabled for the gym
- **Check gym scope**: Ensure user is accessing their own gym's data

---

## Related Documentation
- [Main README](./README.md) - Full application documentation
- [Feature Checklist](./FEATURE_CHECKLIST.md) - All features status
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Development roadmap
- [Walkthrough](../../.gemini/antigravity/brain/7cd3658d-8faf-4b18-bc6f-75dc4baea981/walkthrough.md) - Implementation details

---

## Support & Contribution

For issues, feature requests, or contributions related to the Expense & Revenue Manager, please follow the main project contribution guidelines.

**Version**: 1.0.0  
**Last Updated**: December 26, 2025  
**Status**: ✅ Production Ready
