import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Truck,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  Layers,
  Flame,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { hasRole, user } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'staff'] },
    { path: '/products', label: 'Products', icon: Package, roles: ['admin', 'manager', 'staff'] },
    { path: '/inventory', label: 'Stock Tracking', icon: Boxes, roles: ['admin', 'manager', 'staff'] },
    { path: '/suppliers', label: 'Suppliers', icon: Truck, roles: ['admin', 'manager'] },
    { path: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart, roles: ['admin', 'manager'] },
    { path: '/reports', label: 'Analytics & Reports', icon: BarChart3, roles: ['admin', 'manager'] },
    { path: '/users', label: 'User Management', icon: Users, roles: ['admin'] },
    { path: '/settings', label: 'System Settings', icon: Settings, roles: ['admin', 'manager'] },
  ];

  return (
    <aside className="w-64 bg-dark-panel border-r border-dark-border flex flex-col justify-between h-screen sticky top-0 z-50">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center border-b border-dark-border space-x-3 bg-dark-panel">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-red-glow">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-extrabold text-white tracking-tight text-base">APEX</span>
              <span className="font-extrabold text-red-500 tracking-tight text-base">IMS</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono tracking-widest">ENTERPRISE v2.5</div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="py-6 px-3 space-y-1">
          <div className="px-3 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Core Operations
          </div>

          {navItems.map((item) => {
            const isAllowed = hasRole(item.roles as any);
            if (!isAllowed) return null;

            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                    isActive
                      ? 'bg-red-950/40 text-white border-l-2 border-red-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-dark-hover'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-red-500' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* System Status Footer */}
      <div className="p-4 m-3 bg-dark-base border border-dark-border rounded-xl">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-zinc-400">Database Engine</span>
          <span className="text-emerald-400 font-semibold flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
            MySQL Connected
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-400">Environment</span>
          <span className="text-red-400 font-semibold font-mono text-[10px]">Netlify Functions</span>
        </div>
      </div>
    </aside>
  );
};
