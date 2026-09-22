import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlightRed?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlightRed = false,
}) => {
  return (
    <div
      className={`relative bg-dark-card border rounded-xl p-5 overflow-hidden transition-all duration-300 ${
        highlightRed
          ? 'border-red-600/60 shadow-red-glow bg-gradient-to-br from-dark-card via-dark-card to-red-950/20'
          : 'border-dark-border hover:border-zinc-700'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-text-secondary">{title}</span>
        <div
          className={`p-2.5 rounded-lg ${
            highlightRed
              ? 'bg-red-600/20 text-red-500 border border-red-500/30'
              : 'bg-dark-panel text-zinc-400 border border-dark-border'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-text-primary tracking-tight">{value}</h3>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              trend.isPositive
                ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/50'
                : 'text-red-400 bg-red-950/60 border border-red-800/50'
            }`}
          >
            {trend.isPositive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-text-muted mt-2">{subtitle}</p>}

      {/* Decorative top line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${highlightRed ? 'bg-red-600' : 'bg-transparent'}`} />
    </div>
  );
};
