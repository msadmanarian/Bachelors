import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Plus,
  Minus,
  Save,
  CheckCheck,
  XCircle,
  Coffee,
  SunMedium,
  Moon,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MealEntry, Member } from '../../domain/types';
import { useI18n } from '../../i18n';
import { useToast } from '../ui/Toast';

interface DailyMealEntryViewProps {
  houseId: string;
  members: Member[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  existingMeals: MealEntry[];
  yesterdayMeals: MealEntry[];
  onSaveMeals: (entries: MealEntry[]) => Promise<void>;
}

interface MemberMealState {
  breakfast: number;
  lunch: number;
  dinner: number;
  extra: number;
}

export const DailyMealEntryView: React.FC<DailyMealEntryViewProps> = ({
  houseId,
  members,
  selectedDate,
  onDateChange,
  existingMeals,
  yesterdayMeals,
  onSaveMeals,
}) => {
  const { t } = useI18n();
  const { showToast } = useToast();

  const [mealState, setMealState] = useState<Record<string, MemberMealState>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize or update mealState when existingMeals or selectedDate changes
  useEffect(() => {
    const newState: Record<string, MemberMealState> = {};
    for (const member of members) {
      const found = existingMeals.find((m) => m.memberId === member.id && !m.isDeleted);
      if (found) {
        newState[member.id] = {
          breakfast: found.breakfast,
          lunch: found.lunch,
          dinner: found.dinner,
          extra: found.extra,
        };
      } else {
        // Standard default: Lunch 1.0, Dinner 1.0 = 2.0 meals/day (Breakfast = 0 unless added)
        newState[member.id] = { breakfast: 0, lunch: 1.0, dinner: 1.0, extra: 0 };
      }
    }
    setMealState(newState);
  }, [members, existingMeals, selectedDate]);

  const updateMeal = (
    memberId: string,
    field: keyof MemberMealState,
    delta: number
  ) => {
    setMealState((prev) => {
      const current = prev[memberId] || { breakfast: 0, lunch: 1.0, dinner: 1.0, extra: 0 };
      const currentVal = current[field];
      const newVal = Math.max(0, Math.min(10, Math.round((currentVal + delta) * 10) / 10));
      return {
        ...prev,
        [memberId]: {
          ...current,
          [field]: newVal,
        },
      };
    });
  };

  const handleSetStandardTwoMeals = () => {
    setMealState((prev) => {
      const updated = { ...prev };
      for (const m of members) {
        if (m.isActive) {
          updated[m.id] = {
            breakfast: 0,
            lunch: 1.0,
            dinner: 1.0,
            extra: 0,
          };
        }
      }
      return updated;
    });
    showToast('Applied Standard 2.0 Meals (Lunch: 1.0 + Dinner: 1.0) to all members');
  };

  const handleToggleMealTime = (mealTime: 'breakfast' | 'lunch' | 'dinner', value: number) => {
    setMealState((prev) => {
      const updated = { ...prev };
      for (const m of members) {
        if (m.isActive) {
          const current = updated[m.id] || { breakfast: 0, lunch: 0, dinner: 0, extra: 0 };
          const currentVal = current[mealTime];
          updated[m.id] = {
            ...current,
            [mealTime]: currentVal > 0 ? 0 : value,
          };
        }
      }
      return updated;
    });
    showToast(`Toggled ${mealTime} for all active members`);
  };

  const handleSetAllZero = () => {
    setMealState((prev) => {
      const updated = { ...prev };
      for (const m of members) {
        updated[m.id] = { breakfast: 0, lunch: 0, dinner: 0, extra: 0 };
      }
      return updated;
    });
    showToast('Reset all meals to 0 for this date');
  };

  const handleCopyYesterday = () => {
    if (yesterdayMeals.length === 0) {
      showToast('No meals found recorded for yesterday.', 'error');
      return;
    }
    setMealState((prev) => {
      const updated = { ...prev };
      for (const m of members) {
        const yMeal = yesterdayMeals.find((ym) => ym.memberId === m.id && !ym.isDeleted);
        if (yMeal) {
          updated[m.id] = {
            breakfast: yMeal.breakfast,
            lunch: yMeal.lunch,
            dinner: yMeal.dinner,
            extra: yMeal.extra,
          };
        }
      }
      return updated;
    });
    showToast('Copied meals from yesterday successfully!');
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const monthKey = selectedDate.substring(0, 7);
      const entriesToSave: MealEntry[] = members.map((member) => {
        const state = mealState[member.id] || { breakfast: 0, lunch: 0, dinner: 0, extra: 0 };
        const total =
          Math.round((state.breakfast + state.lunch + state.dinner + state.extra) * 10) / 10;
        return {
          id: `meal-${member.id}-${selectedDate}`,
          houseId,
          memberId: member.id,
          date: selectedDate,
          monthKey,
          breakfast: state.breakfast,
          lunch: state.lunch,
          dinner: state.dinner,
          extra: state.extra,
          totalMeals: total,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      await onSaveMeals(entriesToSave);
      showToast('Meals saved successfully!');
    } catch (err) {
      showToast('Error saving meals', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate day totals
  let dayTotalBreakfast = 0;
  let dayTotalLunch = 0;
  let dayTotalDinner = 0;
  let dayGrandTotal = 0;

  for (const m of members) {
    const s = mealState[m.id];
    if (s) {
      dayTotalBreakfast += s.breakfast;
      dayTotalLunch += s.lunch;
      dayTotalDinner += s.dinner;
      dayGrandTotal += s.breakfast + s.lunch + s.dinner + s.extra;
    }
  }

  dayGrandTotal = Math.round(dayGrandTotal * 10) / 10;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Date Header & Quick Actions */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn-icon" onClick={handlePrevDay} aria-label="Previous day">
              <ChevronLeft size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.05rem' }}>
              <Calendar size={18} color="var(--primary)" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="form-input"
                style={{ width: 'auto', padding: '4px 8px', fontWeight: 600 }}
              />
            </div>
            <button className="btn-icon" onClick={handleNextDay} aria-label="Next day">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Quick Helper Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              className="btn btn-primary"
              onClick={handleSetStandardTwoMeals}
              title="Standard Total = Lunch 1.0 + Dinner 1.0 = 2.0 meals/day"
            >
              <CheckCheck size={16} />
              <span>Standard 2 Meals (L+D)</span>
            </button>
            <button className="btn btn-secondary" onClick={handleCopyYesterday} title="Copy meal counts from yesterday">
              <Copy size={16} color="var(--accent)" />
              <span>{t('copyYesterday')}</span>
            </button>
            <button className="btn btn-secondary" onClick={handleSetAllZero} title="Zero out all meals">
              <XCircle size={16} color="var(--danger-text)" />
              <span>{t('setAllZero')}</span>
            </button>
          </div>
        </div>

        {/* Meal Time Quick Batch Toggles */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
            paddingTop: '10px',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Batch Time Toggles:
          </span>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            onClick={() => handleToggleMealTime('breakfast', 0.5)}
          >
            <Coffee size={14} color="#f59e0b" />
            <span>Toggle Breakfast (0.5)</span>
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            onClick={() => handleToggleMealTime('lunch', 1.0)}
          >
            <SunMedium size={14} color="#10b981" />
            <span>Toggle Lunch (1.0)</span>
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            onClick={() => handleToggleMealTime('dinner', 1.0)}
          >
            <Moon size={14} color="#6366f1" />
            <span>Toggle Dinner (1.0)</span>
          </button>
        </div>
      </div>

      {/* Member Meal Steppers List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {members.map((member) => {
          const s = mealState[member.id] || { breakfast: 0, lunch: 1.0, dinner: 1.0, extra: 0 };
          const mTotal = Math.round((s.breakfast + s.lunch + s.dinner + s.extra) * 10) / 10;

          return (
            <div
              key={member.id}
              className="card"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                padding: '14px 18px',
                opacity: member.isActive ? 1 : 0.65,
              }}
            >
              {/* Member Info */}
              <div style={{ minWidth: '160px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.975rem' }}>{member.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {member.role === 'manager' ? 'Mess Manager' : 'Member'} • {mTotal} meals today
                </div>
              </div>

              {/* Steppers for Breakfast, Lunch, Dinner */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
                {/* Breakfast */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {t('breakfast')} (0.5)
                  </span>
                  <div className="stepper-control">
                    <button
                      className="stepper-btn"
                      onClick={() => updateMeal(member.id, 'breakfast', -0.5)}
                      aria-label="Decrease breakfast"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="stepper-val">{s.breakfast}</span>
                    <button
                      className="stepper-btn"
                      onClick={() => updateMeal(member.id, 'breakfast', 0.5)}
                      aria-label="Increase breakfast"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Lunch */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {t('lunch')} (1.0)
                  </span>
                  <div className="stepper-control">
                    <button
                      className="stepper-btn"
                      onClick={() => updateMeal(member.id, 'lunch', -0.5)}
                      aria-label="Decrease lunch"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="stepper-val">{s.lunch}</span>
                    <button
                      className="stepper-btn"
                      onClick={() => updateMeal(member.id, 'lunch', 0.5)}
                      aria-label="Increase lunch"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Dinner */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {t('dinner')} (1.0)
                  </span>
                  <div className="stepper-control">
                    <button
                      className="stepper-btn"
                      onClick={() => updateMeal(member.id, 'dinner', -0.5)}
                      aria-label="Decrease dinner"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="stepper-val">{s.dinner}</span>
                    <button
                      className="stepper-btn"
                      onClick={() => updateMeal(member.id, 'dinner', 0.5)}
                      aria-label="Increase dinner"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Total badge */}
                <div
                  style={{
                    background: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    fontWeight: 800,
                    fontSize: '1rem',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    minWidth: '54px',
                    textAlign: 'center',
                  }}
                >
                  {mTotal}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Save & Day Total Footer */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-elevated)',
          boxShadow: 'var(--shadow-lg)',
          borderTop: '2px solid var(--primary)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t('dayTotal')}:{' '}
          </span>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
            {dayGrandTotal} meals
          </span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            B: {dayTotalBreakfast} | L: {dayTotalLunch} | D: {dayTotalDinner}
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isSaving}
          style={{ padding: '12px 24px', fontSize: '1rem' }}
        >
          <Save size={18} />
          <span>{isSaving ? 'Saving...' : t('saveEntries')}</span>
        </button>
      </div>
    </div>
  );
};
