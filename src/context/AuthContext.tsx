import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../domain/types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isPinLocked: boolean;
  loginWithGoogle: (googleData?: { name?: string; email?: string; photoUrl?: string }) => void;
  logout: () => void;
  setPinCode: (pin: string) => void;
  removePinCode: () => void;
  unlockWithPin: (pin: string) => boolean;
  lockApp: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_USER: UserProfile = {
  id: 'user-google-1',
  name: 'Rahim Ahmed',
  email: 'rahim.manager@gmail.com',
  photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahim',
  googleId: 'google-109283746192',
  role: 'manager',
  isPinLocked: false,
  lastLoginAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('bmm_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });

  const [isPinLocked, setIsPinLocked] = useState<boolean>(() => {
    return user?.pinCode ? true : false;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('bmm_user_profile', JSON.stringify(user));
    } else {
      localStorage.removeItem('bmm_user_profile');
    }
  }, [user]);

  const loginWithGoogle = (googleData?: { name?: string; email?: string; photoUrl?: string }) => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: googleData?.name || 'Google User',
      email: googleData?.email || 'user@gmail.com',
      photoUrl: googleData?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${googleData?.name || 'GoogleUser'}`,
      googleId: `google-${Date.now()}`,
      role: 'manager',
      isPinLocked: false,
      lastLoginAt: new Date().toISOString(),
    };
    setUser(newUser);
    setIsPinLocked(false);
  };

  const logout = () => {
    setUser(null);
    setIsPinLocked(false);
  };

  const setPinCode = (pin: string) => {
    if (user) {
      setUser({ ...user, pinCode: pin });
    }
  };

  const removePinCode = () => {
    if (user) {
      const { pinCode, ...rest } = user;
      setUser({ ...rest });
      setIsPinLocked(false);
    }
  };

  const unlockWithPin = (pin: string): boolean => {
    if (user?.pinCode === pin) {
      setIsPinLocked(false);
      return true;
    }
    return false;
  };

  const lockApp = () => {
    if (user?.pinCode) {
      setIsPinLocked(true);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isPinLocked,
        loginWithGoogle,
        logout,
        setPinCode,
        removePinCode,
        unlockWithPin,
        lockApp,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
