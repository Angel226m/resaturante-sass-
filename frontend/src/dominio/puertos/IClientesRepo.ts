import type { Cliente, DireccionCliente } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Puerto: IClientesRepo — contrato de clientes
// ═══════════════════════════════════════════════════════════

export interface IClientesRepo {
  listarClientes(params?: Record<string, unknown>): Promise<Cliente[]>;
  buscarClientes(params: { q: string }): Promise<Cliente[]>;
  obtenerCliente(id: string): Promise<Cliente>;
  crearCliente(data: Partial<Cliente>): Promise<Cliente>;
  actualizarCliente(id: string, data: Partial<Cliente>): Promise<Cliente>;
  eliminarCliente(id: string): Promise<void>;
  registrarVisita(id: string): Promise<void>;

  crearDireccion(data: Partial<DireccionCliente>): Promise<DireccionCliente>;
  eliminarDireccion(id: string): Promise<void>;
}
