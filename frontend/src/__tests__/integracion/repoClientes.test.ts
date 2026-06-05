import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DEMO_CLIENTES } from '@/compartidos/demoData';

// ═══════════════════════════════════════════════════════════
// Integration tests: clientesRepository (demo + API)
// ═══════════════════════════════════════════════════════════

vi.mock('@/infraestructura/store/useAuthStore', () => ({
  useAuthStore: { getState: vi.fn(() => ({ isDemoMode: false })) },
}));

vi.mock('@/infraestructura/api/httpClient', () => ({
  apiGet: vi.fn().mockResolvedValue([]),
  apiPost: vi.fn().mockResolvedValue({}),
  apiPut: vi.fn().mockResolvedValue({}),
  apiDelete: vi.fn().mockResolvedValue(undefined),
}));

import { useAuthStore } from '@/infraestructura/store/useAuthStore';
import { clientesRepository } from '@/infraestructura/repositorios';
import * as httpClient from '@/infraestructura/api/httpClient';

const setDemo = (val: boolean) =>
  (useAuthStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({ isDemoMode: val });

beforeEach(() => {
  vi.clearAllMocks();
  setDemo(false);
});

// ─── MODO DEMO ─────────────────────────────────────────────

describe('clientesRepository — modo demo', () => {
  beforeEach(() => setDemo(true));

  it('listarClientes retorna DEMO_CLIENTES', async () => {
    const result = await clientesRepository.listarClientes();
    expect(result.length).toBeGreaterThan(0);
    expect(httpClient.apiGet).not.toHaveBeenCalled();
  });

  it('listarClientes retorna la cantidad exacta de clientes demo', async () => {
    const result = await clientesRepository.listarClientes();
    expect(result.length).toBe(DEMO_CLIENTES.length);
  });

  it('buscarClientes(q) filtra por nombre (case-insensitive)', async () => {
    const primero = DEMO_CLIENTES[0]!;
    // Buscar por primeras letras en minúsculas
    const q = (primero.nombre ?? '').slice(0, 3).toLowerCase();
    if (!q) return; // skip si no hay nombre
    const result = await clientesRepository.buscarClientes({ q });
    expect(result.length).toBeGreaterThan(0);
  });

  it('buscarClientes sin match retorna array vacío', async () => {
    const result = await clientesRepository.buscarClientes({ q: 'XXXXXNOTEXIST99999' });
    expect(result).toHaveLength(0);
  });

  it('obtenerCliente por id retorna el cliente', async () => {
    const primerCliente = DEMO_CLIENTES[0]!;
    const result = await clientesRepository.obtenerCliente(String(primerCliente.id));
    expect(result.id).toBe(primerCliente.id);
  });

  it('crearCliente en demo retorna objeto con id y datos', async () => {
    const data = { nombres: 'Nuevo', apellidos: 'Cliente', correo: 'n@test.com' };
    const result = await clientesRepository.crearCliente(data);
    expect(result.id).toBeTypeOf('number');
    expect(httpClient.apiPost).not.toHaveBeenCalled();
  });

  it('actualizarCliente retorna el cliente actualizado', async () => {
    const primerCliente = DEMO_CLIENTES[0]!;
    const result = await clientesRepository.actualizarCliente(String(primerCliente.id), { correo: 'upd@test.com' });
    expect(result.id).toBe(primerCliente.id);
  });

  it('eliminarCliente en demo no llama apiDelete', async () => {
    await clientesRepository.eliminarCliente('1');
    expect(httpClient.apiDelete).not.toHaveBeenCalled();
  });

  it('registrarVisita en demo retorna undefined', async () => {
    const primerCliente = DEMO_CLIENTES[0]!;
    const result = await clientesRepository.registrarVisita(String(primerCliente.id));
    expect(result).toBeUndefined();
  });

  it('crearDireccion en demo retorna dirección con id', async () => {
    const data = { etiqueta: 'Casa', direccion: 'Jr. Test 1', es_principal: true };
    const result = await clientesRepository.crearDireccion(data);
    expect(result.id).toBeTypeOf('number');
    expect(result.etiqueta).toBe('Casa');
  });
});

// ─── MODO API ─────────────────────────────────────────────

describe('clientesRepository — modo API', () => {
  it('listarClientes llama GET /clientes', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await clientesRepository.listarClientes({ page: 1 });
    expect(httpClient.apiGet).toHaveBeenCalledWith('/clientes', { page: 1 });
  });

  it('buscarClientes llama GET /clientes/buscar con query', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await clientesRepository.buscarClientes({ q: 'Ana' });
    expect(httpClient.apiGet).toHaveBeenCalledWith('/clientes/buscar', { q: 'Ana' });
  });

  it('obtenerCliente llama GET /clientes/:id', async () => {
    (httpClient.apiGet as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 5 });
    await clientesRepository.obtenerCliente('5');
    expect(httpClient.apiGet).toHaveBeenCalledWith('/clientes/5');
  });

  it('crearCliente llama POST /clientes', async () => {
    const data = { nombres: 'Test', apellidos: 'User' };
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 99 });
    await clientesRepository.crearCliente(data);
    expect(httpClient.apiPost).toHaveBeenCalledWith('/clientes', data);
  });

  it('actualizarCliente llama PUT /clientes/:id', async () => {
    (httpClient.apiPut as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 3 });
    await clientesRepository.actualizarCliente('3', { correo: 'new@test.com' });
    expect(httpClient.apiPut).toHaveBeenCalledWith('/clientes/3', { correo: 'new@test.com' });
  });

  it('eliminarCliente llama DELETE /clientes/:id', async () => {
    (httpClient.apiDelete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    await clientesRepository.eliminarCliente('7');
    expect(httpClient.apiDelete).toHaveBeenCalledWith('/clientes/7');
  });

  it('registrarVisita llama POST /clientes/:id/visita', async () => {
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    await clientesRepository.registrarVisita('2');
    expect(httpClient.apiPost).toHaveBeenCalledWith('/clientes/2/visita');
  });

  it('crearDireccion llama POST /clientes/direcciones', async () => {
    const data = { etiqueta: 'Trabajo', direccion: 'Av. Test 200' };
    (httpClient.apiPost as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 10 });
    await clientesRepository.crearDireccion(data);
    expect(httpClient.apiPost).toHaveBeenCalledWith('/clientes/direcciones', data);
  });

  it('eliminarDireccion llama DELETE /clientes/direcciones/:id', async () => {
    (httpClient.apiDelete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    await clientesRepository.eliminarDireccion('5');
    expect(httpClient.apiDelete).toHaveBeenCalledWith('/clientes/direcciones/5');
  });
});
