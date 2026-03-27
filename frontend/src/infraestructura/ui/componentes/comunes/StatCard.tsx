import { cn } from '@/compartidos/utilidades';
import { TrendingUp, TrendingDown } from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// StatCard — tarjeta de estadística para dashboard
// ═══════════════════════════════════════════════════════════

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  className?: string;
  color?: 'teal' | 'emerald' | 'blue' | 'amber' | 'red' | 'purple';
}

const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
  teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', icon: 'text-teal-600 dark:text-teal-400', text: 'text-teal-700' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400', text: 'text-emerald-700' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-600 dark:text-blue-400', text: 'text-blue-700' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-600 dark:text-amber-400', text: 'text-amber-700' },
  red: { bg: 'bg-red-50 dark:bg-red-900/20', icon: 'text-red-600 dark:text-red-400', text: 'text-red-700' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-600 dark:text-purple-400', text: 'text-purple-700' },
};

export default function StatCard({ title, value, icon, trend, trendLabel, className, color = 'teal' }: StatCardProps) {
  const c = colorMap[color] ?? colorMap['teal']!;
  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          {trend != null && (
            <div className={cn('flex items-center gap-1 text-xs font-medium', trend >= 0 ? 'text-emerald-600' : 'text-red-600')}>
              {trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span>{trend > 0 ? '+' : ''}{trend}%</span>
              {trendLabel && <span className="text-slate-400 font-normal">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={cn('rounded-xl p-3', c.bg)}>
          <div className={c.icon}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
