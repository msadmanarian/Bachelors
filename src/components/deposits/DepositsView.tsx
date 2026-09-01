import {
  CreditCard,
  Edit,
  Plus,
  Search,
  Trash2,
  Wallet,
} from 'lucide-react';
import React, { useState } from 'react';
import { Deposit, Member } from '../../domain/types';
import { useI18n } from '../../i18n';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { useToast } from '../ui/Toast';

interface DepositsViewProps {
  deposits: Deposit[];
  members: Member[];
  onOpenAddModal: () => void;
  onEditDeposit: (deposit: Deposit) => void;
  onDeleteDeposit: (id: string) => Promise<void>;
}

export const DepositsView: React.FC<DepositsViewProps> = ({
  deposits,
  members,
  onOpenAddModal,
  onEditDeposit,
  onDeleteDeposit,
}) => {
  const { t, formatCurrency } = useI18n();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const memberMap = new Map(members.map((m) => [m.id, m]));

  const filteredDeposits = deposits.filter((dep) => {
    if (dep.isDeleted) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const memberName = memberMap.get(dep.memberId)?.name.toLowerCase() || '';
      return (
        memberName.includes(q) ||
        dep.method.toLowerCase().includes(q) ||
        (dep.trxId && dep.trxId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalCollected = deposits
    .filter((d) => !d.isDeleted)
    .reduce((sum, d) => sum + d.amount, 0);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await onDeleteDeposit(deleteTargetId);
      showToast('Deposit moved to Trash Bin');
    } catch (err) {
      showToast('Failed to delete deposit', 'error');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const getMethodBadgeStyle = (method: string) => {
    switch (method) {
      case 'bkash':
        return { background: 'rgba(226, 19, 110, 0.15)', color: '#e2136e' };
      case 'nagad':
        return { background: 'rgba(247, 148, 29, 0.15)', color: '#f7941d' };
      case 'rocket':
        return { background: 'rgba(140, 43, 142, 0.15)', color: '#8c2b8e' };
      case 'bank':
        return { background: 'var(--info-bg)', color: 'var(--info-text)' };
      default:
        return { background: 'var(--success-bg)', color: 'var(--success-text)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          borderLeft: '4px solid var(--primary)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t('totalDeposits')} (Current Month)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
            {formatCurrency(totalCollected)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {deposits.filter((d) => !d.isDeleted).length} Total Deposit Transactions
          </div>
        </div>

        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={16} />
          <span>{t('addDeposit')}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search by member name, method, or transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px' }}
          />
        </div>
      </div>

      {/* Deposits List */}
      {filteredDeposits.length === 0 ? (
        <EmptyState
          title={t('noDepositsYet')}
          description="Record advance deposits received from members (via Cash, bKash, Nagad, etc.) to keep cash-in-hand accounts balanced."
          icon={<Wallet size={28} />}
          actionLabel={t('addDeposit')}
          onAction={onOpenAddModal}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredDeposits.map((dep) => {
            const member = memberMap.get(dep.memberId);
            const badgeStyle = getMethodBadgeStyle(dep.method);

            return (
              <div
                key={dep.id}
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
                      background: 'var(--primary-subtle)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Wallet size={20} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {member?.name || 'Unknown Member'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                      <span>{dep.date}</span>
                      <span>•</span>
                      <span
                        style={{
                          padding: '1px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          ...badgeStyle,
                        }}
                      >
                        {dep.method}
                      </span>
                      {dep.trxId && <span>• TrxID: {dep.trxId}</span>}
                    </div>
                    {dep.note && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                        Note: {dep.note}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    +{formatCurrency(dep.amount)}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      className="btn-icon"
                      onClick={() => onEditDeposit(dep)}
                      title="Edit Deposit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => setDeleteTargetId(dep.id)}
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
        title="Delete Deposit?"
        message="This deposit record will be moved to the Trash Bin and excluded from active hisab calculations."
        confirmText="Move to Trash"
        isDangerous={true}
      />
    </div>
  );
};
