import { apiGet, apiPost, apiPatch } from '../api/httpClient';
import type { Orden, ItemOrden, TicketCocina } from '@/dominio/entidades';
import { useAuthStore } from '../store/useAuthStore';
import { DEMO_ORDENES } from '@/compartidos/demoData';

// ═══════════════════════════════════════════════════════════
// Repository: Órdenes + Tickets Cocina
// ═══════════════════════════════════════════════════════════

const isDemo = () => useAuthStore.getState().isDemoMode;
let nextId = 100;

function normalizeEstadoOrden(estado: string | undefined): Orden['estado'] {
  const value = String(estado ?? '').toLowerCase();
  if (value === 'nueva') return 'pendiente';
  if (value === 'en_cocina') return 'en_preparacion';
  if (value === 'listo') return 'lista';
  if (value === 'servida' || value === 'pagada') return 'entregada';
  return (value || 'pendiente') as Orden['estado'];
}

function normalizeItem(raw: any): ItemOrden {
  return {
    id: Number(raw?.id ?? raw?.id_item_orden ?? 0),
    orden_id: Number(raw?.orden_id ?? 0),
    producto_menu_id: Number(raw?.producto_menu_id ?? 0),
    variante_id: raw?.variante_id ?? null,
    cantidad: Number(raw?.cantidad ?? 0),
    precio_unitario: Number(raw?.precio_unitario ?? 0),
    precio_modificadores: Number(raw?.precio_modificadores ?? 0),
    descuento: Number(raw?.descuento ?? 0),
    subtotal: Number(raw?.subtotal ?? 0),
    estado: String(raw?.estado ?? ''),
    notas: String(raw?.notas ?? ''),
    nombre_producto: raw?.nombre_producto,
    modificadores: raw?.modificadores,
  };
}

function normalizeOrden(raw: any): Orden {
  return {
    id: Number(raw?.id ?? raw?.id_orden ?? 0),
    tenant_id: String(raw?.tenant_id ?? ''),
    local_id: Number(raw?.local_id ?? 0),
    numero_orden: String(raw?.numero_orden ?? ''),
    tipo_orden: String(raw?.tipo_orden ?? 'mesa') as Orden['tipo_orden'],
    estado: normalizeEstadoOrden(raw?.estado),
    mesa_id: raw?.mesa_id ?? null,
    cliente_id: raw?.cliente_id ?? null,
    mesero_id: raw?.mesero_id ?? null,
    numero_personas: raw?.numero_personas ?? null,
    subtotal: Number(raw?.subtotal ?? 0),
    descuento: Number(raw?.descuento ?? 0),
    igv: Number(raw?.igv ?? 0),
    total: Number(raw?.total ?? 0),
    notas: String(raw?.notas ?? ''),
    tiempo_estimado: raw?.tiempo_estimado ?? null,
    items: Array.isArray(raw?.items) ? raw.items.map(normalizeItem) : [],
    creado_en: String(raw?.creado_en ?? raw?.created_at ?? ''),
    actualizado_en: String(raw?.actualizado_en ?? raw?.updated_at ?? ''),
  };
}

function normalizeTicket(raw: any): TicketCocina {
  return {
    ...raw,
    id: Number(raw?.id ?? raw?.id_ticket_cocina ?? 0),
    creado_en: String(raw?.creado_en ?? raw?.created_at ?? ''),
    actualizado_en: String(raw?.actualizado_en ?? raw?.updated_at ?? ''),
  } as TicketCocina;
}

export const ordenesRepository = {
  // Órdenes
  listarOrdenes: (params?: Record<string, unknown>) => isDemo() ? Promise.resolve(DEMO_ORDENES) : apiGet<any[]>('/ordenes', params).then((items) => (items ?? []).map(normalizeOrden)),
  obtenerOrden: (id: string) => {
    if (isDemo()) {
      const orden = DEMO_ORDENES.find(o => String(o.id) === id);
      return Promise.resolve(orden ?? DEMO_ORDENES[0]!);
    }
    return apiGet<any>(`/ordenes/${id}`).then(normalizeOrden);
  },
  crearOrden: (data: Partial<Orden>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId, numero_orden: `ORD-${String(nextId).padStart(3, '0')}` } as Orden) : apiPost<any>('/ordenes', data).then(normalizeOrden),
  cambiarEstadoOrden: (id: string, estado: string) => {
    if (isDemo()) {
      const orden = DEMO_ORDENES.find(o => String(o.id) === id);
      return Promise.resolve({ ...orden, estado } as Orden);
    }
    return apiPatch<any>(`/ordenes/${id}/estado`, { estado }).then((raw) => ({
      ...(raw ?? {}),
      id: Number(raw?.id ?? id),
      estado: normalizeEstadoOrden(raw?.estado ?? estado),
    } as Orden));
  },
  agregarItemOrden: (id: string, data: Partial<ItemOrden>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as ItemOrden) : apiPost<any>(`/ordenes/${id}/items`, data).then(normalizeItem),
  contarOrdenesActivas: () => isDemo() ? Promise.resolve({ total: DEMO_ORDENES.filter(o => o.estado !== 'entregada' && o.estado !== 'cancelada').length }) : apiGet<{ total: number }>('/ordenes/activas/total'),

  // Tickets cocina
  listarTicketsCocina: (params?: Record<string, unknown>) => isDemo()
    ? Promise.resolve([] as TicketCocina[])
    : apiGet<any[]>('/cocina/tickets', params).then((items) => (items ?? []).map(normalizeTicket)),
  crearTicketCocina: (data: Partial<TicketCocina>) => isDemo()
    ? Promise.resolve({ ...data, id: ++nextId } as TicketCocina)
    : apiPost<any>('/cocina/tickets', data).then(normalizeTicket),
  cambiarEstadoTicket: (id: string, estado: string) => isDemo() ? Promise.resolve({ id: Number(id), estado } as TicketCocina) : apiPatch<TicketCocina>(`/cocina/tickets/${id}/estado`, { estado }),
};

export default ordenesRepository;
