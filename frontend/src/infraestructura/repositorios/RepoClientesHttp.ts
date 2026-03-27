import { apiGet, apiPost, apiPut, apiDelete } from '../api/httpClient';
import type { Cliente, DireccionCliente } from '@/dominio/entidades';
import { useAuthStore } from '../store/useAuthStore';
import { DEMO_CLIENTES } from '@/compartidos/demoData';

// ═══════════════════════════════════════════════════════════
// Repository: Clientes + Direcciones
// ═══════════════════════════════════════════════════════════

const isDemo = () => useAuthStore.getState().isDemoMode;
let nextId = 100;

export const clientesRepository = {
  listarClientes: (params?: Record<string, unknown>) => isDemo() ? Promise.resolve(DEMO_CLIENTES as unknown as Cliente[]) : apiGet<Cliente[]>('/clientes', params),
  buscarClientes: (params: { q: string }) => {
    if (isDemo()) {
      const q = params.q.toLowerCase();
      const results = DEMO_CLIENTES.filter(c => c.nombre.toLowerCase().includes(q) || c.apellidos.toLowerCase().includes(q));
      return Promise.resolve(results as unknown as Cliente[]);
    }
    return apiGet<Cliente[]>('/clientes/buscar', params);
  },
  obtenerCliente: (id: string) => isDemo() ? Promise.resolve((DEMO_CLIENTES.find(c => String(c.id) === id) ?? DEMO_CLIENTES[0]) as unknown as Cliente) : apiGet<Cliente>(`/clientes/${id}`),
  crearCliente: (data: Partial<Cliente>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as Cliente) : apiPost<Cliente>('/clientes', data),
  actualizarCliente: (id: string, data: Partial<Cliente>) => isDemo() ? Promise.resolve({ ...data, id: Number(id) } as Cliente) : apiPut<Cliente>(`/clientes/${id}`, data),
  eliminarCliente: (id: string) => isDemo() ? Promise.resolve(undefined as never) : apiDelete(`/clientes/${id}`),
  registrarVisita: (id: string) => isDemo() ? Promise.resolve(undefined as never) : apiPost(`/clientes/${id}/visita`),

  // Direcciones
  crearDireccion: (data: Partial<DireccionCliente>) => isDemo() ? Promise.resolve({ ...data, id: ++nextId } as DireccionCliente) : apiPost<DireccionCliente>('/clientes/direcciones', data),
  eliminarDireccion: (id: string) => isDemo() ? Promise.resolve(undefined as never) : apiDelete(`/clientes/direcciones/${id}`),
};

export default clientesRepository;
