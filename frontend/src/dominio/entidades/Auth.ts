// ── Auth ──
export type UserRole = 'admin' | 'gerente' | 'cajero' | 'mesero' | 'cocinero' | 'repartidor' | 'almacen';

export interface Usuario {
  id: number;
  tenant_id: string;
  local_id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: UserRole;
  avatar_url: string | null;
  color_identificacion: string;
  activo: boolean;
  ultimo_acceso: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface LoginRequest {
  correo: string;
  contrasena: string;
  recordar_me?: boolean;
}

export interface LoginResponse {
  usuario: Usuario;
  access_token: string;
  refresh_token: string;
}

export interface NuevoUsuarioRequest {
  local_id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  contrasena: string;
  rol: UserRole;
  pin_acceso?: string;
  avatar_url?: string;
  color_identificacion?: string;
}

export interface ActualizarUsuarioRequest {
  local_id?: number;
  nombre?: string;
  apellidos?: string;
  correo?: string;
  rol?: UserRole;
  pin_acceso?: string;
  avatar_url?: string;
  color_identificacion?: string;
  activo?: boolean;
}
