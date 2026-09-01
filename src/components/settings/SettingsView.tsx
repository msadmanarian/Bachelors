import {
  AlertTriangle,
  Database,
  Download,
  Flame,
  Globe,
  Home,
  Moon,
  RotateCcw,
  Save,
  Settings,
  Sparkles,
  Sun,
  Upload,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { BackupData, House, PricingMode } from '../../domain/types';
import { useI18n } from '../../i18n';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toast';

interface SettingsViewProps {
  house: House;
  theme: 'light' | 'dark';
  onUpdateHouse: (house: House) => Promise<void>;
  onToggleTheme: () => void;
  onExportBackup: () => Promise<void>;
  onRestoreBackup: (data: BackupData) => Promise<void>;
  onLoadDemoData: () => Promise<void>;
  onResetAllData: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  house,
  theme,
  onUpdateHouse,
  onToggleTheme,
  onExportBackup,
  onRestoreBackup,
  onLoadDemoData,
  onResetAllData,
}) => {
  const { lang, setLang, t } = useI18n();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(house.name);
  const [code, setCode] = useState(house.code);
  const [currency, setCurrency] = useState(house.currency);
  const [pricingMode, setPricingMode] = useState<PricingMode>(house.pricingMode);
  const [fixedRate, setFixedRate] = useState(house.fixedRate ? house.fixedRate.toString() : '45');
  const [isSaving, setIsSaving] = useState(false);

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmDemoOpen, setConfirmDemoOpen] = useState(false);

  const handleSaveHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedHouse: House = {
        ...house,
        name: name.trim() || "Bachelors' Meal Manager",
        code: code.trim() || 'MESS01',
        currency: currency.trim() || '৳',
        pricingMode,
        fixedRate: pricingMode === 'fixed' ? parseFloat(fixedRate) || 45 : undefined,
        updatedAt: new Date().toISOString(),
      };

      await onUpdateHouse(updatedHouse);
      showToast('Mess settings updated successfully!');
    } catch (err) {
      showToast('Failed to update settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as BackupData;

        if (!parsed.schemaVersion || !parsed.data) {
          throw new Error('Invalid backup file format.');
        }

        await onRestoreBackup(parsed);
        showToast('Database restored successfully!');
      } catch (err: any) {
        showToast(err.message || 'Corrupted or incompatible backup file.', 'error');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* House Profile & Calculation Settings */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Home size={20} color="var(--primary)" />
            <span>Mess Group & Accounting Configuration</span>
          </h3>
        </div>

        <form onSubmit={handleSaveHouse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Mess / House Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Green View Bachelor Mess"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">House ID / Code</label>
              <input
                type="text"
                className="form-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. GVM-2026"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Currency Symbol</label>
              <select
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="৳">৳ (BDT - Bangladeshi Taka)</option>
                <option value="$">$ (USD)</option>
                <option value="₹">₹ (INR - Indian Rupee)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - British Pound)</option>
                <option value="₨">₨ (PKR - Pakistani Rupee)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Pricing Calculation Mode</label>
              <select
                className="form-select"
                value={pricingMode}
                onChange={(e) => setPricingMode(e.target.value as PricingMode)}
              >
                <option value="calculated">Calculated Dynamic Mode (Total Bazar ÷ Total Meals)</option>
                <option value="fixed">Fixed Meal Rate Mode (Set Rate ৳ / meal)</option>
              </select>
            </div>
          </div>

          {pricingMode === 'fixed' && (
            <div className="form-group" style={{ maxWidth: '300px' }}>
              <label className="form-label">Fixed Rate per Meal ({currency})</label>
              <input
                type="number"
                step="any"
                min="1"
                className="form-input"
                value={fixedRate}
                onChange={(e) => setFixedRate(e.target.value)}
                required
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              <Save size={16} />
              <span>{isSaving ? 'Saving...' : t('saveChanges')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Language & Theme */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={20} color="var(--accent)" />
            <span>Language & Theme Preferences</span>
          </h3>
        </div>

        <div className="grid-2">
          {/* Language Selection */}
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>Language / ভাষা</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {lang === 'en' ? 'Currently English' : 'বর্তমানে বাংলা'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn ${lang === 'en' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: '0.825rem' }}
                onClick={() => setLang('en')}
              >
                English
              </button>
              <button
                className={`btn ${lang === 'bn' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: '0.825rem' }}
                onClick={() => setLang('bn')}
              >
                বাংলা
              </button>
            </div>
          </div>

          {/* Theme Selection */}
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>Theme Mode</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {theme === 'dark' ? 'Modern Dark Mode' : 'Clean Light Mode'}
              </div>
            </div>
            <button className="btn btn-secondary" onClick={onToggleTheme}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Database Backup & Restore */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} color="var(--info-text)" />
            <span>Database Backup & Restoration</span>
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          All data is stored locally in your browser's persistent IndexedDB database. Export backups regularly to safeguard your bachelor accounts.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button className="btn btn-primary" onClick={onExportBackup}>
            <Download size={16} />
            <span>{t('exportBackup')}</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} />
            <span>{t('restoreBackup')}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }}
          />

          <button
            className="btn btn-secondary"
            onClick={() => setConfirmDemoOpen(true)}
          >
            <Sparkles size={16} color="var(--accent)" />
            <span>{t('loadDemoData')}</span>
          </button>
        </div>
      </div>

      {/* Dangerous Zone */}
      <div className="card" style={{ borderColor: 'var(--danger-bg)' }}>
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger-text)' }}>
            <AlertTriangle size={20} />
            <span>Danger Zone</span>
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Resetting will permanently wipe all local members, meals, bazar expenses, deposits, and monthly hisab periods.
        </p>

        <button
          className="btn btn-danger"
          onClick={() => setConfirmResetOpen(true)}
        >
          <RotateCcw size={16} />
          <span>{t('resetData')}</span>
        </button>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={confirmDemoOpen}
        onClose={() => setConfirmDemoOpen(false)}
        onConfirm={async () => {
          await onLoadDemoData();
          showToast('Sample bachelor mess dataset loaded successfully!');
        }}
        title="Load Demo Bachelor Mess Data?"
        message="This will load sample members (Rahim, Tanvir, Karim, Sakib, Ashik), daily meals, bazar purchases, and deposits for instant evaluation."
        confirmText="Load Demo Data"
      />

      <ConfirmDialog
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={async () => {
          await onResetAllData();
          showToast('Database reset to clean state.');
        }}
        title="Reset All Data?"
        message="Are you sure you want to delete all mess data? This cannot be undone unless you have a JSON backup."
        confirmText="Reset Everything"
        isDangerous={true}
      />
    </div>
  );
};
