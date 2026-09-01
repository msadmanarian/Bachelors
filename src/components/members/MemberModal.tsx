import React, { useEffect, useState } from 'react';
import { Member, MemberRole } from '../../domain/types';
import { validateMemberInput } from '../../domain/validation';
import { useI18n } from '../../i18n';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Member) => Promise<void>;
  houseId: string;
  memberToEdit?: Member | null;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  houseId,
  memberToEdit,
}) => {
  const { t } = useI18n();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<MemberRole>('member');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name);
      setPhone(memberToEdit.phone || '');
      setRole(memberToEdit.role);
      setIsActive(memberToEdit.isActive);
    } else {
      setName('');
      setPhone('');
      setRole('member');
      setIsActive(true);
    }
    setErrors({});
  }, [memberToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateMemberInput(name, phone);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const newMember: Member = {
        id: memberToEdit ? memberToEdit.id : `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        houseId,
        name: name.trim(),
        phone: phone.trim() || undefined,
        role,
        isActive,
        isDeleted: false,
        createdAt: memberToEdit ? memberToEdit.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(newMember);
      showToast(memberToEdit ? 'Member updated successfully!' : 'Member added successfully!');
      onClose();
    } catch (err) {
      showToast('Failed to save member', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={memberToEdit ? t('editMember') : t('addMember')}
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
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">{t('name')} *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Rahim Ahmed"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">{t('phone')} (Optional)</label>
          <input
            type="tel"
            className="form-input"
            placeholder="e.g. 01711223344"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {errors.phone && <div className="form-error">{errors.phone}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Role</label>
          <select
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value as MemberRole)}
          >
            <option value="member">{t('memberRole')}</option>
            <option value="manager">{t('manager')}</option>
          </select>
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="isActiveCheck"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
          />
          <label htmlFor="isActiveCheck" style={{ fontSize: '0.9rem', cursor: 'pointer', fontWeight: 500 }}>
            {t('active')} (Includes in shared utility billing)
          </label>
        </div>
      </form>
    </Modal>
  );
};
