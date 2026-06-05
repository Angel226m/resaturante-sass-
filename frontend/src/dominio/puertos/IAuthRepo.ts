import type {
  Usuario,
  LoginRequest,
  LoginResponse,
  NuevoUsuarioRequest,
  ActualizarUsuarioRequest,
} from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Puerto: IAuthRepo — contrato de autenticación y usuarios
// (Dominio define la interfaz; infraestructura la implementa)
// ═══════════════════════════════════════════════════════════

export interface IAuthRepo {
  login(data: LoginRequest): Promise<LoginResponse>;
  loginPin(data: { tenant_slug: string; pin: string }): Promise<LoginResponse>;
  refresh(): Promise<void>;
  logout(): Promise<void>;
  recuperarPassword(data: { email: string; tenant_slug: string }): Promise<void>;
  resetearPassword(data: { token: string; nueva_password: string }): Promise<void>;
  miPerfil(): Promise<Usuario>;

  // SuperAdmin
  loginSuperAdmin(data: { email: string; password: string }): Promise<LoginResponse>;

  // Gestión usuarios
  listarUsuarios(params?: Record<string, unknown>): Promise<Usuario[]>;
  obtenerUsuario(id: string): Promise<Usuario>;
  crearUsuario(data: NuevoUsuarioRequest): Promise<Usuario>;
  actualizarUsuario(id: string, data: ActualizarUsuarioRequest): Promise<Usuario>;
  eliminarUsuario(id: string): Promise<void>;
}
