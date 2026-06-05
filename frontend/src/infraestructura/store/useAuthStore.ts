import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Usuario, UserRole } from '@/dominio/entidades';
import { authRepository } from '@/infraestructura/repositorios';

// ═══════════════════════════════════════════════════════════
// Store: Auth — login/logout, perfil, roles
// ═══════════════════════════════════════════════════════════

interface AuthState {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  isDemoMode: boolean;

  login: (email: string, password: string, tenant_slug: string, rememberMe?: boolean) => Promise<void>;
  loginPin: (tenant_slug: string, pin: string) => Promise<void>;
  loginSuperAdmin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
  isAdminOrGerente: () => boolean;
}

function normalizeRol(rol: unknown): UserRole {
  const r = String(rol ?? '').toLowerCase();
  const valid: UserRole[] = ['admin', 'gerente', 'cajero', 'mesero', 'cocinero', 'repartidor', 'almacen'];
  return (valid.includes(r as UserRole) ? r : 'admin') as UserRole;
}

function normalizeUsuario(raw: any): Usuario {
  return {
    id: Number(raw?.id ?? raw?.id_usuario ?? 0),
    tenant_id: String(raw?.tenant_id ?? ''),
    local_id: Number(raw?.local_id ?? 0),
    nombre: String(raw?.nombre ?? ''),
    apellidos: String(raw?.apellidos ?? ''),
    correo: String(raw?.correo ?? ''),
    rol: normalizeRol(raw?.rol),
    avatar_url: raw?.avatar_url ?? null,
    color_identificacion: String(raw?.color_identificacion ?? '#0d9488'),
    activo: Boolean(raw?.activo ?? true),
    ultimo_acceso: raw?.ultimo_acceso ?? raw?.ultimo_login ?? null,
    creado_en: String(raw?.creado_en ?? raw?.created_at ?? ''),
    actualizado_en: String(raw?.actualizado_en ?? raw?.updated_at ?? ''),
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      isAuthenticated: false,
      isSuperAdmin: false,
      isLoading: true,
      isDemoMode: false,

      login: async (email, password, tenant_slug, rememberMe) => {
        await authRepository.login({ correo: email, contrasena: password, tenant_slug, remember_me: rememberMe ?? false });
        const perfil = normalizeUsuario(await authRepository.miPerfil());
        set({ usuario: perfil, isAuthenticated: true, isSuperAdmin: false, isDemoMode: false });
      },

      loginPin: async (tenant_slug, pin) => {
        await authRepository.loginPin({ tenant_slug, pin });
        const perfil = normalizeUsuario(await authRepository.miPerfil());
        set({ usuario: perfil, isAuthenticated: true, isSuperAdmin: false, isDemoMode: false });
      },

      loginSuperAdmin: async (email, password) => {
        await authRepository.loginSuperAdmin({ email, password });
        set({ isAuthenticated: true, isSuperAdmin: true, usuario: null, isDemoMode: false });
      },

      logout: async () => {
        try { await authRepository.logout(); } catch { /* ignore */ }
        set({ usuario: null, isAuthenticated: false, isSuperAdmin: false, isDemoMode: false });
      },

	checkAuth: async () => {
    const { isAuthenticated, isSuperAdmin } = get();
    if (isSuperAdmin && isAuthenticated) {
			set({ isLoading: false });
			return;
		}
		if (!isAuthenticated) {
			set({ isLoading: false });
			return;
		}
		set({ isLoading: true });
		try {
      const perfil = normalizeUsuario(await authRepository.miPerfil());
			set({ usuario: perfil, isAuthenticated: true, isLoading: false });
		} catch {
			set({ usuario: null, isAuthenticated: false, isLoading: false });
		}
	},

      hasRole: (...roles) => {
        const { usuario } = get();
        if (!usuario) return false;
        return roles.includes(normalizeRol(usuario.rol));
      },

      isAdminOrGerente: () => get().hasRole('admin', 'gerente'),
    }),
    {
      name: 'restauflow-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isSuperAdmin: state.isSuperAdmin,
        isDemoMode: false,
        usuario: null,
      }),
    },
  ),
);
