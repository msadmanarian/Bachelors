import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  Moon,
  Shield,
  Sun,
  User,
  Utensils,
} from 'lucide-react';
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n';

interface NavbarProps {
  houseName: string;
  activeMonthKey: string;
  onMonthChange: (newMonthKey: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  houseName,
  activeMonthKey,
  onMonthChange,
  theme,
  onToggleTheme,
  onOpenProfile,
}) => {
  const { lang, setLang, t } = useI18n();
  const { user, lockApp } = useAuth();

  // Parse YYYY-MM
  const [yearStr, monthStr] = activeMonthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const dateObj = new Date(year, month - 1, 1);
  const monthName = dateObj.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    month: 'short',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const formatted = `${prevYear}-${prevMonth < 10 ? `0${prevMonth}` : prevMonth}`;
    onMonthChange(formatted);
  };

  const handleNextMonth = () => {
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    const formatted = `${nextYear}-${nextMonth < 10 ? `0${nextMonth}` : nextMonth}`;
    onMonthChange(formatted);
  };

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'bn' : 'en');
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo-icon">
          <Utensils size={18} />
        </div>
        <div>
          <div style={{ lineHeight: 1.1, fontSize: '0.975rem' }}>{houseName || t('appName')}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {t('appName')}
          </div>
        </div>
      </div>

      <div className="navbar-actions">
        {/* Month Selector */}
        <div className="month-selector">
          <button
            className="month-nav-btn"
            onClick={handlePrevMonth}
            aria-label="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          <span>{monthName}</span>
          <button
            className="month-nav-btn"
            onClick={handleNextMonth}
            aria-label="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Language Switcher */}
        <button
          className="btn-icon"
          onClick={toggleLanguage}
          title={lang === 'en' ? 'Switch to Bangla' : 'Switch to English'}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}
        >
          <Globe size={18} />
          <span>{lang === 'en' ? 'বাংলা' : 'EN'}</span>
        </button>

        {/* Theme Switcher */}
        <button
          className="btn-icon"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Google Profile / Security Avatar */}
        <button
          className="btn-icon"
          onClick={onOpenProfile}
          title={`Logged in as ${user?.name || 'User'} (Click for Security & Profile)`}
          style={{ padding: '4px', borderRadius: 'var(--radius-full)', position: 'relative' }}
        >
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.name}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-full)',
                border: '2px solid var(--primary)',
              }}
            />
          ) : (
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={16} />
            </div>
          )}
          {user?.pinCode && (
            <span
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                background: 'var(--primary)',
                color: '#fff',
                borderRadius: 'var(--radius-full)',
                padding: '2px',
                display: 'flex',
              }}
            >
              <Lock size={10} />
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
