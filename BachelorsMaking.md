# Bachelors' Meal Manager — Antigravity Master Build Prompt

## 1. PROJECT COMMAND

You are an autonomous senior software engineer, UI/UX designer, product analyst, database architect, QA engineer, and release engineer.

Build a **full working application** based on the Android application:

**Bachelors' Meal Manager**  
Developer/Publisher: **Red Z Apps**  
Reference: https://play.google.com/store/apps/dev?id=7116460923876828118

## IMPORTANT

This is a **reference/reimplementation project**.

Your goal is to reproduce the *observable product experience and functionality* of the reference application as closely as possible while creating an original implementation.

- Study the publicly available reference app carefully.
- Reproduce its useful workflows, information architecture, interaction patterns, screen structure, and functionality.
- Do NOT copy copyrighted source code, proprietary assets, private data, trademarks, or developer-only materials.
- If an exact visual asset cannot legally or technically be reused, create an original equivalent with the same functional purpose.
- Do not claim ownership of the original application.
- Preserve the product's functional behavior where reasonably observable.
- Improve stability, validation, responsiveness, accessibility, and data safety where appropriate without unnecessarily changing the expected workflow.

---

# 2. WORKING DIRECTORY

Primary project directory:

`G:\VIDEOS\Bachelors App`

Create and maintain the complete application inside this directory.

The first deliverable must be:

`G:\VIDEOS\Bachelors App\BachelorsMaking.md`

This document is the master construction specification and must remain in the project root.

Do not scatter unrelated generated projects across the computer.

Use clear subdirectories such as:

```text
G:\VIDEOS\Bachelors App\
│
├── BachelorsMaking.md
├── README.md
├── docs\
├── research\
├── design\
├── src\
├── database\
├── assets\
├── tests\
├── scripts\
├── builds\
└── backups\
```

Adapt the structure to the chosen technology, but keep the project organized.

---

# 3. FIRST PHASE — INSPECT BEFORE BUILDING

Before writing significant application code, perform a structured investigation.

## 3.1 Reference application research

Inspect the Google Play listing and every publicly available piece of information about **Bachelors' Meal Manager**.

Research:

- App title
- Developer
- Description
- Screenshots
- Feature descriptions
- Visible UI
- Navigation
- Terminology
- User workflows
- Data concepts
- Meal calculation behavior
- Member management
- Expense management
- Meal-rate calculation
- Bazar/market behavior
- Reports
- Account/user behavior
- Settings
- Backup/restore behavior
- Notifications
- Login/signup if present
- Offline behavior
- Any cloud synchronization if observable
- Any export/share functionality
- Any special calculations
- Empty states
- Error states
- Confirmation dialogs
- Form validation
- Date handling
- Monthly/weekly summaries

Do not assume a feature exists merely because similar meal-management applications commonly have it.

Mark each feature as:

1. Confirmed from reference
2. Strongly inferred
3. Required for a complete meal-management product
4. Optional enhancement

---

# 4. CREATE A REFERENCE FEATURE INVENTORY

Create:

`research/reference-feature-inventory.md`

Use a table similar to:

| ID | Feature | Reference Evidence | Required | Priority | Notes |
|---|---|---|---|---|---|
| F001 | Dashboard | Screenshot/listing | Yes | Critical | ... |
| F002 | Member management | Observed | Yes | Critical | ... |
| F003 | Meal entry | Observed | Yes | Critical | ... |
| F004 | Bazar/expense | Observed | Yes | Critical | ... |
| F005 | Meal rate | Observed | Yes | Critical | ... |
| ... | ... | ... | ... | ... | ... |

Do not invent reference evidence.

---

# 5. CORE PRODUCT PURPOSE

The application is a **Bachelors' Meal Manager** for shared bachelor/mess living.

The system should help a group:

- Register members
- Manage a bachelor/mess group
- Record daily meals
- Record shared purchases
- Track individual expenses
- Calculate total meals
- Calculate total expenses
- Calculate meal rate
- Calculate each member's payable amount
- Track advances/payments
- Calculate balances
- View monthly summaries
- View reports
- Correct mistakes
- Preserve historical records
- Work reliably with local stored data
- Export/backup important data

The application must be practical for real-world use.

---

# 6. DATA MODEL

Design a robust relational data model.

At minimum investigate whether the following entities are needed:

```text
User
Mess/Household
Member
Month/AccountingPeriod
MealEntry
MealType
Expense
ExpenseCategory
BazarEntry
Payment
Settlement
Balance
Budget
Report
Notification
Backup
AppSetting
AuditLog
```

Do not blindly create unnecessary tables.

For every entity define:

- ID
- Relationships
- Required fields
- Optional fields
- Created time
- Updated time
- Soft-delete behavior where appropriate
- Validation rules

Use database constraints whenever possible.

---

# 7. MEAL ACCOUNTING ENGINE

Create a dedicated calculation layer.

Do not put complex financial calculations directly inside UI screens.

The calculation engine must be deterministic and testable.

Typical concepts to support where applicable:

```text
Total Meal
Total Bazar/Meal Expense
Total Other Expense
Total Cost
Meal Rate
Individual Meal Cost
Individual Other Expense
Advance/Payment
Final Payable
Final Receivable
Balance
```

A common meal-rate model is:

```text
Meal Rate = Total Meal-related Cost / Total Meals
```

and:

```text
Individual Meal Cost =
Individual Meals × Meal Rate
```

Then:

```text
Final Balance =
Individual Meal Cost
+ Individual Assigned Expenses
+ Individual Other Charges
- Individual Payments/Advance
```

However:

**Do not force this formula if the reference application uses a different accounting method.**

First determine the reference behavior.

---

# 8. ACCOUNTING SAFETY

Financial calculations must avoid floating-point errors where practical.

Prefer:

- Integer smallest currency unit, or
- Decimal/fixed precision

Example:

```text
BDT 125.50
```

should not become:

```text
125.499999999
```

Define rounding rules explicitly.

Use one consistent rounding policy throughout the application.

Show calculations transparently.

Example:

```text
Total Meals: 143
Total Meal Cost: ৳4,290
Meal Rate: ৳30.00

Rahim
Meals: 21
Meal Cost: ৳630
Other Expense: ৳150
Paid: ৳500
Balance: ৳280
```

---

# 9. MEMBER MANAGEMENT

Implement complete member management.

Potential operations:

- Add member
- Edit member
- Remove member
- Archive member
- Restore member
- View member profile
- View member history
- View current balance
- View monthly meals
- View monthly expenses
- View payment history

Required validation:

- Empty name
- Duplicate member
- Invalid phone number
- Invalid email if used
- Deleting a member with historical data
- Member joining date
- Member leaving date

Never silently destroy historical financial records.

Use archive/deactivation where appropriate.

---

# 10. DAILY MEAL ENTRY

Design a fast meal-entry workflow.

Support meal types discovered from the reference app.

Potential types:

```text
Breakfast
Lunch
Dinner
Extra/Special
```

But use the actual reference behavior if different.

Allow:

- Date selection
- Member selection
- Meal quantity
- Bulk entry
- Edit
- Delete
- Copy previous day
- Quick entry
- Daily total
- Monthly total

The UI should minimize repetitive typing.

---

# 11. MEAL GRID / TABLE

If the reference uses a grid/table-based meal system, reproduce that interaction pattern.

Example:

```text
Member      1   2   3   4   5   ...   Total
-----------------------------------------------
Rahim       2   1   2   0   3         21
Karim       1   2   1   2   2         24
Sakib       2   2   2   2   2         30
```

Make it:

- Scrollable
- Fast
- Editable
- Responsive
- Touch friendly
- Accurate
- Suitable for many members and many days

---

# 12. BAZAR / EXPENSE MANAGEMENT

Implement expense tracking according to the reference application.

Potential fields:

```text
Date
Description
Category
Amount
Buyer
Paid by
Shared/Individual
Notes
Receipt/photo if supported
```

Categories may include:

- Food
- Grocery
- Gas
- Electricity
- Internet
- Rent
- Cleaning
- Household
- Transportation
- Other

Use actual reference categories where available.

Support:

- Add
- Edit
- Delete
- Filter
- Search
- Date range
- Category filtering
- Member filtering
- Total calculation

---

# 13. PAYMENTS AND SETTLEMENT

If supported by the reference product, implement:

- Advance payment
- Payment record
- Payment date
- Amount
- Method
- Note
- Member
- Settlement
- Balance

Example:

```text
Rahim
Total Due: ৳3,500
Paid: ৳2,000
Remaining: ৳1,500
```

and:

```text
Karim
Total Due: ৳2,800
Paid: ৳3,200
Receivable: ৳400
```

Clearly distinguish:

- Payable
- Receivable
- Settled

---

# 14. DASHBOARD

Create a useful dashboard.

Possible cards:

```text
Current Month
--------------------------
Total Members
Total Meals
Total Expense
Meal Rate
Total Collected
Total Due
```

Also show:

- Recent meals
- Recent expenses
- Member balances
- Quick actions
- Current accounting period
- Warnings
- Missing data
- Pending settlements

Use the reference application's information hierarchy as the primary guide.

---

# 15. REPORTS

Build complete reporting.

At minimum investigate and implement appropriate reports for:

### Monthly report

```text
Month
Members
Total meals
Total expense
Meal rate
Individual costs
Payments
Balances
```

### Member report

```text
Member
Meals
Meal cost
Other expenses
Payments
Balance
```

### Expense report

```text
Date
Category
Amount
Paid by
```

### Settlement report

```text
Member
Due
Paid
Remaining
Status
```

Reports should support:

- Date range
- Month
- Member
- Category
- Search
- Sorting
- Export where appropriate

---

# 16. DATA STORAGE

The application must store data persistently.

Preferred architecture:

```text
UI
 ↓
ViewModel / State
 ↓
Service / Use Case
 ↓
Repository
 ↓
Local Database
```

Do not store critical application data only in UI state.

Choose an appropriate database based on the selected platform.

For Android, a local relational database such as SQLite/Room is appropriate.

For a cross-platform implementation, choose an equivalent reliable local database.

---

# 17. OFFLINE-FIRST DESIGN

The core application should work without internet unless a specific reference feature requires a network connection.

Users must be able to:

- Add meals offline
- Add expenses offline
- View records offline
- Calculate balances offline
- View reports offline

Network failure must not destroy entered data.

---

# 18. BACKUP AND RESTORE

Implement backup/restore if compatible with the reference workflow.

Backup should include all important user data.

Example:

```text
Backup
 ├── Members
 ├── Meals
 ├── Expenses
 ├── Payments
 ├── Accounting periods
 ├── Settings
 └── Metadata
```

Use a versioned backup format.

Example:

```json
{
  "schemaVersion": 1,
  "application": "Bachelors Meal Manager",
  "createdAt": "...",
  "data": {}
}
```

Validate backup files before importing.

Never overwrite existing data without confirmation.

Provide:

```text
Create Backup
Restore Backup
Export
Import
```

where appropriate.

---

# 19. UI REPLICATION

Study every visible reference screen.

For every screen document:

```text
Screen name
Purpose
Navigation entry
Top bar
Bottom navigation
Cards
Buttons
Icons
Typography
Spacing
Colors
Input fields
Dialogs
Lists
Tables
Empty states
Loading states
Error states
Success states
```

Create:

`design/screen-specifications.md`

For each screen include a structured specification.

---

# 20. VISUAL DESIGN

Reproduce the observable visual language of the reference app as closely as reasonably possible.

Pay attention to:

- Screen hierarchy
- Card shapes
- Corner radius
- Shadows
- Typography scale
- Icon sizes
- Padding
- Margins
- Button dimensions
- Form layout
- Navigation style
- Color relationships
- Background
- Divider usage
- List density
- Dialog style

Do not merely create a generic finance app.

The result should clearly feel like a faithful functional reimplementation of the reference experience.

---

# 21. RESPONSIVE UI

Support different screen sizes.

Test at minimum:

```text
Small phone
Normal phone
Large phone
Tablet
```

Prevent:

- Text clipping
- Button overlap
- Keyboard overflow
- Broken tables
- Horizontal overflow where avoidable
- Tiny tap targets
- Unusable dialogs

---

# 22. ACCESSIBILITY

Implement:

- Readable text
- Sufficient contrast
- Meaningful content descriptions
- Large touch targets
- Keyboard accessibility where relevant
- Clear validation messages
- Do not rely only on color to communicate status

---

# 23. NAVIGATION

Map the reference navigation before implementation.

Create:

`design/navigation-map.md`

Example structure:

```text
App
│
├── Dashboard
│
├── Meals
│   ├── Daily
│   ├── Monthly
│   └── History
│
├── Bazar / Expenses
│   ├── List
│   ├── Add
│   └── Categories
│
├── Members
│   ├── List
│   ├── Add
│   └── Profile
│
├── Reports
│
└── Settings
```

Replace this structure with the actual reference navigation after research.

---

# 24. STATE MANAGEMENT

Every screen must have explicit states:

```text
Initial
Loading
Loaded
Empty
Saving
Success
Validation Error
Database Error
Network Error
Unexpected Error
```

Do not leave screens stuck in loading states.

---

# 25. FORM VALIDATION

Validate all user input.

Examples:

```text
Name cannot be empty.
Amount must be greater than or equal to zero.
Meal quantity must be valid.
Date must be valid.
Duplicate entries must be handled.
```

Show friendly errors.

Avoid technical messages such as:

```text
SQLiteConstraintException
NullPointerException
```

to users.

---

# 26. DELETE SAFETY

For destructive operations:

```text
Delete Member?
Delete this meal entry?
Delete this expense?
Restore data?
Reset account?
```

Use confirmation where appropriate.

For historical accounting records, prefer soft deletion or audit history.

---

# 27. SEARCH / FILTER / SORT

Where applicable, implement:

- Search by member
- Search by expense description
- Filter by date
- Filter by month
- Filter by category
- Filter by member
- Sort by date
- Sort by amount

Filtering must not corrupt totals.

---

# 28. MONTH/ACCOUNTING PERIOD HANDLING

Create a reliable accounting-period model.

Handle:

- Current month
- Previous month
- Next month
- Month creation
- Month closing
- Historical months
- Member joining mid-month
- Member leaving mid-month

Never accidentally mix records from different accounting periods.

---

# 29. DATE AND TIME

Store dates consistently.

Avoid locale-related bugs.

Test:

- Month boundaries
- Year boundaries
- Leap years
- Time-zone changes
- Midnight entries

For meal accounting, date should normally represent the accounting day rather than an arbitrary timestamp.

---

# 30. DATA CONSISTENCY

Use transactions for multi-step accounting operations.

Example:

```text
Add expense
 ↓
Update monthly total
 ↓
Update member balance
```

Prefer deriving totals from source records instead of maintaining duplicated totals that can become inconsistent.

If cached totals are used, provide safe recalculation.

---

# 31. ARCHITECTURE

Use clean, maintainable architecture.

Recommended:

```text
Presentation
    ↓
Application / Use Cases
    ↓
Domain
    ↓
Data
```

Suggested components:

```text
UI
ViewModel
UseCase
Repository
Database
DAO
Mapper
Domain Model
Calculation Engine
Validation
Export/Import
```

Keep business rules independent of UI.

---

# 32. TECHNOLOGY SELECTION

Choose a stable modern technology stack suitable for the target platform.

If the reference application is Android and the requested deliverable is an Android app, strongly consider:

```text
Kotlin
Jetpack Compose or appropriate native Android UI
Room / SQLite
Android Architecture Components
Material design components where useful
```

If you choose another stack, document why.

Do not choose a technology simply because it is fashionable.

The application must be:

- Buildable
- Maintainable
- Testable
- Offline-capable
- Performant

---

# 33. PROJECT DOCUMENTATION

Create:

```text
README.md
docs/
├── architecture.md
├── database.md
├── calculations.md
├── ui.md
├── navigation.md
├── testing.md
├── backup-restore.md
└── release.md
```

Documentation must describe the actual implementation, not an imaginary future system.

---

# 34. DATABASE DOCUMENTATION

Create an ER diagram.

Document:

```text
Table
Columns
Primary keys
Foreign keys
Indexes
Constraints
Relationships
```

Include migration strategy.

Do not destroy production data during schema upgrades.

---

# 35. TESTING

Create automated tests for core logic.

At minimum test:

### Meal calculation

```text
0 meals
1 meal
multiple meals
different members
```

### Expense calculation

```text
zero expense
single expense
multiple expenses
```

### Meal rate

```text
total cost / total meals
zero meals
rounding
```

### Balance

```text
fully paid
partially paid
overpaid
zero balance
```

### Dates

```text
month start
month end
year change
leap year
```

### Data

```text
backup
restore
duplicate prevention
corrupt backup
```

---

# 36. MANUAL QA

Create a complete test checklist.

Example:

```text
[ ] App launches
[ ] New mess can be created
[ ] Member can be added
[ ] Member can be edited
[ ] Meal can be added
[ ] Meal can be edited
[ ] Meal can be deleted
[ ] Expense can be added
[ ] Expense can be edited
[ ] Expense can be deleted
[ ] Meal rate is correct
[ ] Member balance is correct
[ ] Report is correct
[ ] Backup works
[ ] Restore works
[ ] App works after restart
[ ] Data survives device/app restart
```

Expand this to cover every discovered feature.

---

# 37. ERROR RECOVERY

Test:

- App restart during save
- Database error
- Invalid data
- Empty database
- Missing database
- Corrupted backup
- Duplicate import
- Interrupted import
- Large number of records

The application must fail safely.

---

# 38. PERFORMANCE

The app should remain responsive with:

```text
50 members
500 members
10,000 meals
10,000 expenses
Multiple years of history
```

Optimize queries.

Add indexes where justified.

Avoid loading huge datasets unnecessarily into memory.

---

# 39. SECURITY

Protect locally stored sensitive data where appropriate.

Do not:

- Hardcode secrets
- Store passwords in plain text
- Log sensitive information
- Expose database credentials
- Include test accounts in production

If authentication exists, implement it securely.

---

# 40. LOGGING

Use development logging.

Production logs should not contain:

- Passwords
- Tokens
- Private personal data
- Sensitive financial details unless absolutely necessary

Provide useful diagnostic logs for developers.

---

# 41. EMPTY STATES

Every list should have a useful empty state.

Example:

```text
No meals recorded yet.

Add today's meals to start calculating your monthly total.
```

Use the reference application's wording/style when observable, otherwise create clear original text.

---

# 42. LOADING STATES

Use:

- Progress indicators
- Skeletons where appropriate
- Disabled duplicate-submit behavior

Never allow users to accidentally submit the same payment/expense multiple times because the UI appears frozen.

---

# 43. NOTIFICATIONS

If the reference application provides notifications, reproduce their functional purpose.

Possible examples:

- Meal reminder
- Bazar reminder
- Monthly closing reminder
- Payment reminder

Only implement notifications that are actually useful and permitted by the platform.

Make notification settings configurable.

---

# 44. EXPORT

If export is supported or appropriate, support formats such as:

```text
CSV
PDF
JSON
```

Do not add unnecessary export formats merely to increase feature count.

Exports must contain correct totals.

---

# 45. RECEIPTS / ATTACHMENTS

If the reference application supports receipt images:

- Add image
- Preview
- Replace
- Remove
- Store safely
- Avoid unnecessary duplication
- Handle missing files

If it does not support them, treat this as an optional enhancement rather than a mandatory reference feature.

---

# 46. MULTI-MESS SUPPORT

Determine whether the reference application supports multiple mess/household groups.

If yes:

```text
User
 ├── Mess A
 ├── Mess B
 └── Mess C
```

If no, do not introduce complex multi-mess behavior unless there is a strong product reason.

---

# 47. AUTHENTICATION

Determine whether the reference application requires:

- Login
- Registration
- Google login
- Email/password
- Guest/local mode

Implement only what is actually required.

If authentication is not necessary, prefer a simple local-first experience.

---

# 48. CLOUD SYNC

If the reference product has cloud synchronization, investigate how it behaves.

Do not assume a backend provider.

If implementing sync:

```text
Local DB
   ↕
Sync Layer
   ↕
Cloud Backend
```

Must handle:

- Offline changes
- Conflict resolution
- Duplicate records
- Authentication
- Retry
- Partial failure
- Data deletion
- Restore

Never silently lose local data.

---

# 49. COPY UI RESPONSIBLY

The requirement is to reproduce the reference UI/UX experience.

Therefore:

1. Analyze reference screenshots.
2. Identify layout patterns.
3. Identify reusable components.
4. Recreate equivalent components.
5. Use original implementation code.
6. Use original/recreated assets where required.
7. Avoid copying proprietary source code.
8. Avoid misrepresenting the app as the original.

Where exact visual matching is not possible, prioritize:

```text
Information hierarchy
Interaction flow
Usability
Spacing
Component structure
Visual rhythm
```

---

# 50. ICONS AND ASSETS

Create an asset inventory:

`design/assets-inventory.md`

For each asset:

```text
Asset
Purpose
Source
License/status
Replacement required?
```

Do not download questionable copyrighted assets.

Prefer:

- Material icons
- Open-license icons
- Original SVGs
- Original illustrations

---

# 51. SCREEN-BY-SCREEN IMPLEMENTATION

Do not build the entire app blindly in one pass.

Use this process:

```text
Research
 ↓
Screen inventory
 ↓
Navigation map
 ↓
Data model
 ↓
Design system
 ↓
Core calculation engine
 ↓
Database
 ↓
One complete vertical slice
 ↓
Remaining screens
 ↓
Integration
 ↓
Testing
 ↓
Polish
```

---

# 52. VERTICAL SLICE

First build one fully working flow:

```text
Create mess
 ↓
Add members
 ↓
Add meals
 ↓
Add expense
 ↓
Calculate meal rate
 ↓
Calculate member balance
 ↓
Display dashboard
```

Only after this flow is stable should you expand the application.

---

# 53. DEVELOPMENT RULE

Never generate large amounts of UI code before understanding the database and calculation rules.

Correct order:

```text
Reference research
        ↓
Requirements
        ↓
Domain model
        ↓
Database
        ↓
Calculation engine
        ↓
Repository
        ↓
UI
```

---

# 54. SOURCE CODE QUALITY

Follow:

- Clear naming
- Small functions
- Single responsibility
- Reusable components
- Dependency injection where useful
- No duplicated calculation logic
- No magic numbers
- No unnecessary global state
- Comments only where useful
- Consistent formatting

---

# 55. NO FAKE FEATURES

Do not create fake buttons that do nothing.

Every visible action must either:

1. Work, or
2. Be clearly marked as unavailable/not implemented during development.

Before release, no placeholder feature should remain.

---

# 56. NO MOCK DATA IN RELEASE BUILD

During development, seed data may be used.

Before final build:

- Remove demo data
- Remove test accounts
- Remove debug menus
- Remove fake API responses
- Remove placeholder text
- Remove temporary screenshots
- Remove development-only logging

---

# 57. DATA MIGRATION

Design schema versions.

Example:

```text
v1
v2
v3
```

Every migration must be tested.

Never casually delete old user records during migration.

---

# 58. BACKUP BEFORE DANGEROUS OPERATIONS

Before:

- Database reset
- Major migration
- Restore
- Data import

Provide appropriate confirmation and backup opportunities.

---

# 59. UI DESIGN SYSTEM

Create reusable definitions for:

```text
Typography
Spacing
Corner radius
Buttons
Cards
Input fields
Dialogs
Bottom navigation
Top app bar
Tables
Chips
Badges
Snackbars
Empty states
Error states
```

Avoid implementing each screen with unrelated styling.

---

# 60. DARK/LIGHT MODE

If the reference app supports themes, reproduce them.

If not, consider a clean theme system only if it does not interfere with reference fidelity.

All components must remain readable in both supported modes.

---

# 61. LOCALIZATION

Structure strings so translation is possible.

At minimum keep user-visible strings outside hardcoded business logic.

If Bangladesh is the target context, consider:

```text
English
Bangla
```

only if appropriate to the reference/product requirements.

Currency should support:

```text
৳ / BDT
```

where relevant.

---

# 62. CALCULATION EXAMPLES

Create unit tests with known values.

Example:

```text
Total expense = ৳3,000
Total meals = 100

Meal rate = ৳30
```

Member:

```text
Meals = 20
Meal cost = ৳600
Other expense = ৳100
Paid = ৳500

Balance = ৳200
```

But treat this only as a test example.

The actual calculation implementation must follow the confirmed accounting model.

---

# 63. ROUNDING

Define:

```text
Currency precision = 2 decimal places
```

or the precision appropriate to the reference.

Test:

```text
1 / 3
2 / 3
100 / 6
```

Ensure totals reconcile.

If individual rounded amounts do not sum exactly to the group total, define a documented reconciliation method.

---

# 64. AUDITABILITY

Users should be able to understand why their final balance is what it is.

Provide a breakdown:

```text
Meals
+ Meal cost
+ Shared expenses
+ Individual expenses
- Payments
= Final balance
```

Do not hide important accounting transformations.

---

# 65. SAMPLE USER FLOW

Create a realistic flow:

```text
Open App
 ↓
Create Mess
 ↓
Add 5 Members
 ↓
Select Current Month
 ↓
Record Meals
 ↓
Record Bazar Purchases
 ↓
Calculate Meal Rate
 ↓
Review Individual Accounts
 ↓
Record Payments
 ↓
Close Month
 ↓
Generate Report
 ↓
Backup Data
```

Every step must work.

---

# 66. FINAL RELEASE REQUIREMENTS

Before declaring completion:

## Functional

- Every confirmed reference feature works.
- Every core meal-management workflow works.
- Calculations are verified.
- Data persists.
- Backup/restore works if implemented.
- Reports are correct.

## UI

- Reference screens have been studied.
- UI structure closely follows the reference.
- No obvious broken layouts.
- No placeholder screens.

## Technical

- Clean architecture.
- Automated tests.
- No critical crashes.
- No obvious memory leaks.
- No unhandled database failures.

## Documentation

- README complete.
- Architecture documented.
- Database documented.
- Calculation rules documented.
- Testing documented.
- Build instructions documented.

---

# 67. BUILD AND RUN

The project must include exact commands for:

```text
Install dependencies
Build debug
Run tests
Build release
Install on device/emulator
Generate APK/AAB
```

Put the commands in:

`README.md`

The commands must be verified on the actual development environment.

Do not write commands that have not been tested.

---

# 68. FINAL VERIFICATION REPORT

Create:

`docs/final-verification.md`

Include:

```text
Reference feature
Implemented?
Tested?
Status
Notes
```

Example:

| Feature | Implemented | Tested | Status |
|---|---:|---:|---|
| Member management | Yes | Yes | PASS |
| Meal entry | Yes | Yes | PASS |
| Expense tracking | Yes | Yes | PASS |
| Meal calculation | Yes | Yes | PASS |
| Reports | Yes | Yes | PASS |

Any remaining issue must be explicitly listed.

---

# 69. ANTIGRAVITY OPERATING RULES

You are expected to work autonomously.

Do not repeatedly ask the user for permission for ordinary engineering decisions.

Use this decision hierarchy:

```text
Reference evidence
        ↓
User requirements
        ↓
Project documentation
        ↓
Platform best practices
        ↓
Engineering judgment
```

When evidence conflicts:

1. Do not silently guess.
2. Record the uncertainty.
3. Choose the safest implementation.
4. Document the decision.

---

# 70. IMPORTANT — NEVER LOSE USER DATA

Data integrity is more important than visual polish.

Before changing:

- Database schema
- Storage structure
- Import logic
- Restore logic
- Calculation logic

Create a safe migration/backward-compatible approach.

Never delete user data simply to make a feature easier to implement.

---

# 71. PERFORMANCE OF DAILY USE

The most common operations should be extremely fast:

```text
Add today's meal
Edit today's meal
Add bazar expense
See today's total
See current meal rate
See member balance
```

Optimize these workflows first.

---

# 72. UX PRINCIPLE

This app will be used repeatedly by people living together.

Therefore:

**Reduce repetitive work.**

Good UX should allow a user to record common daily data in seconds rather than forcing them through many screens.

Use:

- Quick actions
- Bulk editing
- Previous-day copying where appropriate
- Sensible defaults
- Remembered selections where safe
- Fast member selection
- Clear totals

---

# 73. RESEARCH DOCUMENTS TO CREATE

Create these before final implementation:

```text
research/
├── reference-feature-inventory.md
├── reference-screen-inventory.md
├── reference-workflows.md
├── reference-calculations.md
├── reference-assets.md
└── open-questions.md
```

If information cannot be verified, explicitly write:

```text
UNKNOWN — NOT OBSERVED
```

Do not fabricate research findings.

---

# 74. DESIGN DOCUMENTS TO CREATE

```text
design/
├── screen-specifications.md
├── navigation-map.md
├── design-system.md
├── component-inventory.md
└── assets-inventory.md
```

---

# 75. ENGINEERING DOCUMENTS TO CREATE

```text
docs/
├── architecture.md
├── database.md
├── calculations.md
├── backup-restore.md
├── testing.md
├── release.md
└── final-verification.md
```

---

# 76. DEVELOPMENT CHECKPOINTS

Maintain checkpoints:

```text
CHECKPOINT 01 — Research complete
CHECKPOINT 02 — Requirements complete
CHECKPOINT 03 — Data model complete
CHECKPOINT 04 — Database working
CHECKPOINT 05 — Calculation engine working
CHECKPOINT 06 — Core vertical slice working
CHECKPOINT 07 — UI implementation complete
CHECKPOINT 08 — Feature integration complete
CHECKPOINT 09 — QA complete
CHECKPOINT 10 — Release build verified
```

At every checkpoint verify that the project still builds.

---

# 77. BUG-FIXING RULE

When a bug appears:

1. Reproduce it.
2. Identify root cause.
3. Fix root cause.
4. Add a regression test when practical.
5. Re-run related tests.
6. Re-test the complete workflow.
7. Document important fixes.

Do not repeatedly patch symptoms.

---

# 78. FINAL PRODUCT QUALITY BAR

The final application must not feel like:

- A prototype
- A tutorial project
- A mockup
- A collection of disconnected screens
- A fake clone
- A UI-only demo

It must feel like a **real, complete, reliable meal-management application**.

---

# 79. PRIORITY ORDER

If time or implementation complexity becomes a constraint, use this order:

### P0 — Must work

```text
App startup
Database
Members
Meals
Expenses
Calculation engine
Balances
Dashboard
Persistence
```

### P1 — Important

```text
Reports
Payments
History
Search/filter
Backup/restore
Editing/deletion
```

### P2 — Enhancement

```text
Advanced export
Notifications
Cloud sync
Advanced analytics
Additional customization
```

Never sacrifice P0 reliability for P2 features.

---

# 80. START NOW

Execute the following sequence:

```text
1. Inspect G:\VIDEOS\Bachelors App
2. Inspect the reference Google Play listing and publicly available reference material.
3. Build the reference feature inventory.
4. Build the screen inventory.
5. Build the navigation map.
6. Determine the data model.
7. Determine the accounting/calculation rules.
8. Document uncertainties.
9. Select the technology stack.
10. Create the project.
11. Implement the database.
12. Implement domain models.
13. Implement calculation engine.
14. Write calculation tests.
15. Implement repository/data layer.
16. Implement the core vertical slice.
17. Implement the UI.
18. Reproduce reference workflows.
19. Implement all confirmed features.
20. Add validation and error handling.
21. Add backup/export features where required.
22. Test all major workflows.
23. Test on multiple screen sizes.
24. Fix all critical bugs.
25. Build release version.
26. Verify the release build.
27. Write final documentation.
28. Create final-verification.md.
29. Leave the complete working project inside G:\VIDEOS\Bachelors App.
```

---

# 81. DEFINITION OF DONE

Do NOT report the project as complete until all of these are true:

```text
[ ] Reference research completed
[ ] Feature inventory completed
[ ] Screen inventory completed
[ ] Navigation mapped
[ ] Data model implemented
[ ] Database persistent
[ ] Calculation engine implemented
[ ] Calculation tests passing
[ ] Member management working
[ ] Meal management working
[ ] Expense management working
[ ] Balance calculation working
[ ] Dashboard working
[ ] Reports working where required
[ ] Backup/restore working where required
[ ] UI closely reproduces reference workflows
[ ] Forms validated
[ ] Destructive actions protected
[ ] Empty states implemented
[ ] Error states implemented
[ ] App restart preserves data
[ ] No critical crashes
[ ] Release build succeeds
[ ] Final verification completed
[ ] Documentation completed
```

---

# 82. FINAL ANTIGRAVITY INSTRUCTION

**Do the work, do not merely describe how to do the work.**

You are building the application.

Inspect first.  
Plan second.  
Implement third.  
Test fourth.  
Polish fifth.  
Verify last.

Do not stop at a prototype.

Do not create fake functionality.

Do not invent reference features.

Do not destroy user data.

Do not leave broken navigation.

Do not leave placeholder screens.

Do not declare completion until the actual application has been built, run, tested, and verified.

**Primary objective:**

> Build a complete, production-quality, locally persistent **Bachelors' Meal Manager** application in `G:\VIDEOS\Bachelors App`, using the publicly observable **Bachelors' Meal Manager by Red Z Apps** as the functional and UX reference, while implementing the software independently and responsibly.
