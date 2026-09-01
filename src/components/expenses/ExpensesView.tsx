import {
  Edit,
  Filter,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { Expense, ExpenseType, Member } from '../../domain/types';
import { useI18n } from '../../i18n';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { useToast } from '../ui/Toast';

interface ExpensesViewProps {
  expenses: Expense[];
  members: Member[];
  onOpenAddModal: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => Promise<void>;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  members,
  onOpenAddModal,
  onEditExpense,
  onDeleteExpense,
}) => {
  const { t, formatCurrency } = useI18n();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ExpenseType | 'all'>('all');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const memberMap = new Map(members.map((m) => [m.id, m]));

  const filteredExpenses = expenses.filter((exp) => {
    if (exp.isDeleted) return false;
    if (filterType !== 'all' && exp.expenseType !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const buyer = memberMap.get(exp.buyerId)?.name.toLowerCase() || '';
      return exp.title.toLowerCase().includes(q) || buyer.includes(q) || exp.category.includes(q);
    }
    return true;
  });

  const totalBazarCost = expenses
    .filter((e) => !e.isDeleted && e.expenseType === 'meal_bazar')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalUtilityCost = expenses
    .filter((e) => !e.isDeleted && e.expenseType === 'shared_utility')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalFeastCost = expenses
    .filter((e) => !e.isDeleted && e.expenseType === 'feast')
    .reduce((sum, e) => sum + e.amount, 0);

  const grandTotalCost = totalBazarCost + totalUtilityCost + totalFeastCost;

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await onDeleteExpense(deleteTargetId);
      showToast('Expense moved to Trash Bin');
    } catch (err) {
      showToast('Failed to delete expense', 'error');
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Overview Cards & Header */}
      <div className="grid-3">
        <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t('totalBazar')}
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>
            {formatCurrency(totalBazarCost)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Included in Meal Rate
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--info-text)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t('utilities')}
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--info-text)', marginTop: '4px' }}>
            {formatCurrency(totalUtilityCost)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Shared equally per member
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t('totalGroupCost')}
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {formatCurrency(grandTotalCost)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {expenses.filter((e) => !e.isDeleted).length} Total Transactions
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <button
            className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('all')}
          >
            All ({expenses.filter((e) => !e.isDeleted).length})
          </button>
          <button
            className={`btn ${filterType === 'meal_bazar' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('meal_bazar')}
          >
            Bazar / Food
          </button>
          <button
            className={`btn ${filterType === 'shared_utility' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('shared_utility')}
          >
            Utilities & Bills
          </button>
          <button
            className={`btn ${filterType === 'feast' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('feast')}
          >
            Feasts
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 240px', maxWidth: '380px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search by description or buyer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '32px' }}
            />
          </div>

          <button className="btn btn-accent" onClick={onOpenAddModal}>
            <Plus size={16} />
            <span>{t('addExpense')}</span>
          </button>
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          title={t('noExpensesYet')}
          description="Click 'Add Bazar / Bill' to record your grocery shopping, vegetables, meat or utility bills."
          icon={<ShoppingBag size={28} />}
          actionLabel={t('addExpense')}
          onAction={onOpenAddModal}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredExpenses.map((exp) => {
            const buyer = memberMap.get(exp.buyerId);
            const isBazar = exp.expenseType === 'meal_bazar';

            return (
              <div
                key={exp.id}
                className="card"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '14px 18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      background: isBazar ? 'rgba(245, 158, 11, 0.15)' : 'var(--info-bg)',
                      color: isBazar ? 'var(--accent)' : 'var(--info-text)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isBazar ? <ShoppingBag size={20} /> : <Zap size={20} />}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {exp.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                      <span>{exp.date}</span>
                      <span>•</span>
                      <span>
                        Paid by: <strong style={{ color: 'var(--text-secondary)' }}>{buyer?.name || 'Unknown'}</strong>
                      </span>
                      <span>•</span>
                      <span
                        style={{
                          background: 'var(--bg-surface)',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.72rem',
                          textTransform: 'capitalize',
                        }}
                      >
                        {exp.category.replace('_', ' ')}
                      </span>
                    </div>
                    {exp.note && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                        Note: {exp.note}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isBazar ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {formatCurrency(exp.amount)}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      className="btn-icon"
                      onClick={() => onEditExpense(exp)}
                      title="Edit Expense"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => setDeleteTargetId(exp.id)}
                      title="Move to Trash Bin"
                      style={{ color: 'var(--danger-text)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Expense?"
        message="This expense will be moved to the Trash Bin. You can restore it anytime or delete it permanently from the Trash tab."
        confirmText="Move to Trash"
        isDangerous={true}
      />
    </div>
  );
};
