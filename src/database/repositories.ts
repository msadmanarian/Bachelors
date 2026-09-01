import { db } from './db';
import {
  AccountingPeriod,
  AuditLog,
  BackupData,
  Deposit,
  Expense,
  House,
  MealEntry,
  Member,
  SpecialMeal,
} from '../domain/types';

export const Repository = {
  // --- AUDIT LOGS ---
  async logActivity(
    houseId: string,
    actorName: string,
    action: string,
    details: string,
    targetType: AuditLog['targetType']
  ): Promise<void> {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      houseId,
      actorName,
      action,
      details,
      targetType,
      timestamp: new Date().toISOString(),
    };
    try {
      await db.auditLogs.put(log);
    } catch (e) {
      console.error('Failed to write audit log:', e);
    }
  },

  async getAuditLogs(houseId: string, limit = 100): Promise<AuditLog[]> {
    return db.auditLogs
      .where('houseId')
      .equals(houseId)
      .reverse()
      .sortBy('timestamp')
      .then((logs) => logs.slice(0, limit));
  },

  // --- HOUSE ---
  async getActiveHouse(): Promise<House | null> {
    const house = await db.houses.toCollection().first();
    return house || null;
  },

  async saveHouse(house: House, actor = 'Manager'): Promise<void> {
    await db.houses.put(house);
    await this.logActivity(
      house.id,
      actor,
      'Updated House Settings',
      `Updated settings for ${house.name} (Currency: ${house.currency}, Mode: ${house.pricingMode})`,
      'settings'
    );
  },

  async updateHouseMonth(houseId: string, monthKey: string, actor = 'Manager'): Promise<void> {
    await db.houses.update(houseId, {
      activeMonthKey: monthKey,
      updatedAt: new Date().toISOString(),
    });
    await this.logActivity(
      houseId,
      actor,
      'Changed Active Month',
      `Switched accounting period to ${monthKey}`,
      'house'
    );
  },

  // --- MEMBERS ---
  async getMembers(houseId: string, includeDeleted = false): Promise<Member[]> {
    if (includeDeleted) {
      return db.members.where('houseId').equals(houseId).toArray();
    }
    return db.members
      .where('houseId')
      .equals(houseId)
      .filter((m) => !m.isDeleted)
      .toArray();
  },

  async saveMember(member: Member, actor = 'Manager'): Promise<void> {
    await db.members.put(member);
    await this.logActivity(
      member.houseId,
      actor,
      'Saved Member',
      `Saved member "${member.name}" (${member.role}, Phone: ${member.phone || 'N/A'})`,
      'member'
    );
  },

  async softDeleteMember(id: string, actor = 'Manager'): Promise<void> {
    const mem = await db.members.get(id);
    await db.members.update(id, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (mem) {
      await this.logActivity(
        mem.houseId,
        actor,
        'Deleted Member (Trash)',
        `Moved member "${mem.name}" to trash bin`,
        'member'
      );
    }
  },

  async restoreMember(id: string, actor = 'Manager'): Promise<void> {
    const mem = await db.members.get(id);
    await db.members.update(id, {
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: new Date().toISOString(),
    });
    if (mem) {
      await this.logActivity(
        mem.houseId,
        actor,
        'Restored Member',
        `Restored member "${mem.name}" from trash bin`,
        'member'
      );
    }
  },

  async permanentlyDeleteMember(id: string, actor = 'Manager'): Promise<void> {
    const mem = await db.members.get(id);
    await db.transaction('rw', [db.members, db.mealEntries, db.expenses, db.deposits, db.auditLogs], async () => {
      await db.members.delete(id);
      await db.mealEntries.where('memberId').equals(id).delete();
      await db.expenses.where('buyerId').equals(id).delete();
      await db.deposits.where('memberId').equals(id).delete();
    });
    if (mem) {
      await this.logActivity(
        mem.houseId,
        actor,
        'Permanently Deleted Member',
        `Permanently erased member "${mem.name}" and associated records`,
        'member'
      );
    }
  },

  // --- MEALS ---
  async getMealsForMonth(houseId: string, monthKey: string, includeDeleted = false): Promise<MealEntry[]> {
    if (includeDeleted) {
      return db.mealEntries.where({ houseId, monthKey }).toArray();
    }
    return db.mealEntries
      .where({ houseId, monthKey })
      .filter((m) => !m.isDeleted)
      .toArray();
  },

  async getMealsForDate(houseId: string, date: string): Promise<MealEntry[]> {
    return db.mealEntries
      .where({ houseId, date })
      .filter((m) => !m.isDeleted)
      .toArray();
  },

  async saveMealEntries(entries: MealEntry[], actor = 'Manager'): Promise<void> {
    await db.mealEntries.bulkPut(entries);
    if (entries.length > 0) {
      const date = entries[0].date;
      const totalMeals = entries.reduce((s, e) => s + e.totalMeals, 0);
      await this.logActivity(
        entries[0].houseId,
        actor,
        'Logged Daily Meals',
        `Recorded ${totalMeals} total meals across ${entries.length} members on ${date}`,
        'meal'
      );
    }
  },

  async softDeleteMeal(id: string): Promise<void> {
    await db.mealEntries.update(id, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  async restoreMeal(id: string): Promise<void> {
    await db.mealEntries.update(id, {
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: new Date().toISOString(),
    });
  },

  async permanentlyDeleteMeal(id: string): Promise<void> {
    await db.mealEntries.delete(id);
  },

  // --- SPECIAL MEALS ---
  async getSpecialMeals(houseId: string, monthKey: string, includeDeleted = false): Promise<SpecialMeal[]> {
    if (includeDeleted) {
      return db.specialMeals.where({ houseId, monthKey }).toArray();
    }
    return db.specialMeals
      .where({ houseId, monthKey })
      .filter((sm) => !sm.isDeleted)
      .toArray();
  },

  async saveSpecialMeal(meal: SpecialMeal, actor = 'Manager'): Promise<void> {
    await db.specialMeals.put(meal);
    await this.logActivity(
      meal.houseId,
      actor,
      'Saved Special Meal / Feast',
      `Recorded special feast "${meal.title}" (Cost: ৳${meal.cost}, Attendees: ${meal.attendeeMemberIds.length}) on ${meal.date}`,
      'special_meal'
    );
  },

  async softDeleteSpecialMeal(id: string, actor = 'Manager'): Promise<void> {
    const sm = await db.specialMeals.get(id);
    await db.specialMeals.update(id, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (sm) {
      await this.logActivity(
        sm.houseId,
        actor,
        'Deleted Special Meal',
        `Moved special meal "${sm.title}" to trash`,
        'special_meal'
      );
    }
  },

  // --- EXPENSES ---
  async getExpensesForMonth(houseId: string, monthKey: string, includeDeleted = false): Promise<Expense[]> {
    if (includeDeleted) {
      return db.expenses.where({ houseId, monthKey }).toArray();
    }
    return db.expenses
      .where({ houseId, monthKey })
      .filter((e) => !e.isDeleted)
      .reverse()
      .sortBy('date');
  },

  async saveExpense(expense: Expense, actor = 'Manager'): Promise<void> {
    await db.expenses.put(expense);
    await this.logActivity(
      expense.houseId,
      actor,
      'Saved Expense / Bazar',
      `Recorded "${expense.title}" (৳${expense.amount}, Category: ${expense.category}, Type: ${expense.expenseType}) on ${expense.date}`,
      'expense'
    );
  },

  async softDeleteExpense(id: string, actor = 'Manager'): Promise<void> {
    const exp = await db.expenses.get(id);
    await db.expenses.update(id, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (exp) {
      await this.logActivity(
        exp.houseId,
        actor,
        'Deleted Expense (Trash)',
        `Moved expense "${exp.title}" (৳${exp.amount}) to trash bin`,
        'expense'
      );
    }
  },

  async restoreExpense(id: string, actor = 'Manager'): Promise<void> {
    const exp = await db.expenses.get(id);
    await db.expenses.update(id, {
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: new Date().toISOString(),
    });
    if (exp) {
      await this.logActivity(
        exp.houseId,
        actor,
        'Restored Expense',
        `Restored expense "${exp.title}" (৳${exp.amount}) from trash`,
        'expense'
      );
    }
  },

  async permanentlyDeleteExpense(id: string): Promise<void> {
    await db.expenses.delete(id);
  },

  // --- DEPOSITS ---
  async getDepositsForMonth(houseId: string, monthKey: string, includeDeleted = false): Promise<Deposit[]> {
    if (includeDeleted) {
      return db.deposits.where({ houseId, monthKey }).toArray();
    }
    return db.deposits
      .where({ houseId, monthKey })
      .filter((d) => !d.isDeleted)
      .reverse()
      .sortBy('date');
  },

  async saveDeposit(deposit: Deposit, actor = 'Manager'): Promise<void> {
    await db.deposits.put(deposit);
    await this.logActivity(
      deposit.houseId,
      actor,
      'Recorded Deposit',
      `Recorded deposit of ৳${deposit.amount} via ${deposit.method.toUpperCase()} on ${deposit.date}`,
      'deposit'
    );
  },

  async softDeleteDeposit(id: string, actor = 'Manager'): Promise<void> {
    const dep = await db.deposits.get(id);
    await db.deposits.update(id, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (dep) {
      await this.logActivity(
        dep.houseId,
        actor,
        'Deleted Deposit (Trash)',
        `Moved deposit of ৳${dep.amount} to trash bin`,
        'deposit'
      );
    }
  },

  async restoreDeposit(id: string, actor = 'Manager'): Promise<void> {
    const dep = await db.deposits.get(id);
    await db.deposits.update(id, {
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: new Date().toISOString(),
    });
    if (dep) {
      await this.logActivity(
        dep.houseId,
        actor,
        'Restored Deposit',
        `Restored deposit of ৳${dep.amount} from trash`,
        'deposit'
      );
    }
  },

  async permanentlyDeleteDeposit(id: string): Promise<void> {
    await db.deposits.delete(id);
  },

  // --- TRASH BIN QUERIES ---
  async getTrashItems(houseId: string) {
    const [members, meals, expenses, deposits, specialMeals] = await Promise.all([
      db.members.where('houseId').equals(houseId).filter((m) => m.isDeleted).toArray(),
      db.mealEntries.where('houseId').equals(houseId).filter((m) => m.isDeleted).toArray(),
      db.expenses.where('houseId').equals(houseId).filter((e) => e.isDeleted).toArray(),
      db.deposits.where('houseId').equals(houseId).filter((d) => d.isDeleted).toArray(),
      db.specialMeals.where('houseId').equals(houseId).filter((sm) => sm.isDeleted).toArray(),
    ]);
    return { members, meals, expenses, deposits, specialMeals };
  },

  async emptyTrash(houseId: string, actor = 'Manager'): Promise<void> {
    await db.transaction('rw', [db.members, db.mealEntries, db.expenses, db.deposits, db.specialMeals, db.auditLogs], async () => {
      await db.members.where('houseId').equals(houseId).filter((m) => m.isDeleted).delete();
      await db.mealEntries.where('houseId').equals(houseId).filter((m) => m.isDeleted).delete();
      await db.expenses.where('houseId').equals(houseId).filter((e) => e.isDeleted).delete();
      await db.deposits.where('houseId').equals(houseId).filter((d) => d.isDeleted).delete();
      await db.specialMeals.where('houseId').equals(houseId).filter((sm) => sm.isDeleted).delete();
    });
    await this.logActivity(
      houseId,
      actor,
      'Emptied Trash Bin',
      'Permanently cleared all soft-deleted records',
      'settings'
    );
  },

  // --- BACKUP & RESTORE ---
  async exportFullBackup(): Promise<BackupData> {
    const [houses, members, accountingPeriods, mealEntries, specialMeals, expenses, deposits, auditLogs] =
      await Promise.all([
        db.houses.toArray(),
        db.members.toArray(),
        db.accountingPeriods.toArray(),
        db.mealEntries.toArray(),
        db.specialMeals.toArray(),
        db.expenses.toArray(),
        db.deposits.toArray(),
        db.auditLogs.toArray(),
      ]);

    return {
      schemaVersion: 1,
      application: "Bachelors' Meal Manager",
      appVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        houses,
        members,
        accountingPeriods,
        mealEntries,
        specialMeals,
        expenses,
        deposits,
        auditLogs,
      },
    };
  },

  async restoreBackup(backup: BackupData, actor = 'Manager'): Promise<void> {
    if (!backup || !backup.data) {
      throw new Error('Invalid backup file format.');
    }

    await db.transaction(
      'rw',
      [
        db.houses,
        db.members,
        db.accountingPeriods,
        db.mealEntries,
        db.specialMeals,
        db.expenses,
        db.deposits,
        db.auditLogs,
      ],
      async () => {
        await db.houses.clear();
        await db.members.clear();
        await db.accountingPeriods.clear();
        await db.mealEntries.clear();
        await db.specialMeals.clear();
        await db.expenses.clear();
        await db.deposits.clear();
        await db.auditLogs.clear();

        if (backup.data.houses?.length) await db.houses.bulkPut(backup.data.houses);
        if (backup.data.members?.length) await db.members.bulkPut(backup.data.members);
        if (backup.data.accountingPeriods?.length) await db.accountingPeriods.bulkPut(backup.data.accountingPeriods);
        if (backup.data.mealEntries?.length) await db.mealEntries.bulkPut(backup.data.mealEntries);
        if (backup.data.specialMeals?.length) await db.specialMeals.bulkPut(backup.data.specialMeals);
        if (backup.data.expenses?.length) await db.expenses.bulkPut(backup.data.expenses);
        if (backup.data.deposits?.length) await db.deposits.bulkPut(backup.data.deposits);
        if (backup.data.auditLogs?.length) await db.auditLogs.bulkPut(backup.data.auditLogs);
      }
    );

    const house = await this.getActiveHouse();
    if (house) {
      await this.logActivity(
        house.id,
        actor,
        'Restored Database Backup',
        `Successfully restored full database backup from ${backup.exportedAt}`,
        'settings'
      );
    }
  },

  async resetAllData(): Promise<void> {
    await db.transaction(
      'rw',
      [
        db.houses,
        db.members,
        db.accountingPeriods,
        db.mealEntries,
        db.specialMeals,
        db.expenses,
        db.deposits,
        db.auditLogs,
      ],
      async () => {
        await db.houses.clear();
        await db.members.clear();
        await db.accountingPeriods.clear();
        await db.mealEntries.clear();
        await db.specialMeals.clear();
        await db.expenses.clear();
        await db.deposits.clear();
        await db.auditLogs.clear();
      }
    );
  },
};
