import {
  Clock,
  Filter,
  History,
  Search,
  Shield,
  ShoppingBag,
  User,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';
import React, { useState } from 'react';
import { AuditLog } from '../../domain/types';
import { useI18n } from '../../i18n';
import { EmptyState } from '../ui/EmptyState';

interface AuditHistoryViewProps {
  logs: AuditLog[];
}

export const AuditHistoryView: React.FC<AuditHistoryViewProps> = ({ logs }) => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (filterType !== 'all' && log.targetType !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.actorName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTargetIcon = (type: AuditLog['targetType']) => {
    switch (type) {
      case 'meal':
        return <UtensilsCrossed size={16} color="var(--primary)" />;
      case 'expense':
        return <ShoppingBag size={16} color="var(--accent)" />;
      case 'deposit':
        return <Wallet size={16} color="var(--info-text)" />;
      case 'member':
        return <User size={16} color="var(--success-text)" />;
      case 'special_meal':
        return <Clock size={16} color="#ec4899" />;
      default:
        return <Shield size={16} color="var(--text-muted)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          borderLeft: '4px solid var(--info-text)',
        }}
      >
        <div>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} color="var(--info-text)" />
            <span>Activity History & Audit Trail</span>
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Complete real-time log of who is doing what — member additions, meal updates, bazar purchases, deposits, and deletions
          </p>
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          {logs.length} Total Activity Events
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {['all', 'meal', 'expense', 'deposit', 'member', 'special_meal'].map((type) => (
            <button
              key={type}
              className={`btn ${filterType === type ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem', textTransform: 'capitalize' }}
              onClick={() => setFilterType(type)}
            >
              {type === 'special_meal' ? 'Special Meals' : type}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search activity log..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Audit Log Timeline */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          title="No activity history found"
          description="Actions performed in the mess will appear in this timeline automatically."
          icon={<History size={28} />}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '12px 16px',
              }}
            >
              <div
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  marginTop: '2px',
                }}
              >
                {getTargetIcon(log.targetType)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>
                    <span style={{ color: 'var(--primary)' }}>{log.actorName}</span>{' '}
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{log.action}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  {log.details}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
