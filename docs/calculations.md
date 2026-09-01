# Calculation Engine Documentation

Specification of the deterministic business calculation engine implemented in `src/domain/calculations.ts`.

---

## 1. Engine Capabilities

1. **Deterministic Execution**:
   ```typescript
   calculateMonthlyHisab(input: HisabInput): HisabResult
   ```
   Given a set of members, active meals, expenses, and deposits for an accounting period, returns an immutable, fully calculated monthly reconciliation dataset.

2. **Core Formulas**:
   - `Total Meals = Sum(Breakfast + Lunch + Dinner + Extra)` for all non-deleted meals in the month.
   - `Total Bazar Expense = Sum(Expense.amount)` where `expense.expenseType === 'meal_bazar'`.
   - `Total Utility Expense = Sum(Expense.amount)` where `expense.expenseType === 'shared_utility'`.
   - `Meal Rate = Total Bazar Expense / Total Meals` (or fixed rate if configured).
   - `Member Meal Cost = Member Meals × Meal Rate`.
   - `Member Utility Cost = Total Utility Expense / Active Member Count`.
   - `Member Total Cost = Member Meal Cost + Member Utility Cost + Member Feast Cost`.
   - `Member Net Balance = Member Deposits - Member Total Cost`.
     - Balance $> 0 \implies$ In Credit (Mess owes member).
     - Balance $< 0 \implies$ Due (Member owes mess).
     - Balance $== 0 \implies$ Settled.
   - `Fund Balance (Cash in Hand) = Total Deposits - (Total Bazar Expense + Total Utility Expense + Total Feast Expense)`.

3. **Reconciliation Invariants**:
   - `Sum(Member Total Costs) == Total Group Expenses`.
   - `Sum(Member Net Balances) == Total Deposits - Total Expenses == Cash in Hand`.
