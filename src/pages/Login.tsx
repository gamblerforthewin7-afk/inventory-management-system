import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@inventory.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    navigate('/dashboard');
  };

  const handleQuickLogin = (demoEmail: string) => {
    login(demoEmail);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-dark-base flex flex-col justify-center items-center p-6 selection:bg-red-600 selection:text-white">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-dark-base to-dark-base pointer-events-none" />

      <div className="relative w-full max-w-md bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 items-center justify-center shadow-red-glow mb-2">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            APEX <span className="text-red-500">INVENTORY</span>
          </h1>
          <p className="text-xs text-text-secondary">Enterprise Inventory & Stock Management System</p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="p-3 bg-dark-panel border border-dark-border rounded-xl space-y-2">
          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-red-400">
            <ShieldCheck className="w-4 h-4" />
            <span>1-Click Demo Account Sign-In</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@inventory.com')}
              className="px-2 py-1.5 bg-dark-base border border-red-900/50 hover:border-red-600 text-red-400 rounded-lg text-[11px] font-semibold transition-all hover:shadow-red-glow"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('manager@inventory.com')}
              className="px-2 py-1.5 bg-dark-base border border-dark-border hover:border-zinc-500 text-amber-400 rounded-lg text-[11px] font-semibold transition-all"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('staff@inventory.com')}
              className="px-2 py-1.5 bg-dark-base border border-dark-border hover:border-zinc-500 text-zinc-300 rounded-lg text-[11px] font-semibold transition-all"
            >
              Staff
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Email Address / Username</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-base border border-dark-border rounded-lg pl-9 pr-4 py-2.5 text-xs text-text-primary focus:border-red-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-base border border-dark-border rounded-lg pl-9 pr-4 py-2.5 text-xs text-text-primary focus:border-red-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-red-glow transition-all flex items-center justify-center space-x-2 group"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="text-center border-t border-dark-border pt-4 text-[11px] text-text-muted">
          Netlify Deployable Architecture | MySQL Schema Compatible
        </div>
      </div>
    </div>
  );
};
