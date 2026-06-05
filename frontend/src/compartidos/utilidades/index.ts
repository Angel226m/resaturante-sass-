import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'PEN'): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  return formatDate(d);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('es-PE').format(n);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    disponible: 'bg-success-50 text-success-700',
    ocupada: 'bg-danger-50 text-danger-700',
    reservada: 'bg-info-50 text-info-600',
    fuera_servicio: 'bg-surface-100 text-surface-600',
    pendiente: 'bg-warning-50 text-warning-600',
    nueva: 'bg-warning-50 text-warning-600',
    confirmada: 'bg-primary-50 text-primary-700',
    en_preparacion: 'bg-accent-50 text-accent-700',
    en_cocina: 'bg-accent-50 text-accent-700',
    preparando: 'bg-accent-50 text-accent-700',
    lista: 'bg-success-50 text-success-700',
    listo: 'bg-success-50 text-success-700',
    servida: 'bg-primary-50 text-primary-700',
    entregada: 'bg-primary-50 text-primary-700',
    entregado: 'bg-primary-50 text-primary-700',
    cancelada: 'bg-danger-50 text-danger-700',
    cancelado: 'bg-danger-50 text-danger-700',
    completada: 'bg-success-50 text-success-700',
    en_curso: 'bg-accent-50 text-accent-700',
    no_show: 'bg-danger-50 text-danger-700',
    activo: 'bg-success-50 text-success-700',
    activa: 'bg-success-50 text-success-700',
    suspendido: 'bg-warning-50 text-warning-600',
    suspendida: 'bg-warning-50 text-warning-600',
    trial: 'bg-info-50 text-info-600',
    vencida: 'bg-danger-50 text-danger-700',
    abierto: 'bg-success-50 text-success-700',
    cerrado: 'bg-surface-100 text-surface-600',
    completado: 'bg-success-50 text-success-700',
    anulado: 'bg-danger-50 text-danger-700',
    asignado: 'bg-primary-50 text-primary-700',
    recogido: 'bg-accent-50 text-accent-700',
    en_camino: 'bg-info-50 text-info-600',
    emitido: 'bg-success-50 text-success-700',
    pagada: 'bg-success-50 text-success-700',
    para_llevar: 'bg-warning-50 text-warning-600',
    mesa: 'bg-primary-50 text-primary-700',
    delivery: 'bg-accent-50 text-accent-700',
  };
  return map[status] || 'bg-surface-100 text-surface-600';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    disponible: 'Disponible',
    ocupada: 'Ocupada',
    reservada: 'Reservada',
    fuera_servicio: 'Fuera de servicio',
    pendiente: 'Pendiente',
    nueva: 'Pendiente',
    confirmada: 'Confirmada',
    en_preparacion: 'En preparación',
    en_cocina: 'En preparación',
    preparando: 'Preparando',
    lista: 'Lista',
    listo: 'Listo',
    servida: 'Servida',
    entregada: 'Entregada',
    entregado: 'Entregado',
    cancelada: 'Cancelada',
    cancelado: 'Cancelado',
    completada: 'Completada',
    en_curso: 'En curso',
    no_show: 'No se presentó',
    activo: 'Activo',
    activa: 'Activa',
    suspendido: 'Suspendido',
    suspendida: 'Suspendida',
    trial: 'Prueba',
    vencida: 'Vencida',
    abierto: 'Abierto',
    cerrado: 'Cerrado',
    completado: 'Completado',
    anulado: 'Anulado',
    asignado: 'Asignado',
    recogido: 'Recogido',
    en_camino: 'En camino',
    para_llevar: 'Para llevar',
    mesa: 'Mesa',
    delivery: 'Delivery',
  };
  return map[status] || status;
}
