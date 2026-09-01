import { useLiveQuery } from 'dexie-react-hooks';
import React, { useEffect, useState } from 'react';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SecurityLockScreen } from './components/auth/SecurityLockScreen';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { DepositModal } from './components/deposits/DepositModal';
import { DepositsView } from './components/deposits/DepositsView';
import { ExpenseModal } from './components/expenses/ExpenseModal';
import { ExpensesView } from './components/expenses/ExpensesView';
import { AuditHistoryView } from './components/history/AuditHistoryView';
import { Navbar } from './components/layout/Navbar';
import { Navigation, TabType } from './components/layout/Navigation';
import { DailyMealEntryView } from './components/meals/DailyMealEntryView';
import { MealGridTableView } from './components/meals/MealGridTableView';
import { SpecialMealModal } from './components/meals/SpecialMealModal';
import { SpecialMealsView } from './components/meals/SpecialMealsView';
import { MemberModal } from './components/members/MemberModal';
import { MembersView } from './components/members/MembersView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { TrashView } from './components/trash/TrashView';
import { InstallPwaPrompt } from './components/ui/InstallPwaPrompt';
import { useAuth } from './context/AuthContext';
import { db } from './database/db';
import { Repository } from './database/repositories';
import { seedDemoData } from './database/seed';
import { calculateMonthlyHisab } from './domain/calculations';
import {
  AuditLog,
  BackupData,
  Deposit,
  Expense,
  House,
  MealEntry,
  Member,
  SpecialMeal,
} from './domain/types';
import { useI18n } from './i18n';

export const App: React.FC = () => {
  const { t } = useI18n();
  const { user, isPinLocked } = useAuth();

  // Application Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('bmm_theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bmm_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Selected Date for Daily Meals
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Modal States
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositToEdit, setDepositToEdit] = useState<Deposit | null>(null);

  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  const [specialMealModalOpen, setSpecialMealModalOpen] = useState(false);
  const [specialMealToEdit, setSpecialMealToEdit] = useState<SpecialMeal | null>(null);

  // Live Database Queries via Dexie
  const houses = useLiveQuery(() => db.houses.toArray(), []);
  const allMembers = useLiveQuery(() => db.members.toArray(), []);
  const allMeals = useLiveQuery(() => db.mealEntries.toArray(), []);
  const allSpecialMeals = useLiveQuery(() => db.specialMeals.toArray(), []);
  const allExpenses = useLiveQuery(() => db.expenses.toArray(), []);
  const allDeposits = useLiveQuery(() => db.deposits.toArray(), []);
  const allLogs = useLiveQuery(() => db.auditLogs.reverse().sortBy('timestamp'), []);

  // Initialize Default House if DB empty
  useEffect(() => {
    const initApp = async () => {
      const houseCount = await db.houses.count();
      if (houseCount === 0) {
        await seedDemoData();
      }
    };
    initApp();
  }, []);

  const activeHouse: House =
    houses && houses.length > 0
      ? houses[0]
      : {
          id: 'house-default',
          name: "Bachelors' Meal Manager",
          code: 'BMM01',
          currency: '৳',
          pricingMode: 'calculated',
          activeMonthKey: '2026-09',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

  const activeMonthKey = activeHouse.activeMonthKey || '2026-09';

  const members: Member[] = allMembers || [];
  const meals: MealEntry[] = allMeals || [];
  const specialMeals: SpecialMeal[] = allSpecialMeals || [];
  const expenses: Expense[] = allExpenses || [];
  const deposits: Deposit[] = allDeposits || [];
  const logs: AuditLog[] = allLogs || [];

  const currentActor = user?.name || 'Mess Manager';

  // Yesterday date string
  const yesterdayStr = (() => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();

  const existingMealsForDate = meals.filter((m) => m.date === selectedDate);
  const yesterdayMeals = meals.filter((m) => m.date === yesterdayStr);

  // Soft-deleted Trash Items
  const trashItems = {
    members: members.filter((m) => m.isDeleted),
    meals: meals.filter((m) => m.isDeleted),
    expenses: expenses.filter((e) => e.isDeleted),
    deposits: deposits.filter((d) => d.isDeleted),
    specialMeals: specialMeals.filter((sm) => sm.isDeleted),
  };
  const trashCount =
    trashItems.members.length +
    trashItems.expenses.length +
    trashItems.deposits.length +
    trashItems.specialMeals.length;

  // Run Calculation Engine
  const hisabReport = calculateMonthlyHisab({
    house: activeHouse,
    monthKey: activeMonthKey,
    members,
    meals,
    expenses,
    deposits,
    specialMeals,
  });

  // Action Handlers
  const handleMonthChange = async (newMonthKey: string) => {
    await Repository.updateHouseMonth(activeHouse.id, newMonthKey, currentActor);
    if (!selectedDate.startsWith(newMonthKey)) {
      setSelectedDate(`${newMonthKey}-01`);
    }
  };

  const handleSaveMeals = async (entries: MealEntry[]) => {
    await Repository.saveMealEntries(entries, currentActor);
  };

  const handleSaveSingleMeal = async (entry: MealEntry) => {
    await Repository.saveMealEntries([entry], currentActor);
  };

  const handleSaveExpense = async (expense: Expense) => {
    await Repository.saveExpense(expense, currentActor);
  };

  const handleDeleteExpense = async (id: string) => {
    await Repository.softDeleteExpense(id, currentActor);
  };

  const handleSaveDeposit = async (deposit: Deposit) => {
    await Repository.saveDeposit(deposit, currentActor);
  };

  const handleDeleteDeposit = async (id: string) => {
    await Repository.softDeleteDeposit(id, currentActor);
  };

  const handleSaveMember = async (member: Member) => {
    await Repository.saveMember(member, currentActor);
  };

  const handleDeleteMember = async (id: string) => {
    await Repository.softDeleteMember(id, currentActor);
  };

  const handleSaveSpecialMeal = async (meal: SpecialMeal) => {
    await Repository.saveSpecialMeal(meal, currentActor);
  };

  const handleDeleteSpecialMeal = async (id: string) => {
    await Repository.softDeleteSpecialMeal(id, currentActor);
  };

  const handleExportBackup = async () => {
    const backup = await Repository.exportFullBackup();
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bachelors_Meal_Manager_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRestoreBackup = async (data: BackupData) => {
    await Repository.restoreBackup(data, currentActor);
  };

  const handleLoadDemoData = async () => {
    await seedDemoData();
  };

  const handleResetAllData = async () => {
    await Repository.resetAllData();
    await Repository.saveHouse({
      id: 'house-default',
      name: 'My Mess Group',
      code: 'MESS01',
      currency: '৳',
      pricingMode: 'calculated',
      activeMonthKey: new Date().toISOString().substring(0, 7),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="app-container">
      {/* Security PIN Lock Screen Overlay if locked */}
      {isPinLocked && <SecurityLockScreen />}

      {/* PWA Install banner for mobile / Android users */}
      <InstallPwaPrompt />

      {/* Navigation (Desktop Sidebar & Mobile Bottom Bar) */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        trashCount={trashCount}
      />

      <div className="main-content">
        {/* Top Navigation Bar */}
        <Navbar
          houseName={activeHouse.name}
          activeMonthKey={activeMonthKey}
          onMonthChange={handleMonthChange}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenProfile={() => setProfileModalOpen(true)}
        />

        {/* View Switcher Container */}
        <main className="page-container">
          {activeTab === 'dashboard' && (
            <DashboardView
              hisabReport={hisabReport}
              expenses={expenses.filter((e) => !e.isDeleted && e.monthKey === activeMonthKey)}
              onNavigate={setActiveTab}
              onOpenAddExpense={() => {
                setExpenseToEdit(null);
                setExpenseModalOpen(true);
              }}
              onOpenAddDeposit={() => {
                setDepositToEdit(null);
                setDepositModalOpen(true);
              }}
            />
          )}

          {activeTab === 'meals_daily' && (
            <DailyMealEntryView
              houseId={activeHouse.id}
              members={members.filter((m) => !m.isDeleted)}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              existingMeals={existingMealsForDate}
              yesterdayMeals={yesterdayMeals}
              onSaveMeals={handleSaveMeals}
            />
          )}

          {activeTab === 'meals_grid' && (
            <MealGridTableView
              houseId={activeHouse.id}
              monthKey={activeMonthKey}
              members={members.filter((m) => !m.isDeleted)}
              meals={meals}
              onSaveMeal={handleSaveSingleMeal}
            />
          )}

          {activeTab === 'special_meals' && (
            <SpecialMealsView
              specialMeals={specialMeals.filter((sm) => sm.monthKey === activeMonthKey)}
              members={members.filter((m) => !m.isDeleted)}
              onOpenAddModal={() => {
                setSpecialMealToEdit(null);
                setSpecialMealModalOpen(true);
              }}
              onEditSpecialMeal={(sm) => {
                setSpecialMealToEdit(sm);
                setSpecialMealModalOpen(true);
              }}
              onDeleteSpecialMeal={handleDeleteSpecialMeal}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              expenses={expenses.filter((e) => e.monthKey === activeMonthKey)}
              members={members.filter((m) => !m.isDeleted)}
              onOpenAddModal={() => {
                setExpenseToEdit(null);
                setExpenseModalOpen(true);
              }}
              onEditExpense={(exp) => {
                setExpenseToEdit(exp);
                setExpenseModalOpen(true);
              }}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'deposits' && (
            <DepositsView
              deposits={deposits.filter((d) => d.monthKey === activeMonthKey)}
              members={members.filter((m) => !m.isDeleted)}
              onOpenAddModal={() => {
                setDepositToEdit(null);
                setDepositModalOpen(true);
              }}
              onEditDeposit={(dep) => {
                setDepositToEdit(dep);
                setDepositModalOpen(true);
              }}
              onDeleteDeposit={handleDeleteDeposit}
            />
          )}

          {activeTab === 'members' && (
            <MembersView
              members={members}
              summaries={hisabReport.membersSummary}
              monthKey={activeMonthKey}
              meals={meals.filter((m) => m.monthKey === activeMonthKey)}
              deposits={deposits.filter((d) => d.monthKey === activeMonthKey)}
              onOpenAddModal={() => {
                setMemberToEdit(null);
                setMemberModalOpen(true);
              }}
              onEditMember={(mem) => {
                setMemberToEdit(mem);
                setMemberModalOpen(true);
              }}
              onDeleteMember={handleDeleteMember}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              house={activeHouse}
              hisabReport={hisabReport}
              members={members}
              meals={meals}
              expenses={expenses}
              deposits={deposits}
              specialMeals={specialMeals}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              hisabReport={hisabReport}
              expenses={expenses.filter((e) => e.monthKey === activeMonthKey)}
              meals={meals.filter((m) => m.monthKey === activeMonthKey)}
            />
          )}

          {activeTab === 'history' && <AuditHistoryView logs={logs} />}

          {activeTab === 'trash' && (
            <TrashView
              trashItems={trashItems}
              onRestoreMember={(id) => Repository.restoreMember(id, currentActor)}
              onPermanentDeleteMember={(id) => Repository.permanentlyDeleteMember(id, currentActor)}
              onRestoreExpense={(id) => Repository.restoreExpense(id, currentActor)}
              onPermanentDeleteExpense={(id) => Repository.permanentlyDeleteExpense(id)}
              onRestoreDeposit={(id) => Repository.restoreDeposit(id, currentActor)}
              onPermanentDeleteDeposit={(id) => Repository.permanentlyDeleteDeposit(id)}
              onEmptyTrash={() => Repository.emptyTrash(activeHouse.id, currentActor)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              house={activeHouse}
              theme={theme}
              onUpdateHouse={async (h) => {
                await Repository.saveHouse(h, currentActor);
              }}
              onToggleTheme={toggleTheme}
              onExportBackup={handleExportBackup}
              onRestoreBackup={handleRestoreBackup}
              onLoadDemoData={handleLoadDemoData}
              onResetAllData={handleResetAllData}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      {profileModalOpen && (
        <UserProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          members={members.filter((m) => !m.isDeleted)}
        />
      )}

      {expenseModalOpen && (
        <ExpenseModal
          isOpen={expenseModalOpen}
          onClose={() => setExpenseModalOpen(false)}
          onSave={handleSaveExpense}
          houseId={activeHouse.id}
          members={members.filter((m) => !m.isDeleted)}
          expenseToEdit={expenseToEdit}
          defaultMonthKey={activeMonthKey}
        />
      )}

      {depositModalOpen && (
        <DepositModal
          isOpen={depositModalOpen}
          onClose={() => setDepositModalOpen(false)}
          onSave={handleSaveDeposit}
          houseId={activeHouse.id}
          members={members.filter((m) => !m.isDeleted)}
          depositToEdit={depositToEdit}
          defaultMonthKey={activeMonthKey}
        />
      )}

      {memberModalOpen && (
        <MemberModal
          isOpen={memberModalOpen}
          onClose={() => setMemberModalOpen(false)}
          onSave={handleSaveMember}
          houseId={activeHouse.id}
          memberToEdit={memberToEdit}
        />
      )}

      {specialMealModalOpen && (
        <SpecialMealModal
          isOpen={specialMealModalOpen}
          onClose={() => setSpecialMealModalOpen(false)}
          onSave={handleSaveSpecialMeal}
          houseId={activeHouse.id}
          members={members.filter((m) => !m.isDeleted)}
          specialMealToEdit={specialMealToEdit}
          defaultMonthKey={activeMonthKey}
        />
      )}
    </div>
  );
};
