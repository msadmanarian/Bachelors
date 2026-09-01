import Dexie, { Table } from 'dexie';
import {
  AccountingPeriod,
  AuditLog,
  Deposit,
  Expense,
  House,
  MealEntry,
  Member,
  SpecialMeal,
} from '../domain/types';

export class BachelorsMealManagerDB extends Dexie {
  houses!: Table<House, string>;
  members!: Table<Member, string>;
  accountingPeriods!: Table<AccountingPeriod, string>;
  mealEntries!: Table<MealEntry, string>;
  specialMeals!: Table<SpecialMeal, string>;
  expenses!: Table<Expense, string>;
  deposits!: Table<Deposit, string>;
  auditLogs!: Table<AuditLog, string>;

  constructor() {
    super('BachelorsMealManagerDB');

    this.version(2).stores({
      houses: 'id, code, activeMonthKey',
      members: 'id, houseId, name, role, isActive, isDeleted',
      accountingPeriods: 'id, houseId, monthKey, status',
      mealEntries: 'id, houseId, memberId, date, monthKey, [memberId+date], isDeleted',
      specialMeals: 'id, houseId, monthKey, date, buyerId, isDeleted',
      expenses: 'id, houseId, buyerId, category, expenseType, date, monthKey, isDeleted',
      deposits: 'id, houseId, memberId, method, date, monthKey, isDeleted',
      auditLogs: 'id, houseId, timestamp, targetType',
    });
  }
}

export const db = new BachelorsMealManagerDB();
