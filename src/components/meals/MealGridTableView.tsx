import { Edit2, Table as TableIcon } from 'lucide-react';
import React, { useState } from 'react';
import { MealEntry, Member } from '../../domain/types';
import { useI18n } from '../../i18n';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

interface MealGridTableViewProps {
  houseId: string;
  monthKey: string;
  members: Member[];
  meals: MealEntry[];
  onSaveMeal: (meal: MealEntry) => Promise<void>;
}

export const MealGridTableView: React.FC<MealGridTableViewProps> = ({
  houseId,
  monthKey,
  members,
  meals,
  onSaveMeal,
}) => {
  const { t } = useI18n();
  const { showToast } = useToast();

  const [selectedCell, setSelectedCell] = useState<{
    member: Member;
    day: number;
    meal: MealEntry | null;
  } | null>(null);

  const [editB, setEditB] = useState(0);
  const [editL, setEditL] = useState(0);
  const [editD, setEditD] = useState(0);

  // Determine number of days in the month
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Build lookup map: `${memberId}-${date}` -> MealEntry
  const mealMap = new Map<string, MealEntry>();
  for (const m of meals) {
    if (!m.isDeleted && m.monthKey === monthKey) {
      mealMap.set(`${m.memberId}-${m.date}`, m);
    }
  }

  const handleCellClick = (member: Member, day: number) => {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${monthKey}-${dayStr}`;
    const found = mealMap.get(`${member.id}-${dateStr}`) || null;

    setSelectedCell({ member, day, meal: found });
    setEditB(found ? found.breakfast : 0);
    setEditL(found ? found.lunch : 0);
    setEditD(found ? found.dinner : 0);
  };

  const handleSaveCell = async () => {
    if (!selectedCell) return;
    const dayStr = selectedCell.day < 10 ? `0${selectedCell.day}` : `${selectedCell.day}`;
    const dateStr = `${monthKey}-${dayStr}`;
    const total = Math.round((editB + editL + editD) * 10) / 10;

    const entryToSave: MealEntry = {
      id: selectedCell.meal?.id || `meal-${selectedCell.member.id}-${dateStr}`,
      houseId,
      memberId: selectedCell.member.id,
      date: dateStr,
      monthKey,
      breakfast: editB,
      lunch: editL,
      dinner: editD,
      extra: 0,
      totalMeals: total,
      isDeleted: false,
      createdAt: selectedCell.meal?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSaveMeal(entryToSave);
      showToast(`Updated meals for ${selectedCell.member.name} on ${dateStr}`);
      setSelectedCell(null);
    } catch (err) {
      showToast('Failed to update meal', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TableIcon size={20} color="var(--primary)" />
            <span>Monthly Meal Grid Sheet — {monthKey}</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Tap or click any cell to edit member meals for that specific day
          </p>
        </div>
      </div>

      <div className="table-container">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="sticky-col sticky-col-header" style={{ minWidth: '150px' }}>
                {t('name')}
              </th>
              {daysArray.map((d) => (
                <th key={d} style={{ minWidth: '40px' }}>
                  {d}
                </th>
              ))}
              <th style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', minWidth: '70px' }}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              let memberMonthTotal = 0;

              return (
                <tr key={member.id}>
                  <td className="sticky-col">
                    <div style={{ fontWeight: 600 }}>{member.name}</div>
                  </td>

                  {daysArray.map((day) => {
                    const dayStr = day < 10 ? `0${day}` : `${day}`;
                    const dateStr = `${monthKey}-${dayStr}`;
                    const entry = mealMap.get(`${member.id}-${dateStr}`);
                    const mTotal = entry ? entry.totalMeals : 0;
                    memberMonthTotal += mTotal;

                    return (
                      <td
                        key={day}
                        onClick={() => handleCellClick(member, day)}
                        style={{
                          cursor: 'pointer',
                          fontWeight: mTotal > 0 ? 700 : 400,
                          color: mTotal > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                          background: mTotal > 0 ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                          transition: 'background 0.15s ease',
                        }}
                        title={`Click to edit: ${member.name} (Day ${day})`}
                      >
                        {mTotal > 0 ? mTotal : '-'}
                      </td>
                    );
                  })}

                  <td
                    style={{
                      background: 'var(--primary-subtle)',
                      fontWeight: 800,
                      color: 'var(--primary)',
                    }}
                  >
                    {Math.round(memberMonthTotal * 10) / 10}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--bg-surface)', fontWeight: 800 }}>
              <td className="sticky-col" style={{ fontWeight: 800 }}>
                Day Total
              </td>
              {daysArray.map((day) => {
                const dayStr = day < 10 ? `0${day}` : `${day}`;
                const dateStr = `${monthKey}-${dayStr}`;
                let colSum = 0;
                for (const member of members) {
                  const entry = mealMap.get(`${member.id}-${dateStr}`);
                  if (entry) colSum += entry.totalMeals;
                }
                return <td key={day}>{colSum > 0 ? Math.round(colSum * 10) / 10 : '-'}</td>;
              })}
              <td style={{ background: 'var(--primary)', color: '#fff', fontWeight: 800 }}>
                {Math.round(
                  meals
                    .filter((m) => !m.isDeleted && m.monthKey === monthKey)
                    .reduce((sum, m) => sum + m.totalMeals, 0) * 10
                ) / 10}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Edit Cell Modal */}
      {selectedCell && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCell(null)}
          title={`Edit Meals: ${selectedCell.member.name} (${monthKey}-${
            selectedCell.day < 10 ? `0${selectedCell.day}` : selectedCell.day
          })`}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setSelectedCell(null)}>
                {t('cancel')}
              </button>
              <button className="btn btn-primary" onClick={handleSaveCell}>
                {t('saveChanges')}
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">{t('breakfast')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={editB}
                  onChange={(e) => setEditB(parseFloat(e.target.value) || 0)}
                  className="form-input"
                />
                <button className="btn btn-secondary" onClick={() => setEditB(0.5)}>0.5</button>
                <button className="btn btn-secondary" onClick={() => setEditB(1.0)}>1.0</button>
                <button className="btn btn-secondary" onClick={() => setEditB(0)}>0</button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('lunch')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={editL}
                  onChange={(e) => setEditL(parseFloat(e.target.value) || 0)}
                  className="form-input"
                />
                <button className="btn btn-secondary" onClick={() => setEditL(1.0)}>1.0</button>
                <button className="btn btn-secondary" onClick={() => setEditL(1.5)}>1.5</button>
                <button className="btn btn-secondary" onClick={() => setEditL(0)}>0</button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('dinner')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={editD}
                  onChange={(e) => setEditD(parseFloat(e.target.value) || 0)}
                  className="form-input"
                />
                <button className="btn btn-secondary" onClick={() => setEditD(1.0)}>1.0</button>
                <button className="btn btn-secondary" onClick={() => setEditD(1.5)}>1.5</button>
                <button className="btn btn-secondary" onClick={() => setEditD(0)}>0</button>
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 700,
              }}
            >
              <span>Total for Day:</span>
              <span style={{ color: 'var(--primary)' }}>
                {Math.round((editB + editL + editD) * 10) / 10} meals
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
