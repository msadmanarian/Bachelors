# Reference Workflows — Bachelors' Meal Manager

This document defines the primary user journeys and operational workflows identified from the reference application and real-world bachelor mess routines in Bangladesh and shared living households.

---

## 1. Initial Setup Workflow (New House / Mess)
```mermaid
graph TD
    A[Launch App] --> B[Default Mess Created / Custom Setup]
    B --> C[Configure Mess Profile: Name, Currency ৳, Pricing Mode]
    C --> D[Add Members: Name, Phone, Role Manager/Member]
    D --> E[Select Active Month: e.g., September 2026]
    E --> F[Ready for Daily Operations]
```

---

## 2. Daily Meal Logging Workflow (The Core Routine)
```mermaid
graph TD
    A[Open App] --> B[Navigate to Meal Entry / Quick Log]
    B --> C[Select Target Date: Default Today]
    C --> D{Entry Method}
    D -->|Quick 1-Click| E[Apply 1 Meal to All Active Members]
    D -->|Copy Previous| F[Copy Previous Day's Counts]
    D -->|Custom Adjust| G[Adjust B/L/D Counters per Member (+/- 0.5 step)]
    E --> H[Verify Daily Sum]
    F --> H
    G --> H
    H --> I[Save Meal Entries -> Persistent DB & Live Recalculation]
```

---

## 3. Bazar / Grocery & Utility Expense Workflow
```mermaid
graph TD
    A[Manager or Member makes a purchase] --> B[Open Bazar & Expenses Screen]
    B --> C[Click 'Add Expense']
    C --> D[Select Buyer / Payer from Member List]
    D --> E[Enter Amount e.g. ৳1,450]
    E --> F[Select Category: Grocery, Gas, Electric, Wifi, Maid, Feast]
    F --> G{Expense Nature}
    G -->|Meal Bazar| H[Added to Total Meal Cost for Meal Rate]
    G -->|Shared Utility| I[Split Equally / Per Member Charges]
    G -->|Special Feast| J[Split only among participating attendees]
    H --> K[Save Record -> Instant Meal Rate & Balance Update]
    I --> K
    J --> K
```

---

## 4. Member Deposit / Payment Collection Workflow
```mermaid
graph TD
    A[Member pays advance cash or via bKash/Nagad] --> B[Open Deposits Screen]
    B --> C[Click 'Add Deposit']
    C --> D[Select Member]
    D --> E[Enter Amount e.g. ৳3,000]
    E --> F[Select Payment Method: Cash, bKash, Nagad, Rocket, Bank]
    F --> G[Enter Date and Transaction Note]
    G --> H[Save Deposit -> Member Credit increases, Cash-in-Hand updates]
```

---

## 5. Month-End Settlement & Reconciliation (Hisab Day)
```mermaid
graph TD
    A[End of Accounting Month] --> B[Open Monthly Hisab Report]
    B --> C[Calculation Engine Computes:]
    C --> C1[Total Meals for Month]
    C --> C2[Total Bazar Cost -> Meal Rate = Total Bazar / Total Meals]
    C --> C3[Per-Member Meal Cost = Member Meals × Meal Rate]
    C --> C4[Per-Member Other Charges = Utility Share + Feast Share]
    C --> C5[Net Balance = Member Total Deposits - Member Total Costs]
    C5 --> D{Balance Status}
    D -->|Balance > 0| E[Refundable / In Credit: Mess owes Member]
    D -->|Balance < 0| F[Due / Payable: Member owes Mess]
    D -->|Balance = 0| G[Settled]
    E --> H[Export PDF Report / Share on Group Chat]
    F --> H
    G --> H
    H --> I[Archive / Open Next Month]
```

---

## 6. Data Protection & Backup Workflow
```mermaid
graph TD
    A[Settings Screen] --> B[Click 'Export Backup']
    B --> C[App serializes complete relational database into JSON schema v1]
    C --> D[Download backup file timestamped e.g. bachelors_backup_2026_09_01.json]
    D --> E[Restore Flow: User uploads JSON -> Validates Schema -> Pre-flight confirmation -> Safe atomic restore]
```
