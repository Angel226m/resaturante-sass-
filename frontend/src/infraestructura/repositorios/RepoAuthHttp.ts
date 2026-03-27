import { apiGet, apiPost, apiPut, apiDelete } from '../api/httpClient';
import type {
  Usuario, LoginRequest, LoginResponse, NuevoUsuarioRequest, ActualizarUsuarioRequest,
} from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Repository: Auth & Usuarios
// ═══════════════════════════════════════════════════════════

export const authRepository = {
  login: (data: LoginRequest) => apiPost<LoginResponse>('/auth/login', data),
  loginPin: (data: { tenant_slug: string; pin: string }) => apiPost<LoginResponse>('/auth/login-pin', data),
  refresh: () => apiPost<void>('/auth/refresh'),
  logout: () => apiPost<void>('/auth/logout'),
  recuperarPassword: (data: { email: string; tenant_slug: string }) => apiPost<void>('/auth/recuperar-password', data),
  resetearPassword: (data: { token: string; nueva_password: string }) => apiPost<void>('/auth/resetear-password', data),
  miPerfil: () => apiGet<Usuario>('/auth/perfil'),

  // SuperAdmin
  loginSuperAdmin: (data: { email: string; password: string }) => apiPost<LoginResponse>('/superadmin/login', data),

  // Gestión usuarios
  listarUsuarios: (params?: Record<string, unknown>) => apiGet<Usuario[]>('/auth/usuarios', params),
  obtenerUsuario: (id: string) => apiGet<Usuario>(`/auth/usuarios/${id}`),
  crearUsuario: (data: NuevoUsuarioRequest) => apiPost<Usuario>('/auth/usuarios', data),
  actualizarUsuario: (id: string, data: ActualizarUsuarioRequest) => apiPut<Usuario>(`/auth/usuarios/${id}`, data),
  eliminarUsuario: (id: string) => apiDelete(`/auth/usuarios/${id}`),
};

export default authRepository;
