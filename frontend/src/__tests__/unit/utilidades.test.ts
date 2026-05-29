import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
} from '@/compartidos/utilidades';

// ═══════════════════════════════════════════════════════════
// Unit tests: utilidades (cn, formatCurrency, formatDate…)
// ═══════════════════════════════════════════════════════════

describe('cn (clsx + tailwind-merge)', () => {
  it('une clases simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('ignora valores falsy', () => {
    expect(cn('a', false && 'b', null, undefined, 'c')).toBe('a c');
  });

  it('merge conflicts de tailwind (último gana)', () => {
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('acepta objetos condicionales', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500');
  });

  it('retorna cadena vacía sin argumentos', () => {
    expect(cn()).toBe('');
  });
});

// ─── formatCurrency ───────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formatea en PEN por defecto', () => {
    const result = formatCurrency(100);
    expect(result).toContain('100');
    expect(result).toMatch(/S\/|PEN/);
  });

  it('formatea dos decimales', () => {
    const result = formatCurrency(9.5);
    expect(result).toContain('9.50');
  });

  it('formatea cero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0.00');
  });

  it('formatea número negativo', () => {
    const result = formatCurrency(-50);
    expect(result).toContain('50');
  });

  it('acepta otras monedas', () => {
    const result = formatCurrency(100, 'USD');
    expect(result).toContain('100');
  });
});

// ─── formatDate ──────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('retorna "—" para null', () => {
    expect(formatDate(null)).toBe('—');
  });

  it('retorna "—" para undefined', () => {
    expect(formatDate(undefined)).toBe('—');
  });

  it('retorna "—" para fecha inválida', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('formatea una fecha ISO como string legible', () => {
    const result = formatDate('2025-06-15T00:00:00Z');
    expect(result).toMatch(/2025/);
    expect(result).not.toBe('—');
  });

  it('acepta objeto Date directamente', () => {
    // Usar fecha en hora local (no UTC) para evitar desfase de zona horaria
    const result = formatDate(new Date(2025, 5, 15)); // 15 jun 2025 en hora local
    expect(result).toMatch(/2025/);
  });
});

// ─── formatDateTime ──────────────────────────────────────────────────────────

describe('formatDateTime', () => {
  it('retorna "—" para null', () => {
    expect(formatDateTime(null)).toBe('—');
  });

  it('retorna "—" para string vacío', () => {
    expect(formatDateTime('')).toBe('—');
  });

  it('contiene la fecha y una hora', () => {
    const result = formatDateTime('2025-06-15T14:30:00');
    expect(result).toMatch(/2025/);
    expect(result).not.toBe('—');
  });
});

// ─── formatRelativeTime ──────────────────────────────────────────────────────

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  it('retorna "—" para null', () => {
    expect(formatRelativeTime(null)).toBe('—');
  });

  it('retorna "ahora" para menos de 1 minuto', () => {
    const date = new Date('2025-06-15T11:59:30Z');
    expect(formatRelativeTime(date)).toBe('ahora');
  });

  it('retorna "hace X min" para menos de 1 hora', () => {
    const date = new Date('2025-06-15T11:45:00Z');
    const result = formatRelativeTime(date);
    expect(result).toMatch(/hace \d+ min/);
  });

  it('retorna "hace Xh" para menos de 1 día', () => {
    const date = new Date('2025-06-15T08:00:00Z');
    const result = formatRelativeTime(date);
    expect(result).toMatch(/hace \d+h/);
  });

  it('retorna "hace Xd" para menos de 7 días', () => {
    const date = new Date('2025-06-12T12:00:00Z');
    const result = formatRelativeTime(date);
    expect(result).toMatch(/hace \d+d/);
  });

  it('retorna fecha formateada para más de 7 días', () => {
    const date = new Date('2025-06-01T12:00:00Z');
    const result = formatRelativeTime(date);
    expect(result).toMatch(/2025/);
    expect(result).not.toMatch(/hace/);
  });
});

// ─── formatNumber ────────────────────────────────────────────────────────────

describe('formatNumber', () => {
  it('formatea un número entero', () => {
    const result = formatNumber(1000);
    expect(result).toContain('1');
    expect(result).toContain('000');
  });

  it('formatea cero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('formatea número grande con separadores', () => {
    const result = formatNumber(1000000);
    // Debe tener algún separador de miles (coma o punto según locale)
    expect(result.length).toBeGreaterThan(6);
  });
});
