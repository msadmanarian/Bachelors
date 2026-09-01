# Architecture Documentation — Bachelors' Meal Manager

This document describes the high-level architecture, layer separation, data flow, and design patterns implemented in the application.

---

## 1. Architectural Overview

The application is structured following clean, layered architectural principles:

```text
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                      │
│   React Components (Pages, Steppers, Grids, Modals, Forms)  │
│   Responsive CSS Design System (Light & Dark Theme Variables)│
└──────────────────────────────┬──────────────────────────────┘
                               │ (hooks / context / state)
┌──────────────────────────────▼──────────────────────────────┐
│                    APPLICATION / USE CASES                  │
│   House Context, Member State, Filter State, i18n Engine    │
└──────────────────────────────┬──────────────────────────────┘
                               │ (pure functions & repos)
┌──────────────────────────────▼──────────────────────────────┐
│                     DOMAIN CALCULATION ENGINE               │
│   Pure Deterministic Meal Accounting (Meal Rate, Balances)   │
│   Form Validations, Period Boundary Handlers, Reconciler    │
└──────────────────────────────┬──────────────────────────────┘
                               │ (data access interfaces)
┌──────────────────────────────▼──────────────────────────────┐
│                     DATA & PERSISTENCE LAYER                │
│   Dexie.js / IndexedDB Relational Database Schema v1         │
│   Repository Methods, Transactions, Soft-Delete Filters     │
│   JSON Backup / Restore Engine with Schema Validation       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```text
src/
├── domain/                  # Pure domain calculations & types
│   ├── types.ts             # Core data contracts & models
│   ├── calculations.ts      # Pure meal rate & balance engine
│   └── validation.ts        # Input validation logic
├── database/                # Persistence layer
│   ├── db.ts                # Dexie.js database definition & tables
│   ├── repositories.ts      # CRUD & query methods with transactions
│   └── seed.ts              # Demo sample dataset for instant testing
├── i18n/                    # Localization layer
│   ├── en.ts                # English string dictionary
│   ├── bn.ts                # Bengali (বাংলা) string dictionary
│   └── index.ts             # i18n hook and formatters
├── components/              # UI components
│   ├── ui/                  # Reusable primitives (Card, Modal, Badge, Toast, Button)
│   ├── layout/              # Top Navbar, Sidebar, Bottom Navigation
│   ├── dashboard/           # Summary cards, balances carousel, recent feeds
│   ├── meals/               # Daily meal stepper, Monthly matrix grid table
│   ├── expenses/            # Bazar list, category filters, expense modal
│   ├── deposits/            # Deposit list, payment modal
│   ├── members/             # Member cards, detail voucher, member modal
│   ├── reports/             # Hisab summary sheet, PDF/CSV/WhatsApp exporter
│   ├── analytics/           # Expense and meal charts
│   ├── trash/               # Soft-delete restore and permanent removal
│   └── settings/            # Mess settings, backup/restore, reset
├── styles/                  # Design system
│   ├── globals.css          # CSS tokens, theme variables, reset
│   └── components.css       # Layouts, cards, table styling, animations
├── App.tsx                  # Main app shell & routing
└── main.tsx                 # Application entry point
```

---

## 3. Offline-First Guarantee
1. All changes are committed immediately to the local browser IndexedDB via Dexie.js.
2. The user experience is 100% offline; no network roundtrip is required for any operation.
3. Full state survives app/tab closures and device reboots.
