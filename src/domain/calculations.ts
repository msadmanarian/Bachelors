import {
  Deposit,
  Expense,
  House,
  MealEntry,
  Member,
  MemberHisabSummary,
  MonthlyHisabReport,
  SpecialMeal,
} from './types';

export interface CalculateHisabParams {
  house: House;
  monthKey: string;
  members: Member[];
  meals: MealEntry[];
  expenses: Expense[];
  deposits: Deposit[];
  specialMeals?: SpecialMeal[];
}

/**
 * Rounds a number safely to 2 decimal places.
 */
export function roundCurrency(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Rounds a meal count to 1 decimal place (e.g., 24.5 meals).
 */
export function roundMeal(num: number): number {
  return Math.round((num + Number.EPSILON) * 10) / 10;
}

/**
 * Deterministic meal accounting calculation engine.
 * Computes meal rates, individual shares, special feast costs, deposits, cash-in-hand, and net settlement balances.
 */
export function calculateMonthlyHisab(params: CalculateHisabParams): MonthlyHisabReport {
  const { house, monthKey, members, meals, expenses, deposits, specialMeals = [] } = params;

  // Filter non-deleted items for this month
  const activeMembers = members.filter((m) => !m.isDeleted);
  const activeMeals = meals.filter((m) => !m.isDeleted && m.monthKey === monthKey);
  const activeExpenses = expenses.filter((e) => !e.isDeleted && e.monthKey === monthKey);
  const activeDeposits = deposits.filter((d) => !d.isDeleted && d.monthKey === monthKey);
  const activeSpecialMeals = specialMeals.filter((sm) => !sm.isDeleted && sm.monthKey === monthKey);

  // 1. Calculate Meal Totals across the group
  let totalBreakfast = 0;
  let totalLunch = 0;
  let totalDinner = 0;
  let totalExtra = 0;
  let totalMeals = 0;

  // Map to hold per-member raw stats
  const memberMealMap = new Map<
    string,
    { b: number; l: number; d: number; e: number; total: number }
  >();

  for (const member of activeMembers) {
    memberMealMap.set(member.id, { b: 0, l: 0, d: 0, e: 0, total: 0 });
  }

  for (const meal of activeMeals) {
    const b = Number(meal.breakfast) || 0;
    const l = Number(meal.lunch) || 0;
    const d = Number(meal.dinner) || 0;
    const e = Number(meal.extra) || 0;
    const mTotal = b + l + d + e;

    totalBreakfast += b;
    totalLunch += l;
    totalDinner += d;
    totalExtra += e;
    totalMeals += mTotal;

    const current = memberMealMap.get(meal.memberId) || { b: 0, l: 0, d: 0, e: 0, total: 0 };
    current.b += b;
    current.l += l;
    current.d += d;
    current.e += e;
    current.total += mTotal;
    memberMealMap.set(meal.memberId, current);
  }

  totalBreakfast = roundMeal(totalBreakfast);
  totalLunch = roundMeal(totalLunch);
  totalDinner = roundMeal(totalDinner);
  totalExtra = roundMeal(totalExtra);
  totalMeals = roundMeal(totalMeals);

  // 2. Classify and Sum Expenses
  let totalMealBazarExpense = 0;
  let totalUtilityExpense = 0;
  let totalFeastExpense = 0;

  // Map to hold member feast cost allocations
  const memberFeastMap = new Map<string, number>();
  for (const member of activeMembers) {
    memberFeastMap.set(member.id, 0);
  }

  for (const exp of activeExpenses) {
    const amount = Number(exp.amount) || 0;
    if (exp.expenseType === 'meal_bazar') {
      totalMealBazarExpense += amount;
    } else if (exp.expenseType === 'shared_utility') {
      totalUtilityExpense += amount;
    } else if (exp.expenseType === 'feast') {
      totalFeastExpense += amount;
      const attendees = exp.attendeeIds && exp.attendeeIds.length > 0
        ? exp.attendeeIds
        : activeMembers.map((m) => m.id);

      const perAttendee = attendees.length > 0 ? amount / attendees.length : 0;
      for (const attendeeId of attendees) {
        if (memberFeastMap.has(attendeeId)) {
          memberFeastMap.set(attendeeId, (memberFeastMap.get(attendeeId) || 0) + perAttendee);
        }
      }
    }
  }

  // Also include SpecialMeal entities into feast calculation
  for (const sm of activeSpecialMeals) {
    const amount = Number(sm.cost) || 0;
    totalFeastExpense += amount;
    const attendees = sm.attendeeMemberIds && sm.attendeeMemberIds.length > 0
      ? sm.attendeeMemberIds
      : activeMembers.map((m) => m.id);

    const perAttendee = attendees.length > 0 ? amount / attendees.length : 0;
    for (const attendeeId of attendees) {
      if (memberFeastMap.has(attendeeId)) {
        memberFeastMap.set(attendeeId, (memberFeastMap.get(attendeeId) || 0) + perAttendee);
      }
    }
  }

  totalMealBazarExpense = roundCurrency(totalMealBazarExpense);
  totalUtilityExpense = roundCurrency(totalUtilityExpense);
  totalFeastExpense = roundCurrency(totalFeastExpense);
  const totalGroupExpense = roundCurrency(totalMealBazarExpense + totalUtilityExpense + totalFeastExpense);

  // 3. Compute Meal Rate
  let mealRate = 0;
  if (house.pricingMode === 'fixed' && house.fixedRate !== undefined && house.fixedRate > 0) {
    mealRate = roundCurrency(house.fixedRate);
  } else {
    mealRate = totalMeals > 0 ? roundCurrency(totalMealBazarExpense / totalMeals) : 0;
  }

  // 4. Calculate Shared Utility per Member
  const activeCount = activeMembers.filter((m) => m.isActive).length || activeMembers.length || 1;
  const perMemberUtility = roundCurrency(totalUtilityExpense / activeCount);

  // 5. Aggregate Member Deposits
  const memberDepositMap = new Map<string, number>();
  let totalDeposits = 0;

  for (const member of activeMembers) {
    memberDepositMap.set(member.id, 0);
  }

  for (const dep of activeDeposits) {
    const amount = Number(dep.amount) || 0;
    totalDeposits += amount;
    const prev = memberDepositMap.get(dep.memberId) || 0;
    memberDepositMap.set(dep.memberId, prev + amount);
  }

  totalDeposits = roundCurrency(totalDeposits);

  // 6. Build Individual Member Summaries
  const membersSummary: MemberHisabSummary[] = activeMembers.map((member) => {
    const mealStats = memberMealMap.get(member.id) || { b: 0, l: 0, d: 0, e: 0, total: 0 };
    const mMeals = roundMeal(mealStats.total);
    const mMealCost = roundCurrency(mMeals * mealRate);
    const mUtility = member.isActive ? perMemberUtility : 0;
    const mFeast = roundCurrency(memberFeastMap.get(member.id) || 0);
    const mTotalCost = roundCurrency(mMealCost + mUtility + mFeast);
    const mDeposit = roundCurrency(memberDepositMap.get(member.id) || 0);
    const netBalance = roundCurrency(mDeposit - mTotalCost);

    let status: 'credit' | 'due' | 'settled' = 'settled';
    if (netBalance > 0.01) {
      status = 'credit';
    } else if (netBalance < -0.01) {
      status = 'due';
    }

    return {
      memberId: member.id,
      memberName: member.name,
      phone: member.phone,
      role: member.role,
      isActive: member.isActive,
      totalBreakfast: roundMeal(mealStats.b),
      totalLunch: roundMeal(mealStats.l),
      totalDinner: roundMeal(mealStats.d),
      totalExtra: roundMeal(mealStats.e),
      totalMeals: mMeals,
      mealCost: mMealCost,
      utilityCost: mUtility,
      feastCost: mFeast,
      totalCost: mTotalCost,
      totalDeposit: mDeposit,
      netBalance,
      status,
    };
  });

  const cashInHand = roundCurrency(totalDeposits - totalGroupExpense);

  return {
    houseId: house.id,
    monthKey,
    pricingMode: house.pricingMode,
    fixedRate: house.fixedRate,
    totalMembers: activeMembers.length,
    activeMembersCount: activeCount,
    totalBreakfast,
    totalLunch,
    totalDinner,
    totalExtra,
    totalMeals,
    totalMealBazarExpense,
    totalUtilityExpense,
    totalFeastExpense,
    totalGroupExpense,
    mealRate,
    totalDeposits,
    cashInHand,
    membersSummary,
  };
}
