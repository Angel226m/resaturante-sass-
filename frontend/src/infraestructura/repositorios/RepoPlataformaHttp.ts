import { apiGet, apiPost, apiPut, apiDelete } from '../api/httpClient';
import type { Plan, Tenant, Suscripcion, FacturaPlataforma } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Repository: SuperAdmin / Plataforma
// ═══════════════════════════════════════════════════════════

export const plataformaRepository = {
  // Planes
  listarPlanes: () => apiGet<Plan[]>('/superadmin/planes'),
  obtenerPlan: (id: string) => apiGet<Plan>(`/superadmin/planes/${id}`),
  crearPlan: (data: Partial<Plan>) => apiPost<Plan>('/superadmin/planes', data),
  actualizarPlan: (id: string, data: Partial<Plan>) => apiPut<Plan>(`/superadmin/planes/${id}`, data),
  eliminarPlan: (id: string) => apiDelete(`/superadmin/planes/${id}`),

  // Tenants
  listarTenants: (params?: Record<string, unknown>) => apiGet<Tenant[]>('/superadmin/tenants', params),
  obtenerTenant: (id: string) => apiGet<Tenant>(`/superadmin/tenants/${id}`),
  crearTenant: (data: Partial<Tenant>) => apiPost<Tenant>('/superadmin/tenants', data),
  actualizarTenant: (id: string, data: Partial<Tenant>) => apiPut<Tenant>(`/superadmin/tenants/${id}`, data),
  eliminarTenant: (id: string) => apiDelete(`/superadmin/tenants/${id}`),

  // Suscripciones
  obtenerSuscripcion: (id: string) => apiGet<Suscripcion>(`/superadmin/suscripciones/${id}`),
  cambiarPlan: (id: string, data: { nuevo_plan_id: string }) => apiPost(`/superadmin/suscripciones/${id}/cambiar-plan`, data),

  // Facturas
  listarFacturas: (params?: Record<string, unknown>) => apiGet<FacturaPlataforma[]>('/superadmin/facturas', params),
};

export default plataformaRepository;
