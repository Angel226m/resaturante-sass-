import { apiGet, apiPost, apiPatch } from '../api/httpClient';
import type { Reserva } from '@/dominio/entidades';
import { useAuthStore } from '../store/useAuthStore';
import { DEMO_RESERVAS } from '@/compartidos/demoData';

// ═══════════════════════════════════════════════════════════
// Repository: Reservas
// ═══════════════════════════════════════════════════════════

const isDemo = () => useAuthStore.getState().isDemoMode;
let nextId = 100;

export const reservasRepository = {
  listarReservas: (params?: Record<string, unknown>) => isDemo() ? Promise.resolve(DEMO_RESERVAS as unknown as Reserva[]) : apiGet<Reserva[]>('/reservas', params),
  obtenerReserva: (id: string) => isDemo() ? Promise.resolve((DEMO_RESERVAS.find(r => String(r.id) === id) ?? DEMO_RESERVAS[0]) as unknown as Reserva) : apiGet<Reserva>(`/reservas/${id}`),
  crearReserva: (data: Partial<Reserva>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as Reserva) : apiPost<Reserva>('/reservas', data),
  cambiarEstadoReserva: (id: string, estado: string) => {
    if (isDemo()) {
      const r = DEMO_RESERVAS.find(r => String(r.id) === id);
      return Promise.resolve({ ...r, estado } as unknown as Reserva);
    }
    return apiPatch<Reserva>(`/reservas/${id}/estado`, { estado });
  },
  consultarDisponibilidad: (data: { fecha: string; hora: string; personas: number }) => isDemo() ? Promise.resolve({ disponible: true, mesas_sugeridas: [3, 7, 8] }) : apiPost('/reservas/disponibilidad', data),
  contarReservasHoy: () => isDemo() ? Promise.resolve({ total: DEMO_RESERVAS.length }) : apiGet<{ total: number }>('/reservas/hoy/total'),
};

export default reservasRepository;
