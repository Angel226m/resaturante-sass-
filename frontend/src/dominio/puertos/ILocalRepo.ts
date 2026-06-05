import type { Local, Zona, Mesa, ConfiguracionRestaurante } from '@/dominio/entidades';

// ═══════════════════════════════════════════════════════════
// Puerto: ILocalRepo — contrato de locales, zonas y mesas
// ═══════════════════════════════════════════════════════════

export interface ILocalRepo {
  listarLocales(): Promise<Local[]>;
  obtenerLocal(id: string): Promise<Local>;
  crearLocal(data: Partial<Local>): Promise<Local>;
  actualizarLocal(id: string, data: Partial<Local>): Promise<Local>;
  eliminarLocal(id: string): Promise<void>;

  listarZonas(params?: Record<string, unknown>): Promise<Zona[]>;
  crearZona(data: Partial<Zona>): Promise<Zona>;
  actualizarZona(id: string, data: Partial<Zona>): Promise<Zona>;
  eliminarZona(id: string): Promise<void>;

  listarMesas(params?: Record<string, unknown>): Promise<Mesa[]>;
  crearMesa(data: Partial<Mesa>): Promise<Mesa>;
  actualizarMesa(id: string, data: Partial<Mesa>): Promise<Mesa>;
  eliminarMesa(id: string): Promise<void>;
  cambiarEstadoMesa(id: string, estado: string): Promise<Mesa>;

  obtenerConfiguracion(): Promise<ConfiguracionRestaurante>;
  actualizarConfiguracion(data: Partial<ConfiguracionRestaurante>): Promise<ConfiguracionRestaurante>;
}
