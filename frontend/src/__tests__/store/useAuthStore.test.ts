import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useAuthStore } from '@/infraestructura/store/useAuthStore';
import { authRepository } from '@/infraestructura/repositorios';
import type { Usuario } from '@/dominio/entidades';

// ── Mock del repositorio HTTP ─────────────────────────────────────────────────
vi.mock('@/infraestructura/repositorios', () => ({
  authRepository: {
    login: vi.fn(),
    miPerfil: vi.fn(),
    logout: vi.fn(),
    loginSuperAdmin: vi.fn(),
    loginPin: vi.fn(),
    refresh: vi.fn(),
  },
}));

// ── Fixture: usuario de prueba ───────────────────────────────────────────────
const usuarioMock: Usuario = {
  id: 99,
  tenant_id: 'tenant-api-test',
  local_id: 1,
  nombre: 'Test',
  apellidos: 'Usuario',
  correo: 'test@api.com',
  rol: 'gerente',
  avatar_url: null,
  color_identificacion: '#0d9488',
  activo: true,
  ultimo_acceso: null,
  creado_en: '2025-01-01T00:00:00Z',
  actualizado_en: '2025-01-01T00:00:00Z',
};

beforeEach(() => {
  // Resetear estado del store antes de cada test
  useAuthStore.setState({
    usuario: null,
    isAuthenticated: false,
    isSuperAdmin: false,
    isLoading: false,
    isDemoMode: false,
  });
  localStorage.clear();
});

// ─── Modo demo ────────────────────────────────────────────────────────────────

describe('login — modo demo', () => {
  it('admin@demo.com: setea isAuthenticated y isDemoMode sin llamar al API', async () => {
    await act(async () => {
      await useAuthStore.getState().login('admin@demo.com', 'admin123', 'demo-restaurant');
    });

    const { isAuthenticated, isDemoMode, usuario } = useAuthStore.getState();
    expect(isAuthenticated).toBe(true);
    expect(isDemoMode).toBe(true);
    expect(usuario?.rol).toBe('admin');
    expect(usuario?.correo).toBe('admin@demo.com');
    expect(authRepository.login).not.toHaveBeenCalled();
  });

  it('mesero@demo.com: rol mesero', async () => {
    await act(async () => {
      await useAuthStore.getState().login('mesero@demo.com', 'mesero123', 'demo-restaurant');
    });
    expect(useAuthStore.getState().usuario?.rol).toBe('mesero');
  });

  it('cocinero@demo.com: rol cocinero', async () => {
    await act(async () => {
      await useAuthStore.getState().login('cocinero@demo.com', 'cocinero123', 'demo-restaurant');
    });
    expect(useAuthStore.getState().usuario?.rol).toBe('cocinero');
  });

  it('superadmin demo: setea isSuperAdmin=true sin API', async () => {
    await act(async () => {
      await useAuthStore.getState().loginSuperAdmin('superadmin@restauflow.com', 'superadmin123');
    });
    const { isAuthenticated, isSuperAdmin, isDemoMode } = useAuthStore.getState();
    expect(isAuthenticated).toBe(true);
    expect(isSuperAdmin).toBe(true);
    expect(isDemoMode).toBe(true);
    expect(authRepository.loginSuperAdmin).not.toHaveBeenCalled();
  });

  it('logout en modo demo limpia estado sin llamar al API', async () => {
    useAuthStore.setState({ isAuthenticated: true, isDemoMode: true, usuario: usuarioMock });

    await act(async () => {
      await useAuthStore.getState().logout();
    });

    expect(authRepository.logout).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().usuario).toBeNull();
    expect(useAuthStore.getState().isDemoMode).toBe(false);
  });
});

// ─── Modo API real ────────────────────────────────────────────────────────────

describe('login — modo API real', () => {
  it('llama a authRepository.login con los datos correctos', async () => {
    vi.mocked(authRepository.login).mockResolvedValue({} as never);
    vi.mocked(authRepository.miPerfil).mockResolvedValue(usuarioMock);

    await act(async () => {
      await useAuthStore.getState().login('test@api.com', 'password123', 'mi-tenant', false);
    });

    expect(authRepository.login).toHaveBeenCalledWith({
      correo: 'test@api.com',
      contrasena: 'password123',
      remember_me: false,
    });
    expect(authRepository.miPerfil).toHaveBeenCalled();
    expect(useAuthStore.getState().usuario).toEqual(usuarioMock);
    expect(useAuthStore.getState().isDemoMode).toBe(false);
  });

  it('pasa remember_me=true al repositorio', async () => {
    vi.mocked(authRepository.login).mockResolvedValue({} as never);
    vi.mocked(authRepository.miPerfil).mockResolvedValue(usuarioMock);

    await act(async () => {
      await useAuthStore.getState().login('test@api.com', 'pass', 'tenant', true);
    });

    expect(authRepository.login).toHaveBeenCalledWith(
      expect.objectContaining({ remember_me: true }),
    );
  });

  it('logout no-demo llama al repositorio y limpia estado', async () => {
    vi.mocked(authRepository.logout).mockResolvedValue({} as never);
    useAuthStore.setState({ isAuthenticated: true, isDemoMode: false, usuario: usuarioMock });

    await act(async () => {
      await useAuthStore.getState().logout();
    });

    expect(authRepository.logout).toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().usuario).toBeNull();
  });

  it('login propaga error del repositorio', async () => {
    vi.mocked(authRepository.login).mockRejectedValue(new Error('Credenciales inválidas'));

    await expect(
      act(async () => {
        await useAuthStore.getState().login('bad@user.com', 'wrong', 'tenant');
      }),
    ).rejects.toThrow('Credenciales inválidas');
  });
});

// ─── hasRole ──────────────────────────────────────────────────────────────────

describe('hasRole', () => {
  it('retorna true cuando el rol coincide', () => {
    useAuthStore.setState({ usuario: { ...usuarioMock, rol: 'admin' } });
    expect(useAuthStore.getState().hasRole('admin')).toBe(true);
  });

  it('retorna false cuando el rol no coincide', () => {
    useAuthStore.setState({ usuario: { ...usuarioMock, rol: 'mesero' } });
    expect(useAuthStore.getState().hasRole('admin')).toBe(false);
  });

  it('retorna true cuando coincide uno de varios roles', () => {
    useAuthStore.setState({ usuario: { ...usuarioMock, rol: 'gerente' } });
    expect(useAuthStore.getState().hasRole('admin', 'gerente')).toBe(true);
  });

  it('retorna false sin usuario autenticado', () => {
    expect(useAuthStore.getState().hasRole('admin')).toBe(false);
  });
});

// ─── isAdminOrGerente ─────────────────────────────────────────────────────────

describe('isAdminOrGerente', () => {
  it('retorna true para admin', () => {
    useAuthStore.setState({ usuario: { ...usuarioMock, rol: 'admin' } });
    expect(useAuthStore.getState().isAdminOrGerente()).toBe(true);
  });

  it('retorna true para gerente', () => {
    useAuthStore.setState({ usuario: { ...usuarioMock, rol: 'gerente' } });
    expect(useAuthStore.getState().isAdminOrGerente()).toBe(true);
  });

  it('retorna false para mesero', () => {
    useAuthStore.setState({ usuario: { ...usuarioMock, rol: 'mesero' } });
    expect(useAuthStore.getState().isAdminOrGerente()).toBe(false);
  });

  it('retorna false sin usuario', () => {
    expect(useAuthStore.getState().isAdminOrGerente()).toBe(false);
  });
});
