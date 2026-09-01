import React, { useEffect, useState } from 'react';
import { Deposit, Member, PaymentMethod } from '../../domain/types';
import { validateDepositInput } from '../../domain/validation';
import { useI18n } from '../../i18n';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deposit: Deposit) => Promise<void>;
  houseId: string;
  members: Member[];
  depositToEdit?: Deposit | null;
  defaultMonthKey: string;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onSave,
  houseId,
  members,
  depositToEdit,
  defaultMonthKey,
}) => {
  const { t } = useI18n();
  const { showToast } = useToast();

  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [trxId, setTrxId] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (depositToEdit) {
      setMemberId(depositToEdit.memberId);
      setAmount(depositToEdit.amount.toString());
      setMethod(depositToEdit.method);
      setDate(depositToEdit.date);
      setTrxId(depositToEdit.trxId || '');
      setNote(depositToEdit.note || '');
    } else {
      setMemberId(members[0]?.id || '');
      setAmount('');
      setMethod('cash');
      setDate(new Date().toISOString().split('T')[0]);
      setTrxId('');
      setNote('');
    }
    setErrors({});
  }, [depositToEdit, isOpen, members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const validation = validateDepositInput(memberId, numAmount, date);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const monthKey = date.substring(0, 7);
      const newDeposit: Deposit = {
        id: depositToEdit ? depositToEdit.id : `dep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        houseId,
        memberId,
        amount: numAmount,
        method,
        date,
        monthKey,
        trxId: trxId.trim() || undefined,
        note: note.trim() || undefined,
        isDeleted: false,
        createdAt: depositToEdit ? depositToEdit.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(newDeposit);
      showToast(depositToEdit ? 'Deposit updated successfully!' : 'Deposit recorded successfully!');
      onClose();
    } catch (err) {
      showToast('Failed to save deposit', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={depositToEdit ? t('editDeposit') : t('addDeposit')}
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
          <label className="form-label">{t('name')} (Member) *</label>
          <select
            className="form-select"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            required
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.role === 'manager' ? 'Manager' : 'Member'})
              </option>
            ))}
          </select>
          {errors.memberId && <div className="form-error">{errors.memberId}</div>}
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Deposit Amount (৳) *</label>
            <input
              type="number"
              step="any"
              min="1"
              className="form-input"
              placeholder="e.g. 2000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {errors.amount && <div className="form-error">{errors.amount}</div>}
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
            {errors.date && <div className="form-error">{errors.date}</div>}
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Payment Method *</label>
            <select
              className="form-select"
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            >
              <option value="cash">{t('cash')}</option>
              <option value="bkash">{t('bkash')}</option>
              <option value="nagad">{t('nagad')}</option>
              <option value="rocket">{t('rocket')}</option>
              <option value="bank">{t('bank')}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('trxId')} (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. BK998124X"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t('note')} (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Advance mess deposit for this month"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
