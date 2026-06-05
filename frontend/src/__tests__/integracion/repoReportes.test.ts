import { describe, it, expect, vi, beforeEach } from 'vitest';

// ═══════════════════════════════════════════════════════════
// Integration tests: reportesRepository (demo + API)
// ═══════════════════════════════════════════════════════════

vi.mock('@/infraestructura/store/useAuthStore', () => ({
  useAuthStore: { getState: vi.fn(() => ({ isDemoMode: false })) },
}));

vi.mock('@/infraestructura/api/httpClient', () => ({
  apiGet: vi.fn().mockResolvedValue([]),
  apiPost: vi.fn().mockResolvedValue({}),
}));

import { useAuthStore } from '@/infraestructura/store/useAuthStore';
import { reportesRepository } from '@/infraestructura/repositorios';
import * as httpClient from '@/infraestructura/api/httpClient';

const setDemo = (val: boolean) =>
  (useAuthStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({ isDemoMode: val });

beforeEach(() => {
  vi.clearAllMocks();
  setDemo(false);
});

// ─── MODO DEMO ─────────────────────────────────────────────

describe('reportesRepository — modo demo', () => {
  beforeEach(() => setDemo(true));

  it('obtenerDashboard retorna datos sin llamar API', async () => {
    const result = await reportesRepository.obtenerDashboard();
    expect(result).toBeDefined();
    expect(httpClient.apiGet).not.toHaveBeenCalled();
  });

  it('obtenerDashboard incluye ventas_hoy y campos principales', async () => {
    const result = await reportesRepository.obtenerDashboard();
    expect(result).toHaveProperty('ventas_hoy');
    expect(result).toHaveProperty('ordenes_activas');
    expect(result).toHaveProperty('clientes_hoy');
    expect(typeof result.ventas_hoy).toBe('number');
  });

  it('obtenerResumenDiario retorna datos sin llamar API', async () => {
    const result = await reportesRepository.obtenerResumenDiario({ fecha: '2025-01-01' });
    expect(result).toBeDefined();
    expect(httpClient.apiGet).not.toHaveBeenCalled();
  });

  it('obtenerResumenDiario incluye total_ventas', async () => {
    const result = await reportesRepository.obtenerResumenDiario({ fecha: '2025-01-01' });
    expect(result).toHaveProperty('total_ventas');
    expect(typeof result.total_ventas).toBe('number');
  });

  it('listarResumenes retorna array en demo', async () => {
    const result = await reportesRepository.listarResumenes();
    expect(Array.isArray(result)).toBe(true);
  });

  it('listarAuditLog retorna array vacío en demo', async () => {
    const result = await reportesRepository.listarAuditLog();
    expect(result).toHaveLength(0);
    expect(httpClient.apiGet).not.toHaveBeenCalled();
  });

  it('generarResumenDiario en demo retorna el resumen sin llamar API', async () => {
    const result = await reportesRepository.generarResumenDiario({ fecha: '2025-01-01' });
    expect(result).toBeDefined();
    expect(httpClient.apiPost).not.toHaveBeenCalled();
  });
});

// ─── MODO API ─────────────────────────────────────────────

describe('reportesRepository — modo API', () => {
  it('obtenerDashboard llama GET /reportes/dashboard', async () => {
    const mockData = { ventas_hoy: 1500, ordenes_activas: 8, clientes_hoy: 25 };
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
    await reportesRepository.obtenerDashboard();
    expect(httpClient.apiGet).toHaveBeenCalledWith('/reportes/dashboard');
  });

  it('obtenerResumenDiario llama GET /reportes/resumen-diario con fecha', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue({});
    await reportesRepository.obtenerResumenDiario({ fecha: '2025-01-15' });
    expect(httpClient.apiGet).toHaveBeenCalledWith('/reportes/resumen-diario', { fecha: '2025-01-15' });
  });

  it('listarResumenes llama GET /reportes/resumen-diario/historial', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await reportesRepository.listarResumenes({ desde: '2025-01-01', hasta: '2025-01-31' });
    expect(httpClient.apiGet).toHaveBeenCalledWith('/reportes/resumen-diario/historial', { desde: '2025-01-01', hasta: '2025-01-31' });
  });

  it('generarResumenDiario llama POST /reportes/resumen-diario/generar', async () => {
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({});
    await reportesRepository.generarResumenDiario({ fecha: '2025-01-20' });
    expect(httpClient.apiPost).toHaveBeenCalledWith('/reportes/resumen-diario/generar', { fecha: '2025-01-20' });
  });

  it('listarAuditLog llama GET /reportes/audit-log', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await reportesRepository.listarAuditLog({ limite: 50 });
    expect(httpClient.apiGet).toHaveBeenCalledWith('/reportes/audit-log', { limite: 50 });
  });
});
