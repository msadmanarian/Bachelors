import {
  Edit,
  Eye,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  Deposit,
  MealEntry,
  Member,
  MemberHisabSummary,
} from '../../domain/types';
import { useI18n } from '../../i18n';
import { Badge } from '../ui/Badge';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { useToast } from '../ui/Toast';
import { MemberDetailModal } from './MemberDetailModal';

interface MembersViewProps {
  members: Member[];
  summaries: MemberHisabSummary[];
  monthKey: string;
  meals: MealEntry[];
  deposits: Deposit[];
  onOpenAddModal: () => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (id: string) => Promise<void>;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  summaries,
  monthKey,
  meals,
  deposits,
  onOpenAddModal,
  onEditMember,
  onDeleteMember,
}) => {
  const { t, formatCurrency } = useI18n();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewSummary, setViewSummary] = useState<MemberHisabSummary | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const summaryMap = new Map(summaries.map((s) => [s.memberId, s]));

  const filteredMembers = members.filter((m) => {
    if (m.isDeleted) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q) || (m.phone && m.phone.includes(q));
    }
    return true;
  });

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await onDeleteMember(deleteTargetId);
      showToast('Member moved to Trash Bin');
    } catch (err) {
      showToast('Failed to delete member', 'error');
    } finally {
      setDeleteTargetId(null);
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
        }}
      >
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Mess Member Directory
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            {members.filter((m) => !m.isDeleted).length} Total Members (
            {members.filter((m) => !m.isDeleted && m.isActive).length} Active)
          </div>
        </div>

        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={16} />
          <span>{t('addMember')}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search members by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px' }}
          />
        </div>
      </div>

      {/* Members Cards List */}
      {filteredMembers.length === 0 ? (
        <EmptyState
          title={t('noMembersYet')}
          description="Add housemates and mess members to begin tracking daily meals, bazar purchases, and monthly bills."
          icon={<Users size={28} />}
          actionLabel={t('addMember')}
          onAction={onOpenAddModal}
        />
      ) : (
        <div className="grid-2">
          {filteredMembers.map((member) => {
            const sum = summaryMap.get(member.id);

            return (
              <div
                key={member.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  padding: '16px',
                  opacity: member.isActive ? 1 : 0.75,
                }}
              >
                {/* Member Top Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: 'var(--radius-full)',
                        background: member.role === 'manager' ? 'var(--info-bg)' : 'var(--primary-subtle)',
                        color: member.role === 'manager' ? 'var(--info-text)' : 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        flexShrink: 0,
                      }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {member.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        {member.role === 'manager' ? (
                          <span style={{ color: 'var(--info-text)', fontWeight: 600 }}>Mess Manager</span>
                        ) : (
                          <span>Member</span>
                        )}
                        {member.phone && (
                          <>
                            <span>•</span>
                            <Phone size={12} />
                            <span>{member.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {sum && (
                    <Badge variant={sum.status}>
                      {sum.status === 'credit'
                        ? `+${formatCurrency(sum.netBalance)}`
                        : sum.status === 'due'
                        ? `${formatCurrency(sum.netBalance)}`
                        : `${formatCurrency(0)}`}
                    </Badge>
                  )}
                </div>

                {/* Monthly Quick Numbers */}
                {sum && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px',
                      padding: '10px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('totalMeals')}</div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{sum.totalMeals}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Cost</div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{formatCurrency(sum.totalCost)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Paid</div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>
                        {formatCurrency(sum.totalDeposit)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '10px',
                  }}
                >
                  {sum && (
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => setViewSummary(sum)}
                    >
                      <Eye size={14} />
                      <span>View Voucher</span>
                    </button>
                  )}
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={() => onEditMember(member)}
                  >
                    <Edit size={14} />
                    <span>{t('editMember')}</span>
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => setDeleteTargetId(member.id)}
                    title="Delete member"
                    style={{ color: 'var(--danger-text)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Member Detail Voucher Modal */}
      {viewSummary && (
        <MemberDetailModal
          isOpen={true}
          onClose={() => setViewSummary(null)}
          summary={viewSummary}
          monthKey={monthKey}
          meals={meals}
          deposits={deposits}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Member?"
        message="This member will be moved to the Trash Bin. Historical meal and expense records are preserved safely."
        confirmText="Move to Trash"
        isDangerous={true}
      />
    </div>
  );
};
