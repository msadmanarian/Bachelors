import { Lock, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';

export const SecurityLockScreen: React.FC = () => {
  const { user, unlockWithPin } = useAuth();
  const { showToast } = useToast();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockWithPin(pin)) {
      showToast('Welcome back! App unlocked.');
    } else {
      setError(true);
      showToast('Incorrect PIN passcode', 'error');
      setPin('');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--bg-main)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '380px',
          textAlign: 'center',
          padding: '32px 24px',
          boxShadow: 'var(--shadow-lg)',
          borderTop: '4px solid var(--primary)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-subtle)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
          }}
        >
          <Lock size={32} />
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Mess Security Lock
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Logged in as <strong>{user?.name || 'Manager'}</strong>. Enter your PIN passcode to access mess financials.
        </p>

        <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="password"
            maxLength={6}
            placeholder="••••"
            value={pin}
            onChange={(e) => {
              setError(false);
              setPin(e.target.value);
            }}
            autoFocus
            style={{
              fontSize: '2rem',
              letterSpacing: '12px',
              textAlign: 'center',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${error ? 'var(--danger-text)' : 'var(--border-color)'}`,
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />

          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '12px', fontSize: '1rem', width: '100%' }}
          >
            <span>Unlock Mess Account</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
