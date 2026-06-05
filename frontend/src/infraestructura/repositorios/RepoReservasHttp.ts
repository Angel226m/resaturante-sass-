import { apiGet, apiPost, apiPatch } from '../api/httpClient';
import type { Reserva } from '@/dominio/entidades';
import { useAuthStore } from '../store/useAuthStore';
import { DEMO_RESERVAS } from '@/compartidos/demoData';

// ═══════════════════════════════════════════════════════════
// Repository: Reservas
// ═══════════════════════════════════════════════════════════

const isDemo = () => useAuthStore.getState().isDemoMode;
let nextId = 100;

function normalizeReserva(raw: any): Reserva {
  return {
    id: Number(raw?.id ?? raw?.id_reserva ?? 0),
    local_id: Number(raw?.local_id ?? 0),
    cliente_id: raw?.cliente_id ?? null,
    mesa_id: raw?.mesa_id ?? null,
    codigo_confirmacion: String(raw?.codigo_confirmacion ?? ''),
    nombre_contacto: String(raw?.nombre_contacto ?? ''),
    telefono_contacto: String(raw?.telefono_contacto ?? ''),
    correo_contacto: String(raw?.correo_contacto ?? ''),
    fecha_reserva: String(raw?.fecha_reserva ?? ''),
    hora_inicio: String(raw?.hora_inicio ?? ''),
    hora_fin: String(raw?.hora_fin ?? ''),
    numero_personas: Number(raw?.numero_personas ?? 0),
    estado: String(raw?.estado ?? 'pendiente') as Reserva['estado'],
    notas: String(raw?.notas ?? ''),
    creado_en: String(raw?.creado_en ?? raw?.created_at ?? ''),
    actualizado_en: String(raw?.actualizado_en ?? raw?.updated_at ?? ''),
  } as Reserva;
}

export const reservasRepository = {
  listarReservas: (params?: Record<string, unknown>) => isDemo() ? Promise.resolve(DEMO_RESERVAS as unknown as Reserva[]) : apiGet<any[]>('/reservas', params).then((items) => (items ?? []).map(normalizeReserva)),
  obtenerReserva: (id: string) => isDemo() ? Promise.resolve((DEMO_RESERVAS.find(r => String(r.id) === id) ?? DEMO_RESERVAS[0]) as unknown as Reserva) : apiGet<any>(`/reservas/${id}`).then(normalizeReserva),
  crearReserva: (data: Partial<Reserva>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as Reserva) : apiPost<Reserva>('/reservas', data),
  cambiarEstadoReserva: (id: string, estado: string) => {
    if (isDemo()) {
      const r = DEMO_RESERVAS.find(r => String(r.id) === id);
      return Promise.resolve({ ...r, estado } as unknown as Reserva);
    }
    return apiPatch<Reserva>(`/reservas/${id}/estado`, { estado });
  },
  consultarDisponibilidad: (data: { fecha: string; hora: string; personas: number }) => isDemo() ? Promise.resolve({ disponible: true, mesas_sugeridas: [3, 7, 8] }) : apiPost<{ disponible: boolean; mesas_sugeridas: number[] }>('/reservas/disponibilidad', data),
  contarReservasHoy: () => isDemo() ? Promise.resolve({ total: DEMO_RESERVAS.length }) : apiGet<{ total: number }>('/reservas/hoy/total'),
};

export default reservasRepository;
