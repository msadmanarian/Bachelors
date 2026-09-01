import {
  UtensilsCrossed,
  ShoppingBag,
  Calculator,
  Wallet,
  Plus,
  ArrowRight,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import React from 'react';
import { MonthlyHisabReport, Expense } from '../../domain/types';
import { useI18n } from '../../i18n';
import { Badge } from '../ui/Badge';
import { StatCard } from '../ui/StatCard';
import { TabType } from '../layout/Navigation';

interface DashboardViewProps {
  hisabReport: MonthlyHisabReport;
  expenses: Expense[];
  onNavigate: (tab: TabType) => void;
  onOpenAddExpense: () => void;
  onOpenAddDeposit: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  hisabReport,
  expenses,
  onNavigate,
  onOpenAddExpense,
  onOpenAddDeposit,
}) => {
  const { t, formatCurrency } = useI18n();

  const recentExpenses = expenses.slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards Grid */}
      <div className="grid-4">
        <StatCard
          label={t('totalMeals')}
          value={`${hisabReport.totalMeals} meals`}
          subtext={`B: ${hisabReport.totalBreakfast} | L: ${hisabReport.totalLunch} | D: ${hisabReport.totalDinner}`}
          icon={<UtensilsCrossed size={24} />}
          variant="primary"
        />
        <StatCard
          label={t('totalBazar')}
          value={formatCurrency(hisabReport.totalMealBazarExpense)}
          subtext={`${t('totalGroupCost')}: ${formatCurrency(hisabReport.totalGroupExpense)}`}
          icon={<ShoppingBag size={24} />}
          variant="accent"
        />
        <StatCard
          label={t('mealRate')}
          value={formatCurrency(hisabReport.mealRate)}
          subtext={hisabReport.pricingMode === 'fixed' ? 'Fixed Rate' : 'Dynamic Auto Calculated'}
          icon={<Calculator size={24} />}
          variant="info"
        />
        <StatCard
          label={t('cashInHand')}
          value={formatCurrency(hisabReport.cashInHand)}
          subtext={`${t('totalDeposits')}: ${formatCurrency(hisabReport.totalDeposits)}`}
          icon={<Wallet size={24} />}
          variant="success"
        />
      </div>

      {/* Quick Action Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-surface) 100%)',
          borderLeft: '4px solid var(--primary)',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Quick Actions</h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Log daily meals, record bazar grocery costs or add deposits in one click
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate('meals_daily')}
          >
            <Plus size={16} />
            <span>{t('dailyMeals')}</span>
          </button>
          <button className="btn btn-accent" onClick={onOpenAddExpense}>
            <Plus size={16} />
            <span>{t('addExpense')}</span>
          </button>
          <button className="btn btn-secondary" onClick={onOpenAddDeposit}>
            <Plus size={16} />
            <span>{t('addDeposit')}</span>
          </button>
        </div>
      </div>

      {/* 2-Column Section: Member Balances & Recent Expenses */}
      <div className="grid-2">
        {/* Member Balances Overview */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} color="var(--primary)" />
              <span>Member Balances ({hisabReport.membersSummary.length})</span>
            </h3>
            <button
              className="btn-icon"
              onClick={() => onNavigate('reports')}
              title="View full hisab statement"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {hisabReport.membersSummary.map((m) => (
              <div
                key={m.memberId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>{m.memberName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {m.totalMeals} meals • Cost: {formatCurrency(m.totalCost)} • Paid:{' '}
                    {formatCurrency(m.totalDeposit)}
                  </div>
                </div>
                <div>
                  <Badge variant={m.status}>
                    {m.status === 'credit'
                      ? `+${formatCurrency(m.netBalance)} ${t('inCredit')}`
                      : m.status === 'due'
                      ? `${formatCurrency(m.netBalance)} ${t('due')}`
                      : `${formatCurrency(0)} ${t('settled')}`}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bazar & Bills */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={18} color="var(--accent)" />
              <span>Recent Bazar & Expenses</span>
            </h3>
            <button
              className="btn-icon"
              onClick={() => onNavigate('expenses')}
              title="View all expenses"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          {recentExpenses.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {t('noExpensesYet')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentExpenses.map((exp) => (
                <div
                  key={exp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, paddingRight: '12px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {exp.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {exp.date} • {exp.expenseType === 'meal_bazar' ? 'Meal Bazar' : 'Utility Bill'}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.95rem' }}>
                    {formatCurrency(exp.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
