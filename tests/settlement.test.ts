import { describe, expect, it } from 'vitest';
import { computeMinimumCashFlowSettlement, roundCurrency } from '../src/domain/calculations';
import { MemberHisabSummary } from '../src/domain/types';

describe('Minimum Cash Flow Debt Settlement Engine (CSC 3110)', () => {
  const createMemberSummary = (
    id: string,
    name: string,
    netBalance: number
  ): MemberHisabSummary => ({
    memberId: id,
    memberName: name,
    role: 'member',
    isActive: true,
    totalBreakfast: 0,
    totalLunch: 0,
    totalDinner: 0,
    totalExtra: 0,
    totalMeals: 10,
    mealCost: 400,
    utilityCost: 100,
    feastCost: 0,
    totalCost: 500,
    totalDeposit: 500 + netBalance,
    netBalance,
    status: netBalance > 0.01 ? 'credit' : netBalance < -0.01 ? 'due' : 'settled',
  });

  it('handles zero balances gracefully when all members are settled', () => {
    const summaries: MemberHisabSummary[] = [
      createMemberSummary('m1', 'Rahim', 0),
      createMemberSummary('m2', 'Karim', 0),
      createMemberSummary('m3', 'Sakib', 0),
    ];

    const plan = computeMinimumCashFlowSettlement(summaries, '2026-09', '৳');

    expect(plan.isFullySettled).toBe(true);
    expect(plan.transactionsCount).toBe(0);
    expect(plan.transactions.length).toBe(0);
    expect(plan.totalSettledAmount).toBe(0);
  });

  it('settles a direct single-debtor single-creditor transaction', () => {
    // Karim owes ৳500, Rahim is in credit ৳500
    const summaries: MemberHisabSummary[] = [
      createMemberSummary('m1', 'Rahim', 500),
      createMemberSummary('m2', 'Karim', -500),
    ];

    const plan = computeMinimumCashFlowSettlement(summaries, '2026-09', '৳');

    expect(plan.transactionsCount).toBe(1);
    expect(plan.transactions[0]).toEqual({
      fromMemberId: 'm2',
      fromMemberName: 'Karim',
      toMemberId: 'm1',
      toMemberName: 'Rahim',
      amount: 500,
      formattedAmount: '৳ 500.00',
    });
    expect(plan.totalSettledAmount).toBe(500);
    expect(plan.isFullySettled).toBe(true);
  });

  it('optimally settles 3-member bachelor mess hisab with minimum transactions', () => {
    // Karim owes 500. Rahim is owed 400. Sakib is owed 100.
    // Total due (-500) == Total credit (+500).
    const summaries: MemberHisabSummary[] = [
      createMemberSummary('m1', 'Rahim', 400),
      createMemberSummary('m2', 'Karim', -500),
      createMemberSummary('m3', 'Sakib', 100),
    ];

    const plan = computeMinimumCashFlowSettlement(summaries, '2026-09', '৳');

    // Should generate at most N - 1 = 2 transactions
    expect(plan.transactionsCount).toBe(2);
    expect(plan.totalSettledAmount).toBe(500);
    expect(plan.isFullySettled).toBe(true);

    // Transaction 1: Karim pays Rahim ৳400 (max debtor to max creditor)
    expect(plan.transactions[0].fromMemberName).toBe('Karim');
    expect(plan.transactions[0].toMemberName).toBe('Rahim');
    expect(plan.transactions[0].amount).toBe(400);

    // Transaction 2: Karim pays Sakib ৳100
    expect(plan.transactions[1].fromMemberName).toBe('Karim');
    expect(plan.transactions[1].toMemberName).toBe('Sakib');
    expect(plan.transactions[1].amount).toBe(100);
  });

  it('proves the |E| <= N - 1 transaction minimization theorem on 5 members', () => {
    // N = 5 members
    // m1: -1000, m2: -500, m3: +800, m4: +500, m5: +200
    // Total debts = 1500, Total credits = 1500
    const summaries: MemberHisabSummary[] = [
      createMemberSummary('m1', 'Debtor 1', -1000),
      createMemberSummary('m2', 'Debtor 2', -500),
      createMemberSummary('m3', 'Creditor 1', 800),
      createMemberSummary('m4', 'Creditor 2', 500),
      createMemberSummary('m5', 'Creditor 3', 200),
    ];

    const plan = computeMinimumCashFlowSettlement(summaries, '2026-09', '৳');

    // Theorem: At most N - 1 transactions = 4
    expect(plan.transactionsCount).toBeLessThanOrEqual(4);
    expect(plan.totalSettledAmount).toBe(1500);
    expect(plan.isFullySettled).toBe(true);

    // Verify Conservation of Money:
    // Sum of amounts paid by debtors must equal sum of amounts received by creditors
    const debtorPayments = new Map<string, number>();
    const creditorReceipts = new Map<string, number>();

    for (const tx of plan.transactions) {
      debtorPayments.set(tx.fromMemberId, (debtorPayments.get(tx.fromMemberId) || 0) + tx.amount);
      creditorReceipts.set(tx.toMemberId, (creditorReceipts.get(tx.toMemberId) || 0) + tx.amount);
    }

    expect(roundCurrency(debtorPayments.get('m1') || 0)).toBe(1000);
    expect(roundCurrency(debtorPayments.get('m2') || 0)).toBe(500);
    expect(roundCurrency(creditorReceipts.get('m3') || 0)).toBe(800);
    expect(roundCurrency(creditorReceipts.get('m4') || 0)).toBe(500);
    expect(roundCurrency(creditorReceipts.get('m5') || 0)).toBe(200);
  });

  it('handles floating point pennies without divergence', () => {
    const summaries: MemberHisabSummary[] = [
      createMemberSummary('m1', 'Rahim', 333.33),
      createMemberSummary('m2', 'Karim', -333.33),
    ];

    const plan = computeMinimumCashFlowSettlement(summaries, '2026-09', '৳');

    expect(plan.transactionsCount).toBe(1);
    expect(plan.transactions[0].amount).toBe(333.33);
    expect(plan.isFullySettled).toBe(true);
  });
});
