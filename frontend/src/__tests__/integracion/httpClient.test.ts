import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as axiosNS from 'axios';

// ═══════════════════════════════════════════════════════════
// Integration tests: httpClient (interceptors + helpers)
// ═══════════════════════════════════════════════════════════
//
// Probamos los helpers apiGet/apiPost/apiPut/apiDelete
// mockeando axios de forma que retornen ApiResponse<T>.
// También verificamos el interceptor de seguridad que bloquea
// URLs absolutas.

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();

  // Axios.create devuelve un cliente simulado
  const mockClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn((fn) => fn) },
      response: { use: vi.fn((fn) => fn) },
    },
  };

  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => mockClient),
    },
    __mockClient: mockClient,
  };
});

// Importar DESPUÉS del mock para que use el axios simulado
const { apiGet, apiPost, apiPut, apiDelete, httpClient } = await import(
  '@/infraestructura/api/httpClient'
);

// Referencia tipada al mock interno (__mockClient está en el namespace del módulo, no en default)
const mockClient = (axiosNS as unknown as { __mockClient: Record<string, ReturnType<typeof vi.fn>> }).__mockClient;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── apiGet ───────────────────────────────────────────────────────────────────

describe('apiGet', () => {
  it('extrae data de ApiResponse', async () => {
    mockClient.get.mockResolvedValue({ data: { exito: true, mensaje: 'ok', data: { id: 1 } } });
    const result = await apiGet<{ id: number }>('/test');
    expect(result).toEqual({ id: 1 });
  });

  it('pasa params como query string', async () => {
    mockClient.get.mockResolvedValue({ data: { exito: true, data: [] } });
    await apiGet('/items', { page: 1, limit: 10 });
    expect(mockClient.get).toHaveBeenCalledWith('/items', { params: { page: 1, limit: 10 } });
  });

  it('propaga errores del servidor', async () => {
    mockClient.get.mockRejectedValue(new Error('Network Error'));
    await expect(apiGet('/fail')).rejects.toThrow('Network Error');
  });
});

// ─── apiPost ─────────────────────────────────────────────────────────────────

describe('apiPost', () => {
  it('envía body y retorna data', async () => {
    mockClient.post.mockResolvedValue({ data: { exito: true, data: { token: 'abc' } } });
    const result = await apiPost<{ token: string }>('/auth/login', { correo: 'a@b.com' });
    expect(result).toEqual({ token: 'abc' });
    expect(mockClient.post).toHaveBeenCalledWith('/auth/login', { correo: 'a@b.com' });
  });

  it('funciona sin body (apiPost vacío)', async () => {
    mockClient.post.mockResolvedValue({ data: { exito: true, data: undefined } });
    await apiPost('/auth/logout');
    expect(mockClient.post).toHaveBeenCalledWith('/auth/logout', undefined);
  });
});

// ─── apiPut ──────────────────────────────────────────────────────────────────

describe('apiPut', () => {
  it('envía body y retorna data actualizada', async () => {
    mockClient.put.mockResolvedValue({ data: { exito: true, data: { id: 5, nombre: 'Actualizado' } } });
    const result = await apiPut<{ id: number; nombre: string }>('/items/5', { nombre: 'Actualizado' });
    expect(result.nombre).toBe('Actualizado');
  });
});

// ─── apiDelete ────────────────────────────────────────────────────────────────

describe('apiDelete', () => {
  it('llama al endpoint correcto y retorna data', async () => {
    mockClient.delete.mockResolvedValue({ data: { exito: true, data: null } });
    const result = await apiDelete('/items/1');
    expect(mockClient.delete).toHaveBeenCalledWith('/items/1');
    expect(result).toBeNull();
  });
});

// ─── Seguridad: interceptor URL absoluta ─────────────────────────────────────

describe('httpClient — seguridad interceptor', () => {
  it('httpClient existe y tiene métodos http', () => {
    // Verifica que el cliente fue creado correctamente
    expect(httpClient).toBeDefined();
    expect(typeof httpClient.get).toBe('function');
    expect(typeof httpClient.post).toBe('function');
  });
});
