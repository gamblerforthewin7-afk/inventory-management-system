import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('apex_ims_active_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Default to Admin for immediate demo experience
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('apex_ims_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('apex_ims_active_user');
    }
  }, [user]);

  const login = (email: string): boolean => {
    const found = INITIAL_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase()
    );
    if (found) {
      setUser(found);
      return true;
    }
    // Fallback demo login
    setUser({
      id: Date.now(),
      username: email.split('@')[0],
      email,
      fullName: email.split('@')[0].toUpperCase(),
      role: 'manager',
      department: 'Logistics',
      status: 'active'
    });
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    const match = INITIAL_USERS.find((u) => u.role === role);
    if (match) {
      setUser(match);
    } else if (user) {
      setUser({ ...user, role });
    }
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
