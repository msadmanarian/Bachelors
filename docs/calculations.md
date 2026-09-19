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

---

## 4. Algorithmic Debt Settlement Engine (Min-Cash-Flow)

### Academic Context: CSC 3110 (Algorithms Analysis & Design)

In communal living setups (hostel/mess), determining individual net balances (`credit` vs `due`) leaves an open operational question: **Who should pay whom, and in what order?**

Pairwise naive settlement can generate up to $\frac{N(N - 1)}{2}$ transactions (e.g., 10 members could require 45 inter-member transfers). The **Minimum Cash Flow Problem** minimizes the total number of transactions required to settle all debts.

### Algorithmic Strategy: Greedy Flow Reduction

```typescript
computeMinimumCashFlowSettlement(membersSummary: MemberHisabSummary[], monthKey: string, currency: string): DebtSettlementPlan
```

1. **Partitioning**:
   - Separate members into two priority sets based on net balance $B_i$:
     $$\text{Debtors } D = \{i \mid B_i < -0.01\}, \quad \text{Creditors } C = \{j \mid B_j > +0.01\}$$
2. **Greedy Matching**:
   - At each step, identify the maximum debtor $d_{\max} = \arg\max_{i \in D} |B_i|$ and maximum creditor $c_{\max} = \arg\max_{j \in C} B_j$.
   - Settle transfer amount:
     $$T = \min(|B_{d_{\max}}|, B_{c_{\max}})$$
   - Record transaction $d_{\max} \xrightarrow{T} c_{\max}$.
   - Update remaining balances:
     $$|B_{d_{\max}}| \leftarrow |B_{d_{\max}}| - T, \quad B_{c_{\max}} \leftarrow B_{c_{\max}} - T$$
   - When a member's residual balance falls below threshold $\varepsilon = 0.01$, remove them from their set.
3. **Termination**:
   - Continues until both sets $D$ and $C$ are empty.

### Theoretical Bounds & Complexity

* **Transaction Minimization Theorem**:
  For any set of $N$ participants, the greedy matching algorithm produces at most $N - 1$ transactions:
  $$|E| \le N - 1$$
* **Time Complexity**: $\mathcal{O}(N \log N)$ using sorting / priority heaps.
* **Space Complexity**: $\mathcal{O}(N)$ auxiliary space for debtor/creditor arrays.

