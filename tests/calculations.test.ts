import { describe, expect, it } from 'vitest';
import { calculateMonthlyHisab, roundCurrency, roundMeal } from '../src/domain/calculations';
import { Deposit, Expense, House, MealEntry, Member } from '../src/domain/types';

describe('Meal Calculation Engine', () => {
  const sampleHouse: House = {
    id: 'house-1',
    name: 'Padma Mess',
    code: 'PADMA01',
    currency: '৳',
    pricingMode: 'calculated',
    activeMonthKey: '2026-09',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const members: Member[] = [
    {
      id: 'm1',
      houseId: 'house-1',
      name: 'Rahim',
      role: 'manager',
      isActive: true,
      isDeleted: false,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'm2',
      houseId: 'house-1',
      name: 'Karim',
      role: 'member',
      isActive: true,
      isDeleted: false,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'm3',
      houseId: 'house-1',
      name: 'Sakib',
      role: 'member',
      isActive: true,
      isDeleted: false,
      createdAt: '',
      updatedAt: '',
    },
  ];

  it('handles 0 meals gracefully without divide-by-zero errors', () => {
    const report = calculateMonthlyHisab({
      house: sampleHouse,
      monthKey: '2026-09',
      members,
      meals: [],
      expenses: [],
      deposits: [],
    });

    expect(report.totalMeals).toBe(0);
    expect(report.mealRate).toBe(0);
    expect(report.totalGroupExpense).toBe(0);
    expect(report.cashInHand).toBe(0);
    expect(report.membersSummary.length).toBe(3);
    expect(report.membersSummary[0].status).toBe('settled');
  });

  it('calculates standard dynamic meal rate and reconciles member balances correctly', () => {
    // Rahim: 20 meals, Karim: 30 meals, Sakib: 50 meals = Total 100 meals
    const meals: MealEntry[] = [
      {
        id: 'ml1',
        houseId: 'house-1',
        memberId: 'm1',
        date: '2026-09-01',
        monthKey: '2026-09',
        breakfast: 0,
        lunch: 10,
        dinner: 10,
        extra: 0,
        totalMeals: 20,
        isDeleted: false,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'ml2',
        houseId: 'house-1',
        memberId: 'm2',
        date: '2026-09-01',
        monthKey: '2026-09',
        breakfast: 10,
        lunch: 10,
        dinner: 10,
        extra: 0,
        totalMeals: 30,
        isDeleted: false,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'ml3',
        houseId: 'house-1',
        memberId: 'm3',
        date: '2026-09-01',
        monthKey: '2026-09',
        breakfast: 10,
        lunch: 20,
        dinner: 20,
        extra: 0,
        totalMeals: 50,
        isDeleted: false,
        createdAt: '',
        updatedAt: '',
      },
    ];

    // Expenses:
    // Meal Bazar = ৳ 4,000
    // Shared Utility = ৳ 900 (Internet + Gas split across 3 members = ৳300 each)
    const expenses: Expense[] = [
      {
        id: 'exp1',
        houseId: 'house-1',
        buyerId: 'm1',
        title: 'Weekly Grocery (Rice, Meat, Oil)',
        amount: 4000,
        category: 'grocery',
        expenseType: 'meal_bazar',
        date: '2026-09-02',
        monthKey: '2026-09',
        isDeleted: false,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'exp2',
        houseId: 'house-1',
        buyerId: 'm1',
        title: 'Internet & Gas bill',
        amount: 900,
        category: 'internet',
        expenseType: 'shared_utility',
        date: '2026-09-05',
        monthKey: '2026-09',
        isDeleted: false,
        createdAt: '',
        updatedAt: '',
      },
    ];

    // Deposits:
    // Rahim: ৳ 1,500
    // Karim: ৳ 1,000
    // Sakib: ৳ 2,400
    // Total Deposits = ৳ 4,900
    const deposits: Deposit[] = [
      {
        id: 'dep1',
        houseId: 'house-1',
        memberId: 'm1',
        amount: 1500,
        method: 'cash',
        date: '2026-09-01',
        monthKey: '2026-09',
        isDeleted: false,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'dep2',
        houseId: 'house-1',
        memberId: 'm2',
        amount: 1000,
        method: 'bkash',
        date: '2026-09-01',
        monthKey: '2026-09',
        isDeleted: false,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'dep3',
        houseId: 'house-1',
        memberId: 'm3',
        amount: 2400,
        method: 'nagad',
        date: '2026-09-01',
        monthKey: '2026-09',
        isDeleted: false,
        createdAt: '',
        updatedAt: '',
      },
    ];

    const report = calculateMonthlyHisab({
      house: sampleHouse,
      monthKey: '2026-09',
      members,
      meals,
      expenses,
      deposits,
    });

    expect(report.totalMeals).toBe(100);
    expect(report.totalMealBazarExpense).toBe(4000);
    expect(report.totalUtilityExpense).toBe(900);
    expect(report.totalGroupExpense).toBe(4900);
    expect(report.mealRate).toBe(40); // 4000 / 100 = 40.00
    expect(report.totalDeposits).toBe(4900);
    expect(report.cashInHand).toBe(0);

    const rahim = report.membersSummary.find((m) => m.memberId === 'm1')!;
    const karim = report.membersSummary.find((m) => m.memberId === 'm2')!;
    const sakib = report.membersSummary.find((m) => m.memberId === 'm3')!;

    // Rahim: 20 * 40 = 800 meal + 300 utility = 1100 total cost. Deposit 1500 -> Balance +400 (Credit)
    expect(rahim.totalMeals).toBe(20);
    expect(rahim.mealCost).toBe(800);
    expect(rahim.utilityCost).toBe(300);
    expect(rahim.totalCost).toBe(1100);
    expect(rahim.totalDeposit).toBe(1500);
    expect(rahim.netBalance).toBe(400);
    expect(rahim.status).toBe('credit');

    // Karim: 30 * 40 = 1200 meal + 300 utility = 1500 total cost. Deposit 1000 -> Balance -500 (Due)
    expect(karim.totalMeals).toBe(30);
    expect(karim.mealCost).toBe(1200);
    expect(karim.utilityCost).toBe(300);
    expect(karim.totalCost).toBe(1500);
    expect(karim.totalDeposit).toBe(1000);
    expect(karim.netBalance).toBe(-500);
    expect(karim.status).toBe('due');

    // Sakib: 50 * 40 = 2000 meal + 300 utility = 2300 total cost. Deposit 2400 -> Balance +100 (Credit)
    expect(sakib.totalMeals).toBe(50);
    expect(sakib.mealCost).toBe(2000);
    expect(sakib.utilityCost).toBe(300);
    expect(sakib.totalCost).toBe(2300);
    expect(sakib.totalDeposit).toBe(2400);
    expect(sakib.netBalance).toBe(100);
    expect(sakib.status).toBe('credit');

    // Invariant Check: Sum of net balances must equal cash in hand (0)
    const netSum = rahim.netBalance + karim.netBalance + sakib.netBalance;
    expect(netSum).toBe(0);

    // Settlement Plan Integration Check:
    expect(report.settlementPlan).toBeDefined();
    expect(report.settlementPlan?.transactionsCount).toBe(2);
    expect(report.settlementPlan?.totalSettledAmount).toBe(500);
    expect(report.settlementPlan?.transactions[0].fromMemberName).toBe('Karim');
    expect(report.settlementPlan?.transactions[0].toMemberName).toBe('Rahim');
    expect(report.settlementPlan?.transactions[0].amount).toBe(400);
    expect(report.settlementPlan?.transactions[1].fromMemberName).toBe('Karim');
    expect(report.settlementPlan?.transactions[1].toMemberName).toBe('Sakib');
    expect(report.settlementPlan?.transactions[1].amount).toBe(100);
  });

  it('supports fixed meal rate pricing mode', () => {
    const fixedHouse: House = {
      ...sampleHouse,
      pricingMode: 'fixed',
      fixedRate: 45,
    };

    const meals: MealEntry[] = [
      {
        id: 'ml1',
        houseId: 'house-1',
        memberId: 'm1',
        date: '2026-09-01',
        monthKey: '2026-09',
        breakfast: 0.5,
        lunch: 1,
        dinner: 1,
        extra: 0,
        totalMeals: 2.5,
        isDeleted: false,
        createdAt: '',
        updatedAt: '',
      },
    ];

    const report = calculateMonthlyHisab({
      house: fixedHouse,
      monthKey: '2026-09',
      members: [members[0]],
      meals,
      expenses: [],
      deposits: [{
        id: 'd1',
        houseId: 'house-1',
        memberId: 'm1',
        amount: 200,
        method: 'cash',
        date: '2026-09-01',
        monthKey: '2026-09',
        isDeleted: false,
        createdAt: '',
        updatedAt: '',
      }],
    });

    expect(report.mealRate).toBe(45);
    expect(report.totalMeals).toBe(2.5);
    // 2.5 * 45 = 112.50
    const m1 = report.membersSummary[0];
    expect(m1.mealCost).toBe(112.5);
    expect(m1.totalCost).toBe(112.5);
    expect(m1.totalDeposit).toBe(200);
    expect(m1.netBalance).toBe(87.5);
    expect(m1.status).toBe('credit');
  });

  it('handles fractional meals and rounding with precision', () => {
    expect(roundCurrency(125.5000001)).toBe(125.5);
    expect(roundCurrency(100 / 6)).toBe(16.67);
    expect(roundMeal(1.25)).toBe(1.3);
  });
});
