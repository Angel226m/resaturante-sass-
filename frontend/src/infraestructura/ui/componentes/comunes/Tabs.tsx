import { useState } from 'react';
import { cn } from '@/compartidos/utilidades';

// ═══════════════════════════════════════════════════════════
// Tabs — pestañas horizontales animadas
// ═══════════════════════════════════════════════════════════

interface Tab { id: string; label: string; icon?: React.ReactNode; count?: number }

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  const [selected, setSelected] = useState(activeTab || tabs[0]?.id);
  const active = activeTab ?? selected;

  const handleChange = (key: string) => {
    setSelected(key);
    onChange?.(key);
  };

  return (
    <div className={cn('border-b border-slate-200', className)}>
      <nav className="flex gap-1 -mb-px overflow-x-auto scrollbar-none" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => handleChange(tab.id)}
            className={cn(
              'flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2',
              active === tab.id
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count != null && (
              <span className={cn(
                'rounded-full px-2 py-0.5 text-xs',
                active === tab.id
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-slate-100 text-slate-500',
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
