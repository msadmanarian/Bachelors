import {
  AlertTriangle,
  RotateCcw,
  ShoppingBag,
  Trash2,
  Users,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  Deposit,
  Expense,
  MealEntry,
  Member,
} from '../../domain/types';
import { useI18n } from '../../i18n';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { useToast } from '../ui/Toast';

interface TrashViewProps {
  trashItems: {
    members: Member[];
    meals: MealEntry[];
    expenses: Expense[];
    deposits: Deposit[];
  };
  onRestoreMember: (id: string) => Promise<void>;
  onPermanentDeleteMember: (id: string) => Promise<void>;
  onRestoreExpense: (id: string) => Promise<void>;
  onPermanentDeleteExpense: (id: string) => Promise<void>;
  onRestoreDeposit: (id: string) => Promise<void>;
  onPermanentDeleteDeposit: (id: string) => Promise<void>;
  onEmptyTrash: () => Promise<void>;
}

export const TrashView: React.FC<TrashViewProps> = ({
  trashItems,
  onRestoreMember,
  onPermanentDeleteMember,
  onRestoreExpense,
  onPermanentDeleteExpense,
  onRestoreDeposit,
  onPermanentDeleteDeposit,
  onEmptyTrash,
}) => {
  const { t, formatCurrency } = useI18n();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'all' | 'members' | 'expenses' | 'deposits'>('all');
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);
  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);

  const totalTrashCount =
    trashItems.members.length +
    trashItems.expenses.length +
    trashItems.deposits.length;

  const handleEmptyTrash = async () => {
    setIsEmptyingTrash(true);
    try {
      await onEmptyTrash();
      showToast('Trash bin emptied permanently');
    } catch (err) {
      showToast('Failed to empty trash', 'error');
    } finally {
      setIsEmptyingTrash(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          borderLeft: '4px solid var(--danger-text)',
        }}
      >
        <div>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trash2 size={20} color="var(--danger-text)" />
            <span>Trash Bin & Recovery Center</span>
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Restore mistakenly deleted members, bazar expenses, or deposits back into your accounts
          </p>
        </div>

        {totalTrashCount > 0 && (
          <button
            className="btn btn-danger"
            onClick={() => setConfirmEmptyOpen(true)}
            disabled={isEmptyingTrash}
          >
            <Trash2 size={16} />
            <span>{t('emptyTrash')}</span>
          </button>
        )}
      </div>

      {/* Main Content */}
      {totalTrashCount === 0 ? (
        <EmptyState
          title={t('trashEmpty')}
          description="There are no deleted items in the trash bin. Deleted records will appear here for safe recovery."
          icon={<Trash2 size={28} />}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Deleted Members */}
          {trashItems.members.length > 0 && (
            <div className="card">
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--info-text)" />
                <span>Deleted Members ({trashItems.members.length})</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {trashItems.members.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Deleted on: {m.deletedAt ? new Date(m.deletedAt).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => onRestoreMember(m.id)}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <RotateCcw size={14} />
                        <span>{t('restore')}</span>
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => onPermanentDeleteMember(m.id)}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <Trash2 size={14} />
                        <span>{t('permanentDelete')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deleted Expenses */}
          {trashItems.expenses.length > 0 && (
            <div className="card">
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={18} color="var(--accent)" />
                <span>Deleted Expenses ({trashItems.expenses.length})</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {trashItems.expenses.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{e.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {e.date} • Amount: {formatCurrency(e.amount)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => onRestoreExpense(e.id)}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <RotateCcw size={14} />
                        <span>{t('restore')}</span>
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => onPermanentDeleteExpense(e.id)}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <Trash2 size={14} />
                        <span>{t('permanentDelete')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deleted Deposits */}
          {trashItems.deposits.length > 0 && (
            <div className="card">
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={18} color="var(--primary)" />
                <span>Deleted Deposits ({trashItems.deposits.length})</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {trashItems.deposits.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>Deposit Amount: {formatCurrency(d.amount)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {d.date} • Method: {d.method.toUpperCase()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => onRestoreDeposit(d.id)}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <RotateCcw size={14} />
                        <span>{t('restore')}</span>
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => onPermanentDeleteDeposit(d.id)}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <Trash2 size={14} />
                        <span>{t('permanentDelete')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirm Empty Trash Dialog */}
      <ConfirmDialog
        isOpen={confirmEmptyOpen}
        onClose={() => setConfirmEmptyOpen(false)}
        onConfirm={handleEmptyTrash}
        title="Empty Trash Bin Permanently?"
        message="This will permanently delete all items in the Trash Bin. This action cannot be undone."
        confirmText="Empty Trash Bin"
        isDangerous={true}
      />
    </div>
  );
};
