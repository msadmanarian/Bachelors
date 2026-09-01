# Backup & Restore Documentation

Documentation for data export, backup validation, JSON structure, and restoration mechanisms in **Bachelors' Meal Manager**.

---

## 1. Backup File Format (Schema v1)

```json
{
  "schemaVersion": 1,
  "application": "Bachelors Meal Manager",
  "exportedAt": "2026-09-01T23:00:00.000Z",
  "appVersion": "1.0.0",
  "data": {
    "houses": [...],
    "members": [...],
    "accountingPeriods": [...],
    "mealEntries": [...],
    "expenses": [...],
    "deposits": [...]
  }
}
```

---

## 2. Safety Rules for Restore
1. **Pre-flight Validation**: The uploaded file must contain valid JSON with `schemaVersion: 1` and expected arrays.
2. **Confirmation**: A confirmation prompt warns the user before overwriting or merging data.
3. **Atomic Transaction**: Import runs inside a Dexie multi-table transaction so partial failures are rolled back automatically.
