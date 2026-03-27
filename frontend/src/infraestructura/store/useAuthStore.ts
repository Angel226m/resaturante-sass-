import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Usuario, UserRole } from '@/dominio/entidades';
import { authRepository } from '@/infraestructura/repositorios';

// ═══════════════════════════════════════════════════════════
// Store: Auth — login/logout, perfil, roles
// ═══════════════════════════════════════════════════════════

// ── Demo users (bypass API when backend is not running) ──
const DEMO_USERS: Record<string, Usuario> = {
  'admin@demo.com': {
    id: 1,
    tenant_id: 'demo-tenant-uuid',
    local_id: 1,
    nombre: 'Carlos',
    apellidos: 'Administrador',
    correo: 'admin@demo.com',
    rol: 'admin',
    avatar_url: null,
    color_identificacion: '#0d9488',
    activo: true,
    ultimo_acceso: new Date().toISOString(),
    creado_en: '2025-01-01T00:00:00Z',
    actualizado_en: new Date().toISOString(),
  },
  'mesero@demo.com': {
    id: 2,
    tenant_id: 'demo-tenant-uuid',
    local_id: 1,
    nombre: 'Mar\u00eda',
    apellidos: 'Mesera',
    correo: 'mesero@demo.com',
    rol: 'mesero',
    avatar_url: null,
    color_identificacion: '#3b82f6',
    activo: true,
    ultimo_acceso: new Date().toISOString(),
    creado_en: '2025-01-01T00:00:00Z',
    actualizado_en: new Date().toISOString(),
  },
  'cocinero@demo.com': {
    id: 3,
    tenant_id: 'demo-tenant-uuid',
    local_id: 1,
    nombre: 'Pedro',
    apellidos: 'Cocinero',
    correo: 'cocinero@demo.com',
    rol: 'cocinero',
    avatar_url: null,
    color_identificacion: '#f59e0b',
    activo: true,
    ultimo_acceso: new Date().toISOString(),
    creado_en: '2025-01-01T00:00:00Z',
    actualizado_en: new Date().toISOString(),
  },
};

const DEMO_PASSWORDS: Record<string, string> = {
  'admin@demo.com': 'admin123',
  'mesero@demo.com': 'mesero123',
  'cocinero@demo.com': 'cocinero123',
};

const SUPERADMIN_DEMO = {
  email: 'superadmin@restauflow.com',
  password: 'superadmin123',
};

function isDemoLogin(email: string, password: string): Usuario | null {
  const expected = DEMO_PASSWORDS[email];
  if (expected && expected === password) {
    return DEMO_USERS[email] ?? null;
  }
  return null;
}

function isSuperAdminDemo(email: string, password: string): boolean {
  return email === SUPERADMIN_DEMO.email && password === SUPERADMIN_DEMO.password;
}

interface AuthState {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  isDemoMode: boolean;

  login: (email: string, password: string, tenant_slug: string) => Promise<void>;
  loginPin: (tenant_slug: string, pin: string) => Promise<void>;
  loginSuperAdmin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
  isAdminOrGerente: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      isAuthenticated: false,
      isSuperAdmin: false,
      isLoading: true,
      isDemoMode: false,

      login: async (email, password, _tenant_slug) => {
        // Check demo credentials first (no API call)
        const demoUser = isDemoLogin(email, password);
        if (demoUser) {
          set({ usuario: demoUser, isAuthenticated: true, isSuperAdmin: false, isDemoMode: true });
          return;
        }
        // Real API call
        await authRepository.login({ correo: email, contrasena: password });
        const perfil = await authRepository.miPerfil();
        set({ usuario: perfil, isAuthenticated: true, isSuperAdmin: false, isDemoMode: false });
      },

      loginPin: async (tenant_slug, pin) => {
        await authRepository.loginPin({ tenant_slug, pin });
        const perfil = await authRepository.miPerfil();
        set({ usuario: perfil, isAuthenticated: true, isSuperAdmin: false, isDemoMode: false });
      },

      loginSuperAdmin: async (email, password) => {
        // Check demo superadmin first
        if (isSuperAdminDemo(email, password)) {
          set({ isAuthenticated: true, isSuperAdmin: true, usuario: null, isDemoMode: true });
          return;
        }
        await authRepository.loginSuperAdmin({ email, password });
        set({ isAuthenticated: true, isSuperAdmin: true, usuario: null, isDemoMode: false });
      },

      logout: async () => {
        const { isDemoMode } = get();
        if (!isDemoMode) {
          try { await authRepository.logout(); } catch { /* ignore */ }
        }
        set({ usuario: null, isAuthenticated: false, isSuperAdmin: false, isDemoMode: false });
      },

      checkAuth: async () => {
        const { isDemoMode, isAuthenticated } = get();
        // In demo mode, keep existing state — no API call needed
        if (isDemoMode && isAuthenticated) {
          set({ isLoading: false });
          return;
        }
        set({ isLoading: true });
        try {
          const perfil = await authRepository.miPerfil();
          set({ usuario: perfil, isAuthenticated: true, isLoading: false });
        } catch {
          set({ usuario: null, isAuthenticated: false, isLoading: false });
        }
      },

      hasRole: (...roles) => {
        const { usuario } = get();
        if (!usuario) return false;
        return roles.includes(usuario.rol as UserRole);
      },

      isAdminOrGerente: () => get().hasRole('admin', 'gerente'),
    }),
    {
      name: 'restauflow-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isSuperAdmin: state.isSuperAdmin,
        isDemoMode: state.isDemoMode,
        usuario: state.isDemoMode ? state.usuario : null,
      }),
    },
  ),
);
