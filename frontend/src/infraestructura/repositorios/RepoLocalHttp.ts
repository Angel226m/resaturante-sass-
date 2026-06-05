import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../api/httpClient';
import type {
  Local, Zona, Mesa, ConfiguracionRestaurante,
} from '@/dominio/entidades';
import { useAuthStore } from '../store/useAuthStore';
import { DEMO_ZONAS, DEMO_MESAS } from '@/compartidos/demoData';

// ═══════════════════════════════════════════════════════════
// Repository: Locales, Zonas, Mesas, Configuración
// ═══════════════════════════════════════════════════════════

const isDemo = () => useAuthStore.getState().isDemoMode;

function normalizeZona(raw: any): Zona {
  return {
    id: Number(raw?.id ?? raw?.id_zona ?? 0),
    tenant_id: String(raw?.tenant_id ?? ''),
    local_id: Number(raw?.local_id ?? 0),
    nombre: String(raw?.nombre ?? ''),
    descripcion: String(raw?.descripcion ?? ''),
    piso: Number(raw?.piso ?? 1),
    color: String(raw?.color ?? '#0d9488'),
    orden: Number(raw?.orden ?? 0),
    activo: Boolean(raw?.activo ?? true),
    creado_en: String(raw?.creado_en ?? raw?.created_at ?? ''),
    actualizado_en: String(raw?.actualizado_en ?? raw?.updated_at ?? ''),
  } as Zona;
}

function normalizeMesa(raw: any): Mesa {
  return {
    id: Number(raw?.id ?? raw?.id_mesa ?? 0),
    tenant_id: String(raw?.tenant_id ?? ''),
    local_id: Number(raw?.local_id ?? 0),
    zona_id: Number(raw?.zona_id ?? 0),
    numero: Number(raw?.numero ?? 0),
    capacidad: Number(raw?.capacidad ?? 0),
    estado: String(raw?.estado ?? 'disponible') as Mesa['estado'],
    forma: String(raw?.forma ?? 'cuadrada') as Mesa['forma'],
    posicion_x: raw?.posicion_x ?? raw?.pos_x ?? null,
    posicion_y: raw?.posicion_y ?? raw?.pos_y ?? null,
    qr_codigo: String(raw?.qr_codigo ?? ''),
    qr_url: String(raw?.qr_url ?? ''),
    activo: Boolean(raw?.activo ?? true),
    creado_en: String(raw?.creado_en ?? raw?.created_at ?? ''),
    actualizado_en: String(raw?.actualizado_en ?? raw?.updated_at ?? ''),
  } as Mesa;
}

const DEMO_LOCAL: Local = {
  id: 1, tenant_id: 'demo', nombre: 'RestauFlow Demo', direccion: 'Av. Larco 123, Miraflores',
  distrito: 'Miraflores', provincia: 'Lima', departamento: 'Lima',
  telefono: '01-234-5678', latitud: -12.12, longitud: -77.03,
  es_principal: true, numero_pisos: 2, horarios: '11:00-23:00',
  acepta_reservas: true, acepta_delivery: true, radio_delivery_km: 5,
  activo: true, total_mesas: 12, total_zonas: 4,
  creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-01T00:00:00Z',
};

const DEMO_CONFIG: ConfiguracionRestaurante = {
  id: 1, tenant_id: 'demo', local_id: 1,
  moneda: 'PEN', zona_horaria: 'America/Lima',
  porcentaje_igv: 18, incluye_igv: true,
  acepta_propina: true, porcentaje_propina: 10,
  cobro_cubierto: false, monto_cubierto: 0,
  mensaje_bienvenida: '¡Bienvenido a RestauFlow!',
  mensaje_ticket: 'Gracias por su visita',
  mensaje_factura: '', email_envio_factura: '',
  tiempo_preparacion_base: 15, alerta_stock_minimo: 10, alerta_vencimiento: 7,
  permite_pedido_sin_mesa: true, permite_descuentos: true, max_descuento: 30,
  creado_en: '2025-01-01T00:00:00Z', actualizado_en: '2025-01-01T00:00:00Z',
};

let nextId = 100;

export const localRepository = {
  // Locales
  listarLocales: () => isDemo() ? Promise.resolve([DEMO_LOCAL]) : apiGet<Local[]>('/locales'),
  obtenerLocal: (id: string) => isDemo() ? Promise.resolve(DEMO_LOCAL) : apiGet<Local>(`/locales/${id}`),
  crearLocal: (data: Partial<Local>) => isDemo() ? Promise.resolve({ ...DEMO_LOCAL, ...data, id: ++nextId } as Local) : apiPost<Local>('/locales', data),
  actualizarLocal: (id: string, data: Partial<Local>) => isDemo() ? Promise.resolve({ ...DEMO_LOCAL, ...data } as Local) : apiPut<Local>(`/locales/${id}`, data),
  eliminarLocal: (id: string) => isDemo() ? Promise.resolve(undefined as never) : apiDelete(`/locales/${id}`),

  // Zonas
  listarZonas: (params?: Record<string, unknown>) => isDemo() ? Promise.resolve(DEMO_ZONAS) : apiGet<any[]>('/zonas', params).then((items) => (items ?? []).map(normalizeZona)),
  crearZona: (data: Partial<Zona>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as Zona) : apiPost<Zona>('/zonas', data),
  actualizarZona: (id: string, data: Partial<Zona>) => isDemo() ? Promise.resolve({ ...data, id: Number(id) } as Zona) : apiPut<Zona>(`/zonas/${id}`, data),
  eliminarZona: (id: string) => isDemo() ? Promise.resolve(undefined as never) : apiDelete(`/zonas/${id}`),

  // Mesas
  listarMesas: (params?: Record<string, unknown>) => isDemo() ? Promise.resolve(DEMO_MESAS) : apiGet<any[]>('/mesas', params).then((items) => (items ?? []).map(normalizeMesa)),
  crearMesa: (data: Partial<Mesa>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as Mesa) : apiPost<Mesa>('/mesas', data),
  actualizarMesa: (id: string, data: Partial<Mesa>) => isDemo() ? Promise.resolve({ ...data, id: Number(id) } as Mesa) : apiPut<Mesa>(`/mesas/${id}`, data),
  eliminarMesa: (id: string) => isDemo() ? Promise.resolve(undefined as never) : apiDelete(`/mesas/${id}`),
  cambiarEstadoMesa: (id: string, estado: string) => {
    if (isDemo()) {
      const mesa = DEMO_MESAS.find(m => String(m.id) === id);
      return Promise.resolve({ ...mesa, estado } as Mesa);
    }
    return apiPatch<any>(`/mesas/${id}/estado`, { estado }).then(normalizeMesa);
  },

  // Configuración
  obtenerConfiguracion: () => isDemo() ? Promise.resolve(DEMO_CONFIG) : apiGet<ConfiguracionRestaurante>('/configuracion'),
  actualizarConfiguracion: (data: Partial<ConfiguracionRestaurante>) => isDemo() ? Promise.resolve({ ...DEMO_CONFIG, ...data } as ConfiguracionRestaurante) : apiPut<ConfiguracionRestaurante>('/configuracion', data),
};

export default localRepository;
