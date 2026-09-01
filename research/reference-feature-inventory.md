# Reference Feature Inventory — Bachelors' Meal Manager

Reference Application: **Bachelors' Meal Manager**  
Developer/Publisher: **Red Z Apps**  
Package: `com.redzapps.bachelormealmanager`  
Platform: Android / Cross-platform  

| ID | Feature | Reference Evidence | Required | Priority | Implementation Strategy & Notes |
|---|---|---|---|---|---|
| F001 | House / Mess Management | Confirmed from reference (Store listing, APKPure) | Yes | P0 | Support creating/editing mess details, unique House ID, currency symbol, and pricing model mode. |
| F002 | Member Management | Confirmed from reference | Yes | P0 | Add, edit, archive, remove members with contact details, join dates, and roles (Manager, Member). |
| F003 | Daily Meal Entry (B/L/D) | Confirmed from reference | Yes | P0 | Log Breakfast, Lunch, Dinner per member with quick increment, half-meal support (0.5), and bulk date copy. |
| F004 | Monthly Meal Grid / Table | Confirmed from reference (Pinned table) | Yes | P0 | Responsive matrix view of all members × days of month with sticky columns/headers and real-time sums. |
| F005 | Bazar / Grocery Tracking | Confirmed from reference | Yes | P0 | Record grocery purchases with date, amount, buyer/payer, item list, notes, categorized as meal expense. |
| F006 | Shared / Utility Expense Tracking | Confirmed from reference | Yes | P0 | Log rent, gas, electricity, wifi, maid bills split equally or per individual share. |
| F007 | Member Deposits / Payments | Confirmed from reference | Yes | P0 | Record advance deposits to mess fund with payment methods (Cash, bKash, Nagad, Rocket, Bank). |
| F008 | Meal Rate Calculation Engine | Confirmed from reference | Yes | P0 | Deterministic engine: Total Meal Expense / Total Meals, with precision rounding and audit breakdown. |
| F009 | Member Balance & Settlement | Confirmed from reference | Yes | P0 | Calculate exact individual meal costs, common costs, deposits, and net balance (Receivable / Due / Settled). |
| F010 | Multi-Month Accounting Periods | Confirmed from reference | Yes | P0 | Month switcher, open/close periods, historical archive without mixing period data. |
| F011 | Dashboard & Cash-in-Hand | Confirmed from reference | Yes | P0 | Overview cards for Total Meals, Total Bazar, Meal Rate, Fund Balance (Cash in hand), Member status pills. |
| F012 | Monthly Statement & Member Hisab Reports | Confirmed from reference | Yes | P1 | Comprehensive printable/exportable hisab sheet and individual member summary vouchers. |
| F013 | PDF & CSV Export | Confirmed from reference | Yes | P1 | Download formatted PDF reports and CSV datasets for offline sharing and WhatsApp distribution. |
| F014 | Expense & Meal Analytics | Confirmed from reference | Yes | P1 | Category breakdown visual charts (Pie & Bar charts) for expense distribution and daily meal trends. |
| F015 | Trash Bin / Soft Delete Recovery | Confirmed from reference | Yes | P1 | Recover mistakenly deleted meal entries, bazar records, or deposits with permanent delete options. |
| F016 | Dual Pricing Modes | Confirmed from reference | Yes | P1 | Support "Calculated Mode" (dynamic rate) and "Fixed Meal Rate" mode. |
| F017 | Feast / Special Meal Split | Confirmed from reference | Yes | P1 | Separate feast/event expense split among specific participating members. |
| F018 | Role Permissions & No-Manager Mode | Confirmed from reference | Yes | P1 | Support manager controls and shared "no-manager" cooperative mess access. |
| F019 | Offline Persistence & Local Storage | Confirmed from reference | Yes | P0 | Reliable IndexedDB / SQLite relational local storage; 100% functional without internet. |
| F020 | Backup & Restore (JSON) | Confirmed from reference | Yes | P1 | Full schema-versioned export and import with validation, duplicate detection, and pre-restore checks. |
| F021 | Bilingual Localization (English & Bangla) | Confirmed from reference | Yes | P1 | Complete language toggle for English and Bengali (বাংলা) with standard bachelor mess terminology. |
| F022 | Dark & Light Theme System | Confirmed from reference / Required | Yes | P1 | High-contrast modern dark mode and clean daylight theme with persistent user preference. |
