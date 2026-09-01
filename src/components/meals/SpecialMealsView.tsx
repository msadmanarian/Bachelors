import {
  Calendar,
  Edit,
  Flame,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { Member, SpecialMeal } from '../../domain/types';
import { useI18n } from '../../i18n';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { useToast } from '../ui/Toast';

interface SpecialMealsViewProps {
  specialMeals: SpecialMeal[];
  members: Member[];
  onOpenAddModal: () => void;
  onEditSpecialMeal: (meal: SpecialMeal) => void;
  onDeleteSpecialMeal: (id: string) => Promise<void>;
}

export const SpecialMealsView: React.FC<SpecialMealsViewProps> = ({
  specialMeals,
  members,
  onOpenAddModal,
  onEditSpecialMeal,
  onDeleteSpecialMeal,
}) => {
  const { t, formatCurrency } = useI18n();
  const { showToast } = useToast();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const memberMap = new Map(members.map((m) => [m.id, m]));

  const activeSpecialMeals = specialMeals.filter((sm) => !sm.isDeleted);
  const totalFeastCost = activeSpecialMeals.reduce((sum, sm) => sum + sm.cost, 0);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await onDeleteSpecialMeal(deleteTargetId);
      showToast('Special meal moved to Trash Bin');
    } catch (err) {
      showToast('Failed to delete special meal', 'error');
    } finally {
      setDeleteTargetId(null);
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
          borderLeft: '4px solid #ec4899',
        }}
      >
        <div>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={20} color="#ec4899" />
            <span>Special Feasts & Event Meals</span>
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            High-value special meals (Friday Biryani, Eid feasts, guest dinners) split strictly among participating members
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Feast Spend</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ec4899' }}>
              {formatCurrency(totalFeastCost)}
            </div>
          </div>

          <button className="btn btn-primary" onClick={onOpenAddModal} style={{ background: '#ec4899' }}>
            <Plus size={16} />
            <span>Add Special Feast</span>
          </button>
        </div>
      </div>

      {/* List */}
      {activeSpecialMeals.length === 0 ? (
        <EmptyState
          title="No Special Feasts Recorded Yet"
          description="Log special meals like Friday beef/chicken biryani, mutton feasts, or guest dinners to split costs only among attendees."
          icon={<Flame size={28} />}
          actionLabel="Add Special Feast"
          onAction={onOpenAddModal}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeSpecialMeals.map((sm) => {
            const buyer = memberMap.get(sm.buyerId);
            const attendeeCount = sm.attendeeMemberIds.length;
            const perPersonCost = attendeeCount > 0 ? sm.cost / attendeeCount : sm.cost;

            return (
              <div
                key={sm.id}
                className="card"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(236, 72, 153, 0.15)',
                      color: '#ec4899',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Flame size={24} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {sm.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '3px' }}>
                      <span>{sm.date}</span>
                      <span>•</span>
                      <span>Paid by: <strong>{buyer?.name || 'Unknown'}</strong></span>
                      <span>•</span>
                      <span>
                        <strong>{attendeeCount}</strong> Attendees (৳{perPersonCost.toFixed(2)} each)
                      </span>
                    </div>

                    {/* Attendee Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                      {sm.attendeeMemberIds.map((id) => (
                        <span
                          key={id}
                          style={{
                            background: 'var(--bg-surface)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.72rem',
                            fontWeight: 500,
                          }}
                        >
                          {memberMap.get(id)?.name || id}
                        </span>
                      ))}
                    </div>

                    {sm.note && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                        Note: {sm.note}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ec4899' }}>
                    {formatCurrency(sm.cost)}
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className="btn-icon"
                      onClick={() => onEditSpecialMeal(sm)}
                      title="Edit Special Feast"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => setDeleteTargetId(sm.id)}
                      title="Delete"
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
        title="Delete Special Meal?"
        message="This special meal entry will be moved to the Trash Bin."
        confirmText="Move to Trash"
        isDangerous={true}
      />
    </div>
  );
};
