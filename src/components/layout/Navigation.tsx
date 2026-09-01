import {
  FileText,
  Flame,
  History,
  LayoutDashboard,
  PieChart,
  Settings,
  ShoppingBag,
  Table,
  Trash2,
  Users,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';
import React from 'react';
import { useI18n } from '../../i18n';

export type TabType =
  | 'dashboard'
  | 'meals_daily'
  | 'meals_grid'
  | 'special_meals'
  | 'expenses'
  | 'deposits'
  | 'members'
  | 'reports'
  | 'analytics'
  | 'history'
  | 'trash'
  | 'settings';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  trashCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  trashCount = 0,
}) => {
  const { t } = useI18n();

  const navItems = [
    { id: 'dashboard' as TabType, label: t('dashboard'), icon: <LayoutDashboard size={20} /> },
    { id: 'meals_daily' as TabType, label: t('dailyMeals'), icon: <UtensilsCrossed size={20} /> },
    { id: 'meals_grid' as TabType, label: t('monthlyGrid'), icon: <Table size={20} /> },
    { id: 'special_meals' as TabType, label: 'Special Feasts', icon: <Flame size={20} color="#ec4899" /> },
    { id: 'expenses' as TabType, label: t('expenses'), icon: <ShoppingBag size={20} /> },
    { id: 'deposits' as TabType, label: t('deposits'), icon: <Wallet size={20} /> },
    { id: 'members' as TabType, label: t('members'), icon: <Users size={20} /> },
    { id: 'reports' as TabType, label: t('reports'), icon: <FileText size={20} /> },
    { id: 'analytics' as TabType, label: t('analytics'), icon: <PieChart size={20} /> },
    { id: 'history' as TabType, label: 'Activity Log', icon: <History size={20} color="var(--info-text)" /> },
    {
      id: 'trash' as TabType,
      label: t('trash'),
      icon: <Trash2 size={20} />,
      badge: trashCount > 0 ? trashCount : undefined,
    },
    { id: 'settings' as TabType, label: t('settings'), icon: <Settings size={20} /> },
  ];

  // Mobile bottom navigation items (top 5 primary items + overflow in sidebar)
  const mobileItems = [
    { id: 'dashboard' as TabType, label: t('dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'meals_daily' as TabType, label: t('meals'), icon: <UtensilsCrossed size={18} /> },
    { id: 'special_meals' as TabType, label: 'Feasts', icon: <Flame size={18} /> },
    { id: 'expenses' as TabType, label: t('expenses'), icon: <ShoppingBag size={18} /> },
    { id: 'reports' as TabType, label: t('reports'), icon: <FileText size={18} /> },
    { id: 'history' as TabType, label: 'Log', icon: <History size={18} /> },
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="sidebar">
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              {item.icon}
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  style={{
                    background: 'var(--danger-bg)',
                    color: 'var(--danger-text)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="bottom-nav">
        {mobileItems.map((item) => (
          <button
            key={item.id}
            className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onSelectTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};
