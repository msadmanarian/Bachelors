import React, { useEffect, useState } from 'react';
import { Member, SpecialMeal } from '../../domain/types';
import { useI18n } from '../../i18n';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

interface SpecialMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: SpecialMeal) => Promise<void>;
  houseId: string;
  members: Member[];
  specialMealToEdit?: SpecialMeal | null;
  defaultMonthKey: string;
}

export const SpecialMealModal: React.FC<SpecialMealModalProps> = ({
  isOpen,
  onClose,
  onSave,
  houseId,
  members,
  specialMealToEdit,
  defaultMonthKey,
}) => {
  const { t } = useI18n();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [cost, setCost] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [guestCount, setGuestCount] = useState('0');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (specialMealToEdit) {
      setTitle(specialMealToEdit.title);
      setCost(specialMealToEdit.cost.toString());
      setBuyerId(specialMealToEdit.buyerId);
      setDate(specialMealToEdit.date);
      setSelectedMemberIds(specialMealToEdit.attendeeMemberIds || []);
      setGuestCount(specialMealToEdit.guestCount ? specialMealToEdit.guestCount.toString() : '0');
      setNote(specialMealToEdit.note || '');
    } else {
      setTitle('');
      setCost('');
      setBuyerId(members[0]?.id || '');
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedMemberIds(members.filter((m) => m.isActive).map((m) => m.id));
      setGuestCount('0');
      setNote('');
    }
  }, [specialMealToEdit, isOpen, members]);

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    setSelectedMemberIds(members.map((m) => m.id));
  };

  const handleDeselectAll = () => {
    setSelectedMemberIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numCost = parseFloat(cost);
    if (!title.trim()) {
      showToast('Please enter a title for the special meal/feast', 'error');
      return;
    }
    if (isNaN(numCost) || numCost <= 0) {
      showToast('Please enter a valid cost', 'error');
      return;
    }
    if (selectedMemberIds.length === 0) {
      showToast('Please select at least one attending member', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const monthKey = date.substring(0, 7);
      const newSpecialMeal: SpecialMeal = {
        id: specialMealToEdit ? specialMealToEdit.id : `sm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        houseId,
        monthKey,
        date,
        title: title.trim(),
        cost: numCost,
        buyerId,
        attendeeMemberIds: selectedMemberIds,
        guestCount: parseInt(guestCount, 10) || 0,
        note: note.trim() || undefined,
        isDeleted: false,
        createdAt: specialMealToEdit ? specialMealToEdit.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(newSpecialMeal);
      showToast(specialMealToEdit ? 'Special meal updated!' : 'Special meal / feast recorded!');
      onClose();
    } catch (err) {
      showToast('Failed to save special meal', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const perPersonShare =
    selectedMemberIds.length > 0 && parseFloat(cost) > 0
      ? (parseFloat(cost) / selectedMemberIds.length).toFixed(2)
      : '0.00';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={specialMealToEdit ? 'Edit Special Feast / Meal' : 'Add Special Feast / Event Meal'}
      maxWidth="560px"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : t('saveChanges')}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-group">
          <label className="form-label">Occasion / Feast Title *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Friday Mutton Kacchi Feast, Birthday Dinner"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Total Feast Cost (৳) *</label>
            <input
              type="number"
              step="any"
              min="1"
              className="form-input"
              placeholder="e.g. 2400"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('date')} *</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Paid / Sponsored By *</label>
            <select
              className="form-select"
              value={buyerId}
              onChange={(e) => setBuyerId(e.target.value)}
              required
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Extra Guests Count (Optional)</label>
            <input
              type="number"
              min="0"
              className="form-input"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
            />
          </div>
        </div>

        {/* Participating Members Checkbox List */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              Participating Attendees ({selectedMemberIds.length}/{members.length})
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                onClick={handleSelectAll}
              >
                All
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                onClick={handleDeselectAll}
              >
                Clear
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '8px',
              maxHeight: '160px',
              overflowY: 'auto',
              padding: '10px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            {members.map((m) => {
              const isChecked = selectedMemberIds.includes(m.id);
              return (
                <label
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: 'var(--radius-sm)',
                    background: isChecked ? 'var(--primary-subtle)' : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleMember(m.id)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span>{m.name}</span>
                </label>
              );
            })}
          </div>

          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginTop: '6px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Cost per participating member:</span>
            <strong style={{ color: 'var(--primary)' }}>৳ {perPersonShare}</strong>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t('note')} (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Cooked beef kacchi with special spices and borhani"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
