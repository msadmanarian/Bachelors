# Screen Specifications — Bachelors' Meal Manager

Detailed layout, state, actions, and UI specifications for every screen in the application.

---

## 1. Screen: Dashboard (`SCR-01`)
- **Route / View**: `/dashboard`
- **Top Bar**: Active Mess Name badge, Month Switcher (`< September 2026 >`), Language Switcher, Theme Switcher.
- **Header KPI Cards**:
  1. **Total Meals**: Formatted count (e.g. `142.5 meals`) with icon and breakdown (B: 42.5, L: 50, D: 50).
  2. **Total Bazar Cost**: Formatted currency (e.g. `৳ 5,700.00`).
  3. **Current Meal Rate**: Big bold highlight (e.g. `৳ 40.00 / meal`).
  4. **Fund / Cash-in-Hand**: Difference between Total Deposits (`৳ 8,000.00`) and Total Expenses (`৳ 6,200.00`) = `+৳ 1,800.00`.
- **Quick Actions Bar**:
  - `[+ Log Today's Meals]`
  - `[+ Add Bazar Expense]`
  - `[+ Record Deposit]`
  - `[📊 View Hisab Statement]`
- **Member Balances Summary Carousel/List**:
  - Card for each active member showing: Avatar, Name, Total Meals, Total Cost, Total Paid, and Net Status Badge (`+৳ 450 In Credit` or `-৳ 250 Due`).
- **Recent Activity Feed**:
  - Last 5 bazar/deposit entries with quick edit/delete actions.
- **Empty State**: Friendly invitation to add members and log the first meal.

---

## 2. Screen: Daily Meal Entry (`SCR-02`)
- **Route / View**: `/meals/daily`
- **Controls**:
  - Date Selector with Previous/Next day buttons and "Today" shortcut button.
  - Action Chips: `[Set 1 to All (L+D)]`, `[Set All Off (0)]`, `[Copy from Yesterday]`.
- **Member Meal List / Cards**:
  - Each member card displays:
    - Member Name & Avatar.
    - Breakfast Stepper: `[-] [ 0.5 ] [+]` (Step = 0.5, Min = 0, Max = 10).
    - Lunch Stepper: `[-] [ 1.0 ] [+]` (Step = 0.5, Min = 0, Max = 10).
    - Dinner Stepper: `[-] [ 1.0 ] [+]` (Step = 0.5, Min = 0, Max = 10).
    - Daily Total for Member: `2.5 meals`.
- **Footer Summary Bar**:
  - Sticky bottom bar with Day Total (e.g., `Today Total: 15.5 meals`), `Save Entries` button with instant visual feedback toast.

---

## 3. Screen: Monthly Meal Grid (`SCR-03`)
- **Route / View**: `/meals/grid`
- **Controls**:
  - Month Picker, Filter by Member, View Mode toggle (Full B/L/D sub-columns vs Daily Total per day).
- **Matrix Table Design**:
  - Fixed leftmost column: Member Name & Total Meals for Month.
  - Scrollable columns: Days `1, 2, 3, ... 31` with Day of Week indicator (Fri, Sat, Sun...).
  - Interactive Cells: Click cell to open quick inline popover editor to tweak B/L/D counts.
  - Sticky bottom footer row: Daily sum per day across all members.
  - Summary Column on right: Grand Monthly Total.

---

## 4. Screen: Bazar & Expenses Management (`SCR-04` & `SCR-05`)
- **Route / View**: `/expenses`
- **Header**:
  - Month summary (`Total Bazar: ৳ 5,700 | Utilities: ৳ 1,200 | Total: ৳ 6,900`).
  - Category Filter Tabs: `All`, `Bazar (Meal)`, `Utilities`, `Feast / Special`.
  - Search input for item description/buyer name.
- **List Items**:
  - Card with: Date, Category badge, Title/Item descriptions (e.g., "Chicken 2kg, Rice 5kg, Oil"), Buyer/Paid By avatar + name, Amount in bold.
  - Action buttons: Edit, Soft-delete to Trash.
- **Add / Edit Modal (`SCR-05`)**:
  - Fields: Title, Amount, Date, Category (Grocery, Gas, Electricity, WiFi, Rent, Cook, Other), Buyer (Member dropdown), Expense Type (Meal Bazar vs Utility vs Feast), Note/Receipt.

---

## 5. Screen: Deposits & Fund (`SCR-06` & `SCR-07`)
- **Route / View**: `/deposits`
- **Header**:
  - Total Collected counter, Member collection status.
- **List Items**:
  - Transaction card with Date, Member Name, Amount, Payment Method pill (Cash, bKash, Nagad, Rocket, Bank), Transaction Note.
- **Add / Edit Modal (`SCR-07`)**:
  - Member selector, Amount, Date, Method, TrxID / Note.

---

## 6. Screen: Member Management (`SCR-08` & `SCR-09`)
- **Route / View**: `/members`
- **Header**: Active Members count, Add Member CTA.
- **Member Cards**:
  - Avatar with initial, Name, Phone Number, Role badge (Manager, Member), Join Date, Active/Inactive switch.
  - Click card $\rightarrow$ Opens Member Profile & Full Statement (`SCR-09`) with monthly breakdown, personal meal list, deposit receipts, and balance voucher.

---

## 7. Screen: Monthly Hisab & Report Statement (`SCR-10`)
- **Route / View**: `/reports`
- **Reconciliation Table**:
  - Columns: `#`, `Member Name`, `Total Meals`, `Meal Cost (৳)`, `Utility Share (৳)`, `Total Cost (৳)`, `Deposits (৳)`, `Balance (৳)`, `Status`.
- **Summary Cards**:
  - `Meal Rate = Total Bazar / Total Meals` explainer box.
  - Total Group Expenses vs Total Collected Deposits check.
- **Export Toolbar**:
  - `[📥 Export Clean PDF Report]` (Print-ready beautiful hisab sheet with header and signatures).
  - `[📊 Export CSV Dataset]`.
  - `[💬 Copy WhatsApp Summary Text]` (Formatted markdown table ready to paste directly into bachelor mess WhatsApp/Messenger group!).

---

## 8. Screen: Analytics & Visual Trends (`SCR-11`)
- **Route / View**: `/analytics`
- **Charts**:
  1. Expense Distribution Donut Chart (Bazar vs Utilities vs Rent vs Others).
  2. Daily Meal Trend Line/Bar Chart (Daily meal consumption across the month).
  3. Member Consumption vs Payment comparative bar chart.

---

## 9. Screen: Trash Bin / Soft Delete Recovery (`SCR-12`)
- **Route / View**: `/trash`
- **Tabs**: `Deleted Meals`, `Deleted Bazar`, `Deleted Deposits`.
- **Actions**:
  - `Restore` (Instantly restores item back into calculations).
  - `Permanently Delete`.
  - `Empty Trash Bin`.

---

## 10. Screen: Settings & House Config (`SCR-13`)
- **Route / View**: `/settings`
- **Sections**:
  - **House Profile**: Edit House Name, Currency (`৳` BDT, `$`, `₹`), House Code.
  - **Accounting Rules**: Pricing Mode (Calculated Dynamic Rate vs Fixed Rate ৳/meal).
  - **Language & Region**: English vs Bengali (বাংলা).
  - **Theme**: Dark Mode vs Light Mode.
  - **Data Management**:
    - `[💾 Export Complete Backup (JSON)]`
    - `[📂 Restore from Backup File]`
    - `[🧪 Load Demo Bachelor Mess Data]` (For instant testing and walkthrough)
    - `[⚠️ Reset All Data / Fresh Start]`
