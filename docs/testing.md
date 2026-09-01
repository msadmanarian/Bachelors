# Testing Strategy & Test Suites

Specification of automated unit tests and manual quality assurance procedures.

---

## 1. Automated Test Suites (Vitest)

1. `tests/calculations.test.ts`:
   - Tests zero meal handling (ensuring meal rate returns 0.00 without divide-by-zero errors).
   - Tests single and multiple member meal totals and fractional meal additions (0.5 increments).
   - Tests meal-related bazar vs utility expenses vs feast expenses.
   - Tests dynamic meal rate calculation with exact rounding to 2 decimal places.
   - Tests member net balances (Credit vs Due vs Settled).
   - Tests group financial reconciliation invariant: $\sum \text{Member Total Costs} = \text{Total Group Expenses}$.
   - Tests cash-in-hand / fund balance invariant: $\sum \text{Member Net Balances} = \text{Cash in Hand}$.

2. `tests/validation.test.ts`:
   - Tests member name validation (empty name rejection, trim).
   - Tests phone number format.
   - Tests positive amount constraint for expenses and deposits.
   - Tests meal entry range constraints ($0 \le \text{meal} \le 10$).

3. `tests/backup.test.ts`:
   - Tests schema v1 export formatting.
   - Tests corrupted JSON rejection and schema version mismatch validation.

---

## 2. Test Execution Commands
```bash
# Run automated unit tests
npm run test

# Run tests in watch mode
npm run test:watch
```
