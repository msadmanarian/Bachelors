import React, { useEffect, useState } from 'react';
import {
  Expense,
  ExpenseCategory,
  ExpenseType,
  Member,
} from '../../domain/types';
import { validateExpenseInput } from '../../domain/validation';
import { useI18n } from '../../i18n';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => Promise<void>;
  houseId: string;
  members: Member[];
  expenseToEdit?: Expense | null;
  defaultMonthKey: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  houseId,
  members,
  expenseToEdit,
  defaultMonthKey,
}) => {
  const { t } = useI18n();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('grocery');
  const [expenseType, setExpenseType] = useState<ExpenseType>('meal_bazar');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setAmount(expenseToEdit.amount.toString());
      setBuyerId(expenseToEdit.buyerId);
      setCategory(expenseToEdit.category);
      setExpenseType(expenseToEdit.expenseType);
      setDate(expenseToEdit.date);
      setNote(expenseToEdit.note || '');
    } else {
      setTitle('');
      setAmount('');
      setBuyerId(members[0]?.id || '');
      setCategory('grocery');
      setExpenseType('meal_bazar');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
    }
    setErrors({});
  }, [expenseToEdit, isOpen, members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const validation = validateExpenseInput(title, numAmount, buyerId, date);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const monthKey = date.substring(0, 7);
      const newExpense: Expense = {
        id: expenseToEdit ? expenseToEdit.id : `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        houseId,
        buyerId,
        title: title.trim(),
        amount: numAmount,
        category,
        expenseType,
        date,
        monthKey,
        note: note.trim() || undefined,
        isDeleted: false,
        createdAt: expenseToEdit ? expenseToEdit.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(newExpense);
      showToast(expenseToEdit ? 'Expense updated successfully!' : 'Expense added successfully!');
      onClose();
    } catch (err) {
      showToast('Failed to save expense', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expenseToEdit ? t('editExpense') : t('addExpense')}
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
          <label className="form-label">Expense Description / Items *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Miniket Rice 25kg, Soybean Oil 5L"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Amount (৳) *</label>
            <input
              type="number"
              step="any"
              min="1"
              className="form-input"
              placeholder="e.g. 1850"
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
            <label className="form-label">{t('buyer')} *</label>
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
            {errors.buyerId && <div className="form-error">{errors.buyerId}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">{t('category')}</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            >
              <option value="grocery">{t('grocery')}</option>
              <option value="vegetables">{t('vegetables')}</option>
              <option value="meat_fish">{t('meat_fish')}</option>
              <option value="gas">{t('gas')}</option>
              <option value="electricity">{t('electricity')}</option>
              <option value="internet">{t('internet')}</option>
              <option value="house_rent">{t('house_rent')}</option>
              <option value="cook_salary">{t('cook_salary')}</option>
              <option value="cleaning">{t('cleaning')}</option>
              <option value="feast">{t('feast')}</option>
              <option value="other">{t('other')}</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Expense Nature / Calculation Pool *</label>
          <select
            className="form-select"
            value={expenseType}
            onChange={(e) => setExpenseType(e.target.value as ExpenseType)}
          >
            <option value="meal_bazar">{t('mealBazarType')}</option>
            <option value="shared_utility">{t('sharedUtilityType')}</option>
            <option value="feast">{t('feastType')}</option>
          </select>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {expenseType === 'meal_bazar'
              ? 'This expense is pooled into the total mess food cost and divided by total meals.'
              : expenseType === 'shared_utility'
              ? 'This fixed bill is divided equally among all active mess members.'
              : 'This special meal cost is split among attendees.'}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t('note')} (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Bought from local market, receipt attached"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
