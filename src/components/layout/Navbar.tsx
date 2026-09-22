import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Shield, Bell, LogOut, Search, UserCheck, Activity } from 'lucide-react';

interface NavbarProps {
  lowStockCount: number;
  onOpenLowStockModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ lowStockCount, onOpenLowStockModal }) => {
  const { user, switchRole, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'admin', label: 'Admin', desc: 'Full System Access & Users' },
    { role: 'manager', label: 'Manager', desc: 'Stock, POs, Suppliers, Reports' },
    { role: 'staff', label: 'Staff', desc: 'Warehouse Floor Stock Adjust' },
  ];

  return (
    <header className="h-16 bg-dark-panel border-b border-dark-border px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search Input */}
      <div className="flex items-center space-x-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search SKU, Product, PO #, Supplier..."
            className="w-full bg-dark-base border border-dark-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-text-primary placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Quick Demo Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-dark-base border border-dark-border hover:border-red-600/60 rounded-lg text-xs transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-red-500" />
            <span className="text-zinc-400">Role:</span>
            <span className="font-semibold text-red-400 capitalize">{user?.role}</span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-dark-card border border-dark-border rounded-xl shadow-2xl p-2 z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-dark-border">
                <p className="text-xs font-semibold text-text-primary">Switch Demo Persona</p>
                <p className="text-[10px] text-text-secondary">Instant RBAC Role Switcher</p>
              </div>
              <div className="py-1 space-y-1">
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-start space-x-2 ${
                      user?.role === r.role
                        ? 'bg-red-950/60 text-red-400 border border-red-800/60'
                        : 'hover:bg-dark-hover text-zinc-300'
                    }`}
                  >
                    <UserCheck className={`w-4 h-4 mt-0.5 ${user?.role === r.role ? 'text-red-500' : 'text-zinc-500'}`} />
                    <div>
                      <div className="font-medium">{r.label}</div>
                      <div className="text-[10px] text-zinc-500">{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Low Stock Alerts Bell */}
        <button
          onClick={onOpenLowStockModal}
          className="relative p-2 rounded-lg bg-dark-base border border-dark-border hover:border-red-600/60 text-zinc-400 hover:text-white transition-colors"
          title="Low Stock Alerts"
        >
          <Bell className="w-4 h-4" />
          {lowStockCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white animate-pulse">
              {lowStockCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-3 border-l border-dark-border">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-400 font-bold text-xs">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-text-primary leading-none">{user?.fullName}</div>
            <div className="text-[10px] text-text-muted mt-1">{user?.department}</div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors ml-2"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
