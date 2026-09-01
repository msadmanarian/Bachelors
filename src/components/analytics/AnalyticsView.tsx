import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  ShoppingBag,
  Users,
} from 'lucide-react';
import React from 'react';
import { Expense, MealEntry, MonthlyHisabReport } from '../../domain/types';
import { useI18n } from '../../i18n';

interface AnalyticsViewProps {
  hisabReport: MonthlyHisabReport;
  expenses: Expense[];
  meals: MealEntry[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  hisabReport,
  expenses,
  meals,
}) => {
  const { t, formatCurrency } = useI18n();

  const activeExpenses = expenses.filter((e) => !e.isDeleted);

  // Group expenses by category
  const categoryTotals = new Map<string, number>();
  for (const exp of activeExpenses) {
    const prev = categoryTotals.get(exp.category) || 0;
    categoryTotals.set(exp.category, prev + exp.amount);
  }

  const categoryArray = Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage:
        hisabReport.totalGroupExpense > 0
          ? Math.round((amount / hisabReport.totalGroupExpense) * 100)
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Colors for progress bars
  const colors = [
    '#10b981',
    '#f59e0b',
    '#6366f1',
    '#ec4899',
    '#8b5cf6',
    '#14b8a6',
    '#f97316',
    '#06b6d4',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieIcon size={20} color="var(--primary)" />
          <span>Expense & Consumption Analytics — {hisabReport.monthKey}</span>
        </h3>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          Visual insights into your mess expenditure distribution and member consumption
        </p>
      </div>

      <div className="grid-2">
        {/* Category Breakdown Bars */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
              <ShoppingBag size={18} color="var(--accent)" />
              <span>Expenditure by Category</span>
            </h4>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Total: {formatCurrency(hisabReport.totalGroupExpense)}
            </span>
          </div>

          {categoryArray.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No expense data to display for this month.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {categoryArray.map((item, idx) => (
                <div key={item.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {item.category.replace('_', ' ')}
                    </span>
                    <span>
                      <strong>{formatCurrency(item.amount)}</strong> ({item.percentage}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${item.percentage}%`,
                        background: colors[idx % colors.length],
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease-out',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Member Meal Share */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
              <Users size={18} color="var(--primary)" />
              <span>Member Meal Consumption Share</span>
            </h4>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Total: {hisabReport.totalMeals} meals
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {hisabReport.membersSummary.map((m, idx) => {
              const mealPct =
                hisabReport.totalMeals > 0
                  ? Math.round((m.totalMeals / hisabReport.totalMeals) * 100)
                  : 0;

              return (
                <div key={m.memberId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{m.memberName}</span>
                    <span>
                      <strong>{m.totalMeals} meals</strong> ({mealPct}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${mealPct}%`,
                        background: colors[idx % colors.length],
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease-out',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
