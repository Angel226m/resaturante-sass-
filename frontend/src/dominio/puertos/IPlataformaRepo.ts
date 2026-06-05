import type { Plan, Tenant, Suscripcion, FacturaPlataforma } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Puerto: IPlataformaRepo — contrato de superadmin / plataforma
// ═══════════════════════════════════════════════════════════

export interface IPlataformaRepo {
  listarPlanes(): Promise<Plan[]>;
  obtenerPlan(id: string): Promise<Plan>;
  crearPlan(data: Partial<Plan>): Promise<Plan>;
  actualizarPlan(id: string, data: Partial<Plan>): Promise<Plan>;
  eliminarPlan(id: string): Promise<void>;

  listarTenants(params?: Record<string, unknown>): Promise<Tenant[]>;
  obtenerTenant(id: string): Promise<Tenant>;
  crearTenant(data: Partial<Tenant>): Promise<Tenant>;
  actualizarTenant(id: string, data: Partial<Tenant>): Promise<Tenant>;
  eliminarTenant(id: string): Promise<void>;

  obtenerSuscripcion(id: string): Promise<Suscripcion>;
  cambiarPlan(id: string, data: { nuevo_plan_id: string }): Promise<void>;

  listarFacturas(params?: Record<string, unknown>): Promise<FacturaPlataforma[]>;
}
