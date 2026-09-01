# Reference Calculations & Accounting Engine Rules

This document specifies the exact mathematical rules, rounding policies, edge cases, and deterministic formulas used in **Bachelors' Meal Manager**.

---

## 1. Core Principles

1. **Deterministic & Pure Calculation Layer**: Calculation routines must never mutate database state or depend on UI state.
2. **Zero-Safe Arithmetic**: If total meals == 0, meal rate is 0.00 (not NaN or Infinity).
3. **Currency Precision**: Monetary amounts are formatted to 2 decimal places with safe integer or fixed decimal representation to avoid IEEE-754 binary floating-point rounding drifts.
4. **Reconciliation Guarantee**: Total group expenditures reconcile with sum of individual member costs.

---

## 2. Mathematical Definitions

### A. Total Meals
$$\text{Total Meals} = \sum_{m \in \text{Members}} \sum_{d \in \text{Days}} \left( \text{Breakfast}_{m,d} + \text{Lunch}_{m,d} + \text{Dinner}_{m,d} + \text{Extra}_{m,d} \right)$$
*Note: Meal counts can be fractional (e.g. 0.5 for breakfast or half meal).*

### B. Expense Classification
Expenses are partitioned into three explicit pools:
1. **Meal Bazar Expenses ($E_{\text{meal}}$)**: Items consumed daily as meals (rice, oil, meat, fish, vegetables, spices, etc.).
2. **Shared Utility / Fixed Expenses ($E_{\text{utility}}$)**: House rent, electricity, gas, internet/WiFi, cleaning, cook salary.
3. **Special Feast / Custom Expenses ($E_{\text{feast}}$)**: Custom event meals split exclusively across designated attendees.

$$\text{Total Bazar Expense} = \sum e_i \quad \text{where } e_i \in E_{\text{meal}}$$
$$\text{Total Utility Expense} = \sum e_j \quad \text{where } e_j \in E_{\text{utility}}$$
$$\text{Total Group Expense} = E_{\text{meal}} + E_{\text{utility}} + E_{\text{feast}}$$

---

### C. Meal Rate Calculation

#### Mode 1: Calculated Dynamic Mode (Standard)
$$\text{Meal Rate} = \begin{cases} \frac{\text{Total Bazar Expense}}{\text{Total Meals}}, & \text{if Total Meals} > 0 \\ 0.00, & \text{if Total Meals} = 0 \end{cases}$$

#### Mode 2: Fixed Meal Rate Mode
$$\text{Meal Rate} = \text{Fixed Rate configured in Mess Settings (e.g., ৳ 45.00)}$$

---

### D. Individual Member Cost Breakdown

For each member $m$:
1. **Member Total Meals ($M_m$)**:
   $$M_m = \sum_{d \in \text{Days}} (\text{Breakfast}_{m,d} + \text{Lunch}_{m,d} + \text{Dinner}_{m,d} + \text{Extra}_{m,d})$$

2. **Member Meal Cost ($C_{\text{meal}, m}$)**:
   $$C_{\text{meal}, m} = M_m \times \text{Meal Rate}$$

3. **Member Utility Share ($C_{\text{utility}, m}$)**:
   $$C_{\text{utility}, m} = \frac{E_{\text{utility}}}{N_{\text{active members}}}$$
   *(Or based on individual custom split assignments if applicable).*

4. **Member Feast Share ($C_{\text{feast}, m}$)**:
   $$C_{\text{feast}, m} = \sum_{f \in \text{Feasts where } m \text{ attended}} \frac{\text{Cost}(f)}{N_{\text{attendees}(f)}}$$

5. **Member Total Cost ($C_{\text{total}, m}$)**:
   $$C_{\text{total}, m} = C_{\text{meal}, m} + C_{\text{utility}, m} + C_{\text{feast}, m}$$

---

### E. Individual Deposit & Net Balance

1. **Member Total Deposit ($D_m$)**:
   $$D_m = \sum p_k \quad \text{where } p_k \in \text{Deposits made by member } m$$

2. **Member Net Balance ($B_m$)**:
   $$B_m = D_m - C_{\text{total}, m}$$

3. **Status Interpretation**:
   - **In Credit / Refundable ($B_m > 0$)**: The mess or manager owes money to the member (Green badge).
   - **Due / Payable ($B_m < 0$)**: The member owes money to the mess (Red/Orange badge).
   - **Settled ($B_m = 0$)**: Account is completely squared (Blue/Gray badge).

---

### F. Mess Fund & Cash-in-Hand Balance

$$\text{Total Collected Deposits} = \sum_{m \in \text{Members}} D_m$$
$$\text{Total Expenses Paid from Fund} = \text{Total Group Expense}$$
$$\text{Fund Balance / Cash in Hand} = \text{Total Collected Deposits} - \text{Total Expenses Paid}$$

---

## 3. Worked Example for Unit Testing

### Test Dataset:
- **Members**: 3 active members (Rahim, Karim, Sakib).
- **Meal Counts**:
  - Rahim: 20 meals
  - Karim: 30 meals
  - Sakib: 50 meals
  - Total Meals = $20 + 30 + 50 = 100$ meals.
- **Expenses**:
  - Meal Bazar = ৳ 4,000.00
  - Utility (Internet + Gas) = ৳ 900.00 (Split equally across 3 members = ৳ 300.00 each)
  - Total Group Expense = ৳ 4,900.00
- **Meal Rate**:
  $$\text{Meal Rate} = \frac{4000.00}{100} = ৳ 40.00 / \text{meal}$$
- **Member Costs**:
  - **Rahim**:
    - Meal Cost: $20 \times 40.00 = ৳ 800.00$
    - Utility Share: ৳ 300.00
    - Total Cost: ৳ 1,100.00
    - Deposit: ৳ 1,500.00
    - **Net Balance: $1500.00 - 1100.00 = +৳ 400.00$ (In Credit)**
  - **Karim**:
    - Meal Cost: $30 \times 40.00 = ৳ 1,200.00$
    - Utility Share: ৳ 300.00
    - Total Cost: ৳ 1,500.00
    - Deposit: ৳ 1,000.00
    - **Net Balance: $1000.00 - 1500.00 = -৳ 500.00$ (Due)**
  - **Sakib**:
    - Meal Cost: $50 \times 40.00 = ৳ 2,000.00$
    - Utility Share: ৳ 300.00
    - Total Cost: ৳ 2,300.00
    - Deposit: ৳ 2,400.00
    - **Net Balance: $2400.00 - 2300.00 = +৳ 100.00$ (In Credit)**

- **Group Reconciliation**:
  - Total Group Costs = $1100 + 1500 + 2300 = ৳ 4,900.00$ (Matches Total Expense)
  - Total Deposits = $1500 + 1000 + 2400 = ৳ 4,900.00$
  - Cash in Hand = $4900.00 - 4900.00 = ৳ 0.00$
  - Net Balances Sum = $(+400) + (-500) + (+100) = ৳ 0.00$ (Perfect reconciliation)
