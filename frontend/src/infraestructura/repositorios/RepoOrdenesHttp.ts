import { apiGet, apiPost, apiPatch } from '../api/httpClient';
import type { Orden, ItemOrden, TicketCocina } from '@/dominio/entidades';
import { useAuthStore } from '../store/useAuthStore';
import { DEMO_ORDENES } from '@/compartidos/demoData';

// ═══════════════════════════════════════════════════════════
// Repository: Órdenes + Tickets Cocina
// ═══════════════════════════════════════════════════════════

const isDemo = () => useAuthStore.getState().isDemoMode;
let nextId = 100;

export const ordenesRepository = {
  // Órdenes
  listarOrdenes: (params?: Record<string, unknown>) => isDemo() ? Promise.resolve(DEMO_ORDENES) : apiGet<Orden[]>('/ordenes', params),
  obtenerOrden: (id: string) => {
    if (isDemo()) {
      const orden = DEMO_ORDENES.find(o => String(o.id) === id);
      return Promise.resolve(orden ?? DEMO_ORDENES[0]);
    }
    return apiGet<Orden>(`/ordenes/${id}`);
  },
  crearOrden: (data: Partial<Orden>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId, numero_orden: `ORD-${String(nextId).padStart(3, '0')}` } as Orden) : apiPost<Orden>('/ordenes', data),
  cambiarEstadoOrden: (id: string, estado: string) => {
    if (isDemo()) {
      const orden = DEMO_ORDENES.find(o => String(o.id) === id);
      return Promise.resolve({ ...orden, estado } as Orden);
    }
    return apiPatch<Orden>(`/ordenes/${id}/estado`, { estado });
  },
  agregarItemOrden: (id: string, data: Partial<ItemOrden>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as ItemOrden) : apiPost<ItemOrden>(`/ordenes/${id}/items`, data),
  contarOrdenesActivas: () => isDemo() ? Promise.resolve({ total: DEMO_ORDENES.filter(o => o.estado !== 'entregada' && o.estado !== 'cancelada').length }) : apiGet<{ total: number }>('/ordenes/activas/total'),

  // Tickets cocina
  listarTicketsCocina: (params?: Record<string, unknown>) => isDemo() ? Promise.resolve([] as TicketCocina[]) : apiGet<TicketCocina[]>('/cocina/tickets', params),
  crearTicketCocina: (data: Partial<TicketCocina>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as TicketCocina) : apiPost<TicketCocina>('/cocina/tickets', data),
  cambiarEstadoTicket: (id: string, estado: string) => isDemo() ? Promise.resolve({ id: Number(id), estado } as TicketCocina) : apiPatch<TicketCocina>(`/cocina/tickets/${id}/estado`, { estado }),
};

export default ordenesRepository;
