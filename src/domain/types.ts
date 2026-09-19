export type PricingMode = 'calculated' | 'fixed';
export type MemberRole = 'manager' | 'member';
export type ExpenseType = 'meal_bazar' | 'shared_utility' | 'feast';
export type ExpenseCategory =
  | 'grocery'
  | 'vegetables'
  | 'meat_fish'
  | 'gas'
  | 'electricity'
  | 'internet'
  | 'house_rent'
  | 'cook_salary'
  | 'cleaning'
  | 'feast'
  | 'other';

export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank' | 'other';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  googleId?: string;
  role: MemberRole;
  pinCode?: string;
  isPinLocked?: boolean;
  linkedMemberId?: string;
  lastLoginAt: string;
}

export interface House {
  id: string;
  name: string;
  code: string;
  currency: string;
  pricingMode: PricingMode;
  fixedRate?: number;
  activeMonthKey: string; // Format: "YYYY-MM" e.g., "2026-09"
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  houseId: string;
  name: string;
  phone?: string;
  email?: string;
  role: MemberRole;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountingPeriod {
  id: string;
  houseId: string;
  monthKey: string; // "YYYY-MM"
  status: 'open' | 'closed';
  closedAt?: string;
  createdAt: string;
}

export interface MealEntry {
  id: string;
  houseId: string;
  memberId: string;
  date: string; // "YYYY-MM-DD"
  monthKey: string; // "YYYY-MM"
  breakfast: number; // default: 0 (or 0.5 if taken)
  lunch: number;     // default: 1.0
  dinner: number;    // default: 1.0 (Standard total = Lunch + Dinner = 2 meals/day)
  extra: number;
  totalMeals: number; // breakfast + lunch + dinner + extra
  note?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialMeal {
  id: string;
  houseId: string;
  monthKey: string;
  date: string; // "YYYY-MM-DD"
  title: string; // e.g., "Friday Beef Biryani Feast"
  cost: number;
  buyerId: string; // Who paid for the special meal ingredients
  attendeeMemberIds: string[]; // Members participating
  guestCount?: number;
  note?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  houseId: string;
  buyerId: string; // Member who paid
  title: string;
  amount: number;
  category: ExpenseCategory;
  expenseType: ExpenseType;
  date: string; // "YYYY-MM-DD"
  monthKey: string; // "YYYY-MM"
  attendeeIds?: string[]; // For feast expenses: specific member IDs participating
  note?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deposit {
  id: string;
  houseId: string;
  memberId: string;
  amount: number;
  method: PaymentMethod;
  date: string; // "YYYY-MM-DD"
  monthKey: string; // "YYYY-MM"
  trxId?: string;
  note?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  houseId: string;
  actorName: string;
  action: string;
  details: string;
  targetType: 'meal' | 'expense' | 'deposit' | 'member' | 'special_meal' | 'house' | 'settings' | 'auth';
  timestamp: string;
}

export interface MemberHisabSummary {
  memberId: string;
  memberName: string;
  phone?: string;
  role: MemberRole;
  isActive: boolean;
  totalBreakfast: number;
  totalLunch: number;
  totalDinner: number;
  totalExtra: number;
  totalMeals: number;
  mealCost: number;
  utilityCost: number;
  feastCost: number;
  totalCost: number;
  totalDeposit: number;
  netBalance: number; // totalDeposit - totalCost
  status: 'credit' | 'due' | 'settled';
}

export interface DebtSettlementTransaction {
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number;
  formattedAmount: string;
}

export interface DebtSettlementPlan {
  monthKey: string;
  totalSettledAmount: number;
  transactionsCount: number;
  isFullySettled: boolean;
  transactions: DebtSettlementTransaction[];
  unsettledResidual: number;
}

export interface MonthlyHisabReport {
  houseId: string;
  monthKey: string;
  pricingMode: PricingMode;
  fixedRate?: number;
  totalMembers: number;
  activeMembersCount: number;
  totalBreakfast: number;
  totalLunch: number;
  totalDinner: number;
  totalExtra: number;
  totalMeals: number;
  totalMealBazarExpense: number;
  totalUtilityExpense: number;
  totalFeastExpense: number;
  totalGroupExpense: number;
  mealRate: number;
  totalDeposits: number;
  cashInHand: number; // totalDeposits - totalGroupExpense
  membersSummary: MemberHisabSummary[];
  settlementPlan?: DebtSettlementPlan;
}

export interface BackupData {
  schemaVersion: number;
  application: string;
  appVersion: string;
  exportedAt: string;
  data: {
    houses: House[];
    members: Member[];
    accountingPeriods: AccountingPeriod[];
    mealEntries: MealEntry[];
    specialMeals?: SpecialMeal[];
    expenses: Expense[];
    deposits: Deposit[];
    auditLogs?: AuditLog[];
    userProfiles?: UserProfile[];
  };
}
