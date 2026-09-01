import {
  Calendar,
  CheckCircle2,
  Mail,
  Phone,
  Shield,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';
import React from 'react';
import { MemberHisabSummary, MealEntry, Deposit } from '../../domain/types';
import { useI18n } from '../../i18n';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: MemberHisabSummary;
  monthKey: string;
  meals: MealEntry[];
  deposits: Deposit[];
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  isOpen,
  onClose,
  summary,
  monthKey,
  meals,
  deposits,
}) => {
  const { t, formatCurrency } = useI18n();

  const memberMeals = meals.filter((m) => m.memberId === summary.memberId && !m.isDeleted);
  const memberDeposits = deposits.filter((d) => d.memberId === summary.memberId && !d.isDeleted);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Member Voucher — ${summary.memberName}`}
      maxWidth="600px"
      footer={
        <button className="btn btn-secondary" onClick={onClose}>
          Close Voucher
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Profile Card Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{summary.memberName}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
              <Shield size={14} />
              <span>{summary.role === 'manager' ? 'Mess Manager' : 'Member'}</span>
              {summary.phone && (
                <>
                  <span>•</span>
                  <Phone size={14} />
                  <span>{summary.phone}</span>
                </>
              )}
            </div>
          </div>
          <div>
            <Badge variant={summary.status}>
              {summary.status === 'credit'
                ? `+${formatCurrency(summary.netBalance)} ${t('inCredit')}`
                : summary.status === 'due'
                ? `${formatCurrency(summary.netBalance)} ${t('due')}`
                : `${formatCurrency(0)} ${t('settled')}`}
            </Badge>
          </div>
        </div>

        {/* Financial Breakdown Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
          }}
        >
          <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('totalMeals')}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{summary.totalMeals}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>B:{summary.totalBreakfast} L:{summary.totalLunch} D:{summary.totalDinner}</div>
          </div>

          <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Meal Cost</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>{formatCurrency(summary.mealCost)}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>At current meal rate</div>
          </div>

          <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Utility Share</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--info-text)' }}>{formatCurrency(summary.utilityCost)}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fixed bills share</div>
          </div>

          <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Deposits</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(summary.totalDeposit)}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{memberDeposits.length} payments</div>
          </div>
        </div>

        {/* Total Reconciliation Formula Box */}
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--primary-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            color: 'var(--text-primary)',
            borderLeft: '4px solid var(--primary)',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '4px' }}>Hisab Reconciliation Formula:</div>
          <div>
            Total Cost = Meal Cost ({formatCurrency(summary.mealCost)}) + Utilities ({formatCurrency(summary.utilityCost)}) = <strong>{formatCurrency(summary.totalCost)}</strong>
          </div>
          <div>
            Net Balance = Total Deposits ({formatCurrency(summary.totalDeposit)}) - Total Cost ({formatCurrency(summary.totalCost)}) = <strong>{formatCurrency(summary.netBalance)}</strong>
          </div>
        </div>

        {/* Recent Deposits Tab */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wallet size={16} color="var(--primary)" />
            <span>Deposit History for {monthKey} ({memberDeposits.length})</span>
          </h4>
          {memberDeposits.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No deposits recorded yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {memberDeposits.map((d) => (
                <div
                  key={d.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <span>{d.date}</span> • <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{d.method}</span>
                    {d.note && <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>({d.note})</span>}
                  </div>
                  <strong style={{ color: 'var(--primary)' }}>+{formatCurrency(d.amount)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
