import {
  Check,
  Globe,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Shield,
  Trash2,
  Unlock,
  User,
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Member } from '../../domain/types';
import { useI18n } from '../../i18n';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  members,
}) => {
  const { t } = useI18n();
  const { user, loginWithGoogle, logout, setPinCode, removePinCode, updateProfile, lockApp } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || 'manager');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);

  const handleGoogleSignIn = () => {
    loginWithGoogle({
      name: name || 'Rahim Ahmed (Manager)',
      email: email || 'rahim.manager@gmail.com',
    });
    showToast('Signed in with Google Account successfully!');
  };

  const handleSaveProfile = () => {
    updateProfile({
      name: name.trim() || 'Mess User',
      email: email.trim() || 'user@example.com',
      role,
    });
    showToast('Profile updated successfully!');
    onClose();
  };

  const handleSetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      showToast('PIN must be at least 4 digits', 'error');
      return;
    }
    if (newPin !== confirmPin) {
      showToast('PIN confirmation does not match', 'error');
      return;
    }
    setPinCode(newPin);
    setNewPin('');
    setConfirmPin('');
    setShowPinSetup(false);
    showToast('Security PIN Lock enabled successfully!');
  };

  const handleRemovePin = () => {
    removePinCode();
    showToast('Security PIN Lock disabled');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile & Security Settings"
      maxWidth="540px"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            {t('cancel')}
          </button>
          <button className="btn btn-primary" onClick={handleSaveProfile}>
            {t('saveChanges')}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Google Account Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.name}
                style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-full)' }}
              />
            ) : (
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--primary-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}
              >
                <User size={24} />
              </div>
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>{user?.name || 'Guest User'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {user?.email || 'Not connected to Google'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                ✓ Google Account Connected
              </div>
            </div>
          </div>

          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            onClick={handleGoogleSignIn}
          >
            Switch Account
          </button>
        </div>

        {/* Profile Details Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              >
                <option value="manager">Mess Manager (Admin)</option>
                <option value="member">Mess Member</option>
              </select>
            </div>
          </div>
        </div>

        {/* App Security & PIN Passcode */}
        <div
          style={{
            padding: '16px',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <KeyRound size={20} color="var(--primary)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Mess Security PIN Lock</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Protect your mess financials with a 4-digit passcode lock
                </div>
              </div>
            </div>

            {user?.pinCode ? (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  onClick={lockApp}
                >
                  <Lock size={14} />
                  <span>Lock Now</span>
                </button>
                <button
                  className="btn btn-danger"
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  onClick={handleRemovePin}
                >
                  <Trash2 size={14} />
                  <span>Remove PIN</span>
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => setShowPinSetup(!showPinSetup)}
              >
                Enable PIN Lock
              </button>
            )}
          </div>

          {showPinSetup && (
            <form onSubmit={handleSetPin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              <div className="grid-2">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Enter 4-digit PIN"
                  className="form-input"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  required
                />
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Confirm PIN"
                  className="form-input"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => setShowPinSetup(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  Save PIN
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
};
