# Database Documentation & Schema Design

Database Technology: **IndexedDB via Dexie.js (Relational Local Database)**  
Database Name: `BachelorsMealManagerDB`  
Current Schema Version: `1`

---

## 1. Entity-Relationship Diagram

```mermaid
erDiagram
    HOUSE ||--o{ MEMBER : contains
    HOUSE ||--o{ ACCOUNTING_PERIOD : has
    MEMBER ||--o{ MEAL_ENTRY : logs
    ACCOUNTING_PERIOD ||--o{ MEAL_ENTRY : groups
    MEMBER ||--o{ EXPENSE : pays
    ACCOUNTING_PERIOD ||--o{ EXPENSE : groups
    MEMBER ||--o{ DEPOSIT : deposits
    ACCOUNTING_PERIOD ||--o{ DEPOSIT : groups

    HOUSE {
        string id PK
        string name
        string currency
        string pricingMode
        string createdAt
        string updatedAt
    }

    MEMBER {
        string id PK
        string houseId FK
        string name
        string phone
        string role
        boolean isActive
        boolean isDeleted
        string createdAt
        string updatedAt
    }

    ACCOUNTING_PERIOD {
        string id PK
        string houseId FK
        string monthKey
        string status
        string createdAt
    }

    MEAL_ENTRY {
        string id PK
        string houseId FK
        string memberId FK
        string date
        string monthKey
        number breakfast
        number lunch
        number dinner
        number extra
        number totalMeals
        boolean isDeleted
        string createdAt
        string updatedAt
    }

    EXPENSE {
        string id PK
        string houseId FK
        string buyerId FK
        string title
        number amount
        string category
        string expenseType
        string date
        string monthKey
        string note
        boolean isDeleted
        string createdAt
        string updatedAt
    }

    DEPOSIT {
        string id PK
        string houseId FK
        string memberId FK
        number amount
        string method
        string date
        string monthKey
        string note
        boolean isDeleted
        string createdAt
        string updatedAt
    }
```

---

## 2. Table Schemas & Indexes

### Table: `houses`
- Primary Key: `id`
- Fields: `id, name, code, currency, pricingMode, fixedRate, createdAt, updatedAt`

### Table: `members`
- Primary Key: `id`
- Indexed Fields: `id, houseId, name, role, isActive, isDeleted, createdAt`

### Table: `accountingPeriods`
- Primary Key: `id`
- Indexed Fields: `id, houseId, monthKey, status`

### Table: `mealEntries`
- Primary Key: `id`
- Indexed Fields: `id, houseId, memberId, date, monthKey, [memberId+date], isDeleted`

### Table: `expenses`
- Primary Key: `id`
- Indexed Fields: `id, houseId, buyerId, category, expenseType, date, monthKey, isDeleted`

### Table: `deposits`
- Primary Key: `id`
- Indexed Fields: `id, houseId, memberId, method, date, monthKey, isDeleted`

---

## 3. Migration Strategy
Schema versioning is handled through Dexie's versioning API (`db.version(1).stores(...)`). Future versions (`db.version(2)`) specify non-destructive data transformations using `.upgrade(tx => ...)`.
