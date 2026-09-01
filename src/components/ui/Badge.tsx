import React from 'react';

interface BadgeProps {
  variant?: 'credit' | 'due' | 'settled' | 'manager' | 'member' | 'default';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className = '' }) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'credit':
        return 'badge-credit';
      case 'due':
        return 'badge-due';
      case 'settled':
        return 'badge-settled';
      case 'manager':
        return 'badge-manager';
      default:
        return 'badge-settled';
    }
  };

  return <span className={`badge ${getVariantClass()} ${className}`}>{children}</span>;
};
