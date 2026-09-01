# Navigation Map — Bachelors' Meal Manager

This document maps the complete information architecture, routing, bottom navigation tabs, and modal interaction flows.

---

## 1. Top-Level Hierarchy

```text
App Root
│
├── Top Bar
│   ├── House Name & Month Selector
│   ├── Language Toggle (EN / বাং)
│   └── Theme Switcher (Dark / Light)
│
├── Primary Views (Bottom / Sidebar Navigation)
│   ├── [1] Dashboard (/dashboard)
│   │   ├── Summary KPIs
│   │   ├── Member Balances Carousel
│   │   └── Quick Actions
│   │
│   ├── [2] Meals (/meals)
│   │   ├── Daily Entry Subtab (/meals/daily)
│   │   └── Monthly Grid Subtab (/meals/grid)
│   │
│   ├── [3] Expenses (/expenses)
│   │   ├── Bazar (Meal Expenses)
│   │   ├── Shared Utilities & Bills
│   │   └── Add/Edit Expense Modal
│   │
│   ├── [4] Deposits (/deposits)
│   │   ├── Member Deposit Records
│   │   └── Add/Edit Deposit Modal
│   │
│   ├── [5] Members (/members)
│   │   ├── Member Directory
│   │   ├── Add/Edit Member Modal
│   │   └── Member Profile / Statement Voucher (/members/:id)
│   │
│   ├── [6] Reports & Hisab (/reports)
│   │   ├── Group Monthly Reconciliation Statement
│   │   ├── Individual Hisab Breakdown
│   │   ├── Export to PDF / CSV
│   │   └── Share to WhatsApp Format
│   │
│   ├── [7] Analytics (/analytics)
│   │   ├── Expense Distribution Charts
│   │   └── Meal Trends
│   │
│   ├── [8] Trash Bin (/trash)
│   │   └── Soft-Delete Recovery (Meals, Expenses, Deposits)
│   │
│   └── [9] Settings (/settings)
│       ├── House & Currency Configuration
│       ├── Pricing Mode Toggle
│       ├── Backup & Restore (JSON)
│       └── Demo Data Generator / Reset
```

---

## 2. Modal & Quick Flow Overlays
- **Quick Meal Dialog**: Accessible from Dashboard FAB.
- **Add Bazar Dialog**: Accessible from Dashboard & Expense Tab.
- **Add Deposit Dialog**: Accessible from Dashboard & Deposits Tab.
- **Cell Edit Popover**: Inline on the Meal Grid matrix.
- **Confirmation Dialog**: Triggered for destructive/restore/reset actions.
