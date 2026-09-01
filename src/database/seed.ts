import {
  AccountingPeriod,
  Deposit,
  Expense,
  House,
  MealEntry,
  Member,
} from '../domain/types';
import { db } from './db';

export async function seedDemoData(): Promise<void> {
  const currentMonthKey = '2026-09';
  const houseId = 'house-default';

  const defaultHouse: House = {
    id: houseId,
    name: 'Green View Bachelor Mess',
    code: 'GVM-2026',
    currency: '৳',
    pricingMode: 'calculated',
    activeMonthKey: currentMonthKey,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  };

  const members: Member[] = [
    {
      id: 'm1',
      houseId,
      name: 'Rahim Ahmed (Manager)',
      phone: '01711223344',
      role: 'manager',
      isActive: true,
      isDeleted: false,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    },
    {
      id: 'm2',
      houseId,
      name: 'Tanvir Hossain',
      phone: '01811223344',
      role: 'member',
      isActive: true,
      isDeleted: false,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    },
    {
      id: 'm3',
      houseId,
      name: 'Karim Ullah',
      phone: '01911223344',
      role: 'member',
      isActive: true,
      isDeleted: false,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    },
    {
      id: 'm4',
      houseId,
      name: 'Sakib Chowdhury',
      phone: '01611223344',
      role: 'member',
      isActive: true,
      isDeleted: false,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    },
    {
      id: 'm5',
      houseId,
      name: 'Ashikur Rahman',
      phone: '01511223344',
      role: 'member',
      isActive: true,
      isDeleted: false,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    },
  ];

  const periods: AccountingPeriod[] = [
    {
      id: 'period-2026-09',
      houseId,
      monthKey: currentMonthKey,
      status: 'open',
      createdAt: '2026-09-01T00:00:00.000Z',
    },
  ];

  // Seed sample meals for first 5 days of month
  const meals: MealEntry[] = [];
  for (let day = 1; day <= 5; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `2026-09-${dayStr}`;

    for (let i = 0; i < members.length; i++) {
      const mem = members[i];
      // realistic variation: breakfast 0.5 or 0, lunch 1, dinner 1
      const b = i % 2 === 0 ? 0.5 : 0;
      const l = 1;
      const d = 1;
      const total = b + l + d;

      meals.push({
        id: `meal-${mem.id}-${dateStr}`,
        houseId,
        memberId: mem.id,
        date: dateStr,
        monthKey: currentMonthKey,
        breakfast: b,
        lunch: l,
        dinner: d,
        extra: 0,
        totalMeals: total,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Seed Expenses
  const expenses: Expense[] = [
    {
      id: 'exp-1',
      houseId,
      buyerId: 'm1',
      title: 'Miniket Rice 25kg, Soybean Oil 5L, Spices',
      amount: 3250,
      category: 'grocery',
      expenseType: 'meal_bazar',
      date: '2026-09-01',
      monthKey: currentMonthKey,
      note: 'Bought from Kawran Bazar',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp-2',
      houseId,
      buyerId: 'm2',
      title: 'Broiler Chicken 4kg, Fresh Fish, Eggs 30pcs',
      amount: 1950,
      category: 'meat_fish',
      expenseType: 'meal_bazar',
      date: '2026-09-02',
      monthKey: currentMonthKey,
      note: 'Fresh market purchase',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp-3',
      houseId,
      buyerId: 'm3',
      title: 'Potatoes, Onions, Green Chili, Vegetables',
      amount: 680,
      category: 'vegetables',
      expenseType: 'meal_bazar',
      date: '2026-09-04',
      monthKey: currentMonthKey,
      note: 'Local grocery store',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp-4',
      houseId,
      buyerId: 'm1',
      title: 'Monthly High-Speed Internet / WiFi Bill',
      amount: 1000,
      category: 'internet',
      expenseType: 'shared_utility',
      date: '2026-09-03',
      monthKey: currentMonthKey,
      note: 'Shared equally (৳200 each)',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Seed Deposits (Members gave advance to Rahim the manager)
  const deposits: Deposit[] = [
    {
      id: 'dep-1',
      houseId,
      memberId: 'm1',
      amount: 2500,
      method: 'cash',
      date: '2026-09-01',
      monthKey: currentMonthKey,
      note: 'Self advance fund',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'dep-2',
      memberId: 'm2',
      houseId,
      amount: 2000,
      method: 'bkash',
      date: '2026-09-01',
      monthKey: currentMonthKey,
      trxId: 'BK89234XN',
      note: 'Sent via bKash',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'dep-3',
      memberId: 'm3',
      houseId,
      amount: 1500,
      method: 'nagad',
      date: '2026-09-01',
      monthKey: currentMonthKey,
      trxId: 'NG771239',
      note: 'Sent via Nagad',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'dep-4',
      memberId: 'm4',
      houseId,
      amount: 2000,
      method: 'cash',
      date: '2026-09-02',
      monthKey: currentMonthKey,
      note: 'Cash payment',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'dep-5',
      memberId: 'm5',
      houseId,
      amount: 2000,
      method: 'bkash',
      date: '2026-09-02',
      monthKey: currentMonthKey,
      trxId: 'BK11098ZZ',
      note: 'Advance deposit',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  await db.transaction(
    'rw',
    [db.houses, db.members, db.accountingPeriods, db.mealEntries, db.expenses, db.deposits],
    async () => {
      await db.houses.put(defaultHouse);
      await db.members.bulkPut(members);
      await db.accountingPeriods.bulkPut(periods);
      await db.mealEntries.bulkPut(meals);
      await db.expenses.bulkPut(expenses);
      await db.deposits.bulkPut(deposits);
    }
  );
}
