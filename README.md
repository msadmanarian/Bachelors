# Bachelors' Meal Manager 🍲📊

A comprehensive, production-ready, locally persistent meal, bazar, deposit, and hisab management application designed for bachelor messes, student hostels, and shared living households.

Based on the functional reference and UX workflows of **Bachelors' Meal Manager by Red Z Apps** (`com.redzapps.bachelormealmanager`), independently developed with high precision and modern web engineering.

---

## 🌟 Key Features

1. **Dashboard Overview**:
   - Live KPI cards: Total Meals, Total Bazar Cost, Meal Rate, Fund Balance / Cash-in-Hand, and Total Collected Deposits.
   - Member Balances summary with real-time status badges (`In Credit`, `Due`, `Settled`).
   - Recent grocery and shared expenses feed.
   - Quick action launcher for one-click workflows.

2. **Daily Meal Entry**:
   - Fast Breakfast, Lunch, Dinner, and Extra stepper controls (supports `0.5` half-meal steps).
   - Instant bulk helpers: `[Set 1 to All (L+D)]`, `[Copy from Yesterday]`, `[Set All Off (0)]`.
   - Real-time daily sum calculations.

3. **Monthly Meal Grid / Spreadsheet Sheet**:
   - High-performance matrix view displaying all 31 days of the month across all members.
   - Sticky pinned member names and header rows.
   - Interactive popover editor: tap any cell to update meal counts instantly.
   - Live column and row totals.

4. **Bazar & Shared Expenses**:
   - Segregation between **Meal Bazar** (which contributes to the Meal Rate), **Shared Utilities** (Gas, Internet, Electricity, House Rent, Maid Salary), and **Special Feasts**.
   - Filter by expense category and search by description or buyer.
   - Soft-delete protection (moved to Trash Bin instead of permanent loss).

5. **Deposits & Fund Management**:
   - Track member payments with payment method tagging (Cash, bKash, Nagad, Rocket, Bank).
   - Store transaction IDs (TrxID) and notes.

6. **Deterministic Meal Accounting Engine**:
   - Automatic dynamic rate calculation: $\text{Meal Rate} = \frac{\text{Total Meal Bazar Expense}}{\text{Total Meals}}$.
   - Configurable **Fixed Meal Rate** mode for messes with fixed meal pricing.
   - Exact per-member cost computation: $\text{Meal Cost} + \text{Utility Share} + \text{Feast Share}$.
   - Guaranteed reconciliation invariant: $\sum \text{Member Net Balances} = \text{Fund Cash in Hand}$.

7. **Monthly Hisab & Report Generation**:
   - Full reconciliation master statement.
   - **Download PDF Report**: Formatted, printable high-resolution statement with manager and member verification signoffs.
   - **Download CSV**: Spreadsheet dataset export.
   - **Copy for WhatsApp / Messenger**: Pre-formatted text with emojis and individual breakdowns ready to paste into group chats.

8. **Visual Analytics**:
   - Expense breakdown by category.
   - Member meal consumption share progress bars.

9. **Trash Bin / Soft-Delete Recovery**:
   - 1-click restore for deleted meals, bazar expenses, and deposits.
   - Permanent deletion and empty trash capabilities.

10. **Settings, Bilingual Localization & Theme**:
    - **Language Toggle**: Instant switch between English and Bengali (বাংলা) with standard bachelor mess terminology.
    - **Dark & Light Modes**: High-contrast modern dark theme and clean daylight mode.
    - **JSON Backup & Restore**: Full database export and import with schema validation.
    - **Sample Demo Data**: Instant dataset loader for Rahim, Tanvir, Karim, Sakib, and Ashik.

---

## 🚀 Quick Start & Commands

### Prerequisites
- Node.js version 18+ (tested on Node v24.18.0)
- npm version 9+ (tested on npm 11.2.0)

### Installation
```bash
# Clone or navigate to the directory
cd "G:\VIDEOS\Bachelors App"

# Install dependencies
npm install
```

### Running Locally (Development Server)
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Running Automated Unit Tests
```bash
npm run test
```
All unit tests for the calculation engine and input validators run via Vitest.

### Building for Production
```bash
npm run build
```
Generates production-optimized distribution files inside the `dist/` directory.

### Previewing Production Build
```bash
npm run preview
```

---

## 📁 Project Architecture & Directory Structure

```text
G:\VIDEOS\Bachelors App\
│
├── BachelorsMaking.md              # Master construction specification
├── README.md                       # Main user & developer guide
├── package.json                    # Project dependencies and build scripts
├── vite.config.ts                  # Vite bundler configuration
├── tsconfig.json                   # TypeScript compiler options
│
├── docs/                           # Engineering and release documentation
│   ├── architecture.md             # System layers and data flow
│   ├── database.md                 # Dexie / IndexedDB ER diagram & schema
│   ├── calculations.md             # Pure calculation engine formulas
│   ├── backup-restore.md           # JSON schema v1 backup specifications
│   ├── testing.md                  # Automated & manual QA procedures
│   ├── release.md                  # Build and distribution commands
│   └── final-verification.md       # Final requirement verification report
│
├── research/                       # Product research on reference app
│   ├── reference-feature-inventory.md
│   ├── reference-screen-inventory.md
│   ├── reference-workflows.md
│   ├── reference-calculations.md
│   ├── reference-assets.md
│   └── open-questions.md
│
├── design/                         # UI/UX design specifications
│   ├── screen-specifications.md
│   ├── navigation-map.md
│   ├── design-system.md
│   ├── component-inventory.md
│   └── assets-inventory.md
│
├── src/
│   ├── domain/                     # Pure domain calculation engine & types
│   │   ├── types.ts                # TypeScript contracts & data interfaces
│   │   ├── calculations.ts         # Deterministic meal rate & balance engine
│   │   └── validation.ts           # Form input validators
│   │
│   ├── database/                   # Relational offline database
│   │   ├── db.ts                   # Dexie.js IndexedDB schema v1
│   │   ├── repositories.ts         # Atomic transactional repository methods
│   │   └── seed.ts                 # Demo dataset for instant testing
│   │
│   ├── i18n/                       # Localization dictionaries
│   │   ├── en.ts                   # English translation dictionary
│   │   ├── bn.ts                   # Bengali (বাংলা) translation dictionary
│   │   └── index.tsx               # i18n context & formatters
│   │
│   ├── components/                 # Reusable UI component modules
│   │   ├── layout/                 # Top Navbar & Navigation sidebar/bottom bar
│   │   ├── dashboard/              # Dashboard overview & summary cards
│   │   ├── meals/                  # Daily meal steppers & monthly grid table
│   │   ├── expenses/               # Bazar list & expense modal
│   │   ├── deposits/               # Member deposits list & deposit modal
│   │   ├── members/                # Member cards, modal & voucher view
│   │   ├── reports/                # Hisab statement table & PDF/CSV/WhatsApp export
│   │   ├── analytics/              # Category and consumption trend charts
│   │   ├── trash/                  # Soft-delete recovery center
│   │   ├── settings/               # House settings, backup/restore & reset
│   │   └── ui/                     # Primitives (StatCard, Modal, Badge, Toast, Confirm)
│   │
│   ├── styles/                     # Design system CSS tokens & styles
│   │   ├── globals.css             # Theme variables & resets
│   │   └── components.css          # Layout, card, table, stepper styles
│   │
│   ├── App.tsx                     # Main application shell & tab routing
│   └── main.tsx                    # React DOM entry point
│
└── tests/                          # Automated Vitest test suites
    ├── calculations.test.ts        # Arithmetic, zero-safe, reconciliation tests
    └── validation.test.ts          # Input validation tests
```

---

## 🛡️ License & Attribution
Implemented as an independent, clean-room reimplementation based on the publicly observable workflows of **Bachelors' Meal Manager by Red Z Apps**.
