import { cn } from '@/compartidos/utilidades';

// ═══════════════════════════════════════════════════════════
// Card — container con header, body, footer
// ═══════════════════════════════════════════════════════════

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
}

export function Card({ children, className, hover, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
        hover && 'transition-shadow hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50',
        padding && 'p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mt-4 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-700', className)}>
      {children}
    </div>
  );
}
