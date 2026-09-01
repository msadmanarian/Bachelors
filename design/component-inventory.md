# Component Inventory — Bachelors' Meal Manager

This inventory defines all reusable UI components built for the application.

| Component | File Path | Props / Responsibilities |
|---|---|---|
| `Navbar` | `src/components/layout/Navbar.tsx` | Top application bar with house name, month navigator, theme toggle, and language selector. |
| `Sidebar` / `BottomNav` | `src/components/layout/Navigation.tsx` | Responsive navigation with active tab indicators and badge counts. |
| `StatCard` | `src/components/ui/StatCard.tsx` | KPI display card with title, large numerical value, subtle subtext, icon, and trend indicator. |
| `MealStepper` | `src/components/meals/MealStepper.tsx` | 0.5-step increment/decrement touch control with manual input fallback. |
| `MealGridTable` | `src/components/meals/MealGridTable.tsx` | High-performance horizontal-scrolling sticky-header monthly matrix table. |
| `ExpenseCard` | `src/components/expenses/ExpenseCard.tsx` | Item card displaying category icon, buyer, date, amount, and actions. |
| `ExpenseModal` | `src/components/expenses/ExpenseModal.tsx` | Modal form for creating/editing bazar and utility expenses with validation. |
| `DepositModal` | `src/components/deposits/DepositModal.tsx` | Modal form for recording member payments and deposits. |
| `MemberModal` | `src/components/members/MemberModal.tsx` | Add/edit member profile modal. |
| `MemberCard` | `src/components/members/MemberCard.tsx` | Member card with balance badge, quick stats, and navigation to member detail. |
| `HisabReportTable` | `src/components/reports/HisabReportTable.tsx` | Full monthly settlement table with per-member costs, deposits, and balances. |
| `Modal` | `src/components/ui/Modal.tsx` | Accessible dialog backdrop and container with escape key & click-outside support. |
| `ConfirmDialog` | `src/components/ui/ConfirmDialog.tsx` | Safety confirmation for destructive actions (delete, trash, reset). |
| `Toast` / `Snackbar` | `src/components/ui/Toast.tsx` | Non-intrusive feedback notifications for save/delete/copy actions. |
| `EmptyState` | `src/components/ui/EmptyState.tsx` | Friendly visual empty state illustration, title, description, and action button. |
| `Badge` | `src/components/ui/Badge.tsx` | Status pills (`In Credit`, `Due`, `Settled`, `Manager`, `Member`). |
