import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChefHat, Clock, CheckCircle2, Flame, Timer, UtensilsCrossed,
  ArrowRight, AlertTriangle, Ban, Package, Eye, EyeOff,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ordenesRepository, menuRepository } from '@/infraestructura/repositorios';
import { useAuthStore } from '@/infraestructura/store/useAuthStore';
import type { Orden, ItemOrden, ProductoMenu } from '@/dominio/entidades';
import { Badge } from '@/infraestructura/ui/componentes/comunes';

// ═══════════════════════════════════════════════════════════
// KDS (Kitchen Display System) — Panel de Cocina
// Kanban con 3 columnas: Pendiente → En Preparación → Listo
// Vista agrupada por platos (FIFO) + gestión de agotados
// ═══════════════════════════════════════════════════════════

type TicketEstado = 'pendiente' | 'en_preparacion' | 'lista';
type ViewMode = 'orders' | 'dishes';

interface DishGroup {
  nombre: string;
  producto_id: number;
  cantidad_total: number;
  ordenes: { orden_id: number; numero_orden: string; cantidad: number; notas?: string; creado_en: string }[];
}

const columnConfig: Record<TicketEstado, { title: string; icon: React.ReactNode; color: string; gradient: string; cardAccent: string; badgeVariant: 'warning' | 'info' | 'success' }> = {
  pendiente: {
    title: 'Pendientes', icon: <Clock className="h-5 w-5" />, color: 'text-amber-500',
    gradient: 'from-amber-500/10 to-orange-500/5', cardAccent: 'border-l-amber-400',
    badgeVariant: 'warning',
  },
  en_preparacion: {
    title: 'Preparando', icon: <Flame className="h-5 w-5" />, color: 'text-orange-500',
    gradient: 'from-orange-500/10 to-red-500/5', cardAccent: 'border-l-orange-400',
    badgeVariant: 'info',
  },
  lista: {
    title: 'Listos', icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-emerald-500',
    gradient: 'from-emerald-500/10 to-green-500/5', cardAccent: 'border-l-emerald-400',
    badgeVariant: 'success',
  },
};

function getMinutesAgo(dateStr: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000));
}

function groupDishes(ordenes: Orden[], estado: TicketEstado): DishGroup[] {
  const map = new Map<string, DishGroup>();
  for (const orden of ordenes) {
    if (orden.estado !== estado) continue;
    for (const item of (orden.items || [])) {
      const key = item.nombre_producto || `Producto #${item.producto_menu_id}`;
      if (!map.has(key)) map.set(key, { nombre: key, producto_id: item.producto_menu_id, cantidad_total: 0, ordenes: [] });
      const g = map.get(key)!;
      g.cantidad_total += item.cantidad;
      g.ordenes.push({ orden_id: orden.id, numero_orden: orden.numero_orden, cantidad: item.cantidad, notas: item.notas, creado_en: orden.creado_en });
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    const oA = Math.min(...a.ordenes.map(o => new Date(o.creado_en).getTime()));
    const oB = Math.min(...b.ordenes.map(o => new Date(o.creado_en).getTime()));
    return oA - oB;
  });
}

export default function CocineroDashboard() {
  const { usuario } = useAuthStore();
  const qc = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('orders');
  const [showSoldOutPanel, setShowSoldOutPanel] = useState(false);

  const { data: ordenes = [] } = useQuery({ queryKey: ['ordenes'], queryFn: () => ordenesRepository.listarOrdenes(), refetchInterval: 5_000, retry: false });
  const { data: productos = [] } = useQuery({ queryKey: ['menu', 'productos'], queryFn: () => menuRepository.listarProductos(), retry: false });

  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => ordenesRepository.cambiarEstadoOrden(id, estado),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ordenes'] }); toast.success('Estado actualizado'); },
  });

  const toggleDisp = useMutation({
    mutationFn: ({ id, disponible }: { id: string; disponible: boolean }) => menuRepository.cambiarDisponibilidad(id, disponible),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['menu', 'productos'] }); toast(!v.disponible ? 'Plato marcado como AGOTADO' : 'Plato disponible nuevamente', { icon: !v.disponible ? '🔴' : '✅' }); },
  });

  const sorted = useMemo(() => [...ordenes].sort((a: Orden, b: Orden) => new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime()), [ordenes]);
  const pendientes = sorted.filter((o: Orden) => o.estado === 'pendiente');
  const enPrep = sorted.filter((o: Orden) => o.estado === 'en_preparacion');
  const listos = sorted.filter((o: Orden) => o.estado === 'lista');

  const dPend = useMemo(() => groupDishes(sorted, 'pendiente'), [sorted]);
  const dPrep = useMemo(() => groupDishes(sorted, 'en_preparacion'), [sorted]);
  const dList = useMemo(() => groupDishes(sorted, 'lista'), [sorted]);

  const cols: { estado: TicketEstado; orders: Orden[]; dishes: DishGroup[] }[] = [
    { estado: 'pendiente', orders: pendientes, dishes: dPend },
    { estado: 'en_preparacion', orders: enPrep, dishes: dPrep },
    { estado: 'lista', orders: listos, dishes: dList },
  ];

  const totalActivos = pendientes.length + enPrep.length;
  const agotados = productos.filter((p: ProductoMenu) => !p.disponible);

  const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches'; };

  return (
    <div className="space-y-5">
      {/* ══════ Header ══════ */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-6 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-200/20 via-transparent to-orange-200/20" />
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-300/40">
              <ChefHat className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{greet()}, Chef {usuario?.nombre || 'Cocinero'}</h1>
              <p className="text-sm text-slate-600 flex items-center gap-2">
                Panel de Cocina — KDS
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                  <Zap className="h-3 w-3" /> {totalActivos} activas
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Agotados button */}
            <button
              onClick={() => setShowSoldOutPanel(!showSoldOutPanel)}
              className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-sm transition-all ${agotados.length > 0
                ? 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200/70'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              <Ban className="h-4 w-4" /> {agotados.length} Agotados
              {agotados.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">{agotados.length}</span>
              )}
            </button>
            {/* View toggle */}
            <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
              <button onClick={() => setViewMode('orders')} className={`px-4 py-2.5 text-sm font-semibold transition-all ${viewMode === 'orders' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                <Eye className="h-4 w-4 inline mr-1.5" />Órdenes
              </button>
              <button onClick={() => setViewMode('dishes')} className={`px-4 py-2.5 text-sm font-semibold transition-all ${viewMode === 'dishes' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                <Package className="h-4 w-4 inline mr-1.5" />Platos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════ Sold-out panel ══════ */}
      {showSoldOutPanel && (
        <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Ban className="h-5 w-5 text-red-500" /> Gestión de Disponibilidad
              </h3>
              <button onClick={() => setShowSoldOutPanel(false)} className="rounded-lg p-1.5 hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors">
                <EyeOff className="h-4 w-4" />
              </button>
            </div>
            {productos.length === 0 ? <p className="text-sm text-slate-500">No hay productos cargados</p> : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {productos.map((p: ProductoMenu) => (
                  <div key={p.id} className={`flex items-center justify-between rounded-xl border-2 p-3 transition-all ${!p.disponible ? 'border-red-300 bg-red-100/50' : 'border-slate-200 bg-white'}`}>
                    <p className={`text-sm font-semibold truncate flex-1 min-w-0 ${!p.disponible ? 'text-red-700 line-through' : 'text-slate-900'}`}>{p.nombre}</p>
                    <button
                      onClick={() => toggleDisp.mutate({ id: String(p.id), disponible: !p.disponible })}
                      className={`ml-2 shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${!p.disponible
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/20'
                        : 'bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/20'}`}
                    >
                      {!p.disponible ? '✅ Restaurar' : '🔴 Agotar'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════ Stats strip ══════ */}
      <div className="grid grid-cols-3 gap-4">
        {cols.map(({ estado, orders }) => {
          const cfg = columnConfig[estado];
          return (
            <div key={estado} className={`rounded-2xl bg-gradient-to-br ${cfg.gradient} border border-slate-200 p-4 flex items-center gap-4`}>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${estado === 'pendiente' ? 'bg-amber-100' : estado === 'en_preparacion' ? 'bg-orange-100' : 'bg-emerald-100'} ${cfg.color}`}>
                {cfg.icon}
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900">{orders.length}</p>
                <p className="text-xs font-medium text-slate-500">{cfg.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════ Kanban board ══════ */}
      <div className="grid gap-5 lg:grid-cols-3">
        {cols.map(({ estado, orders, dishes }) => {
          const cfg = columnConfig[estado];
          const next: Record<string, string> = { pendiente: 'en_preparacion', en_preparacion: 'lista', lista: 'entregada' };
          const label: Record<string, string> = { pendiente: 'Preparar', en_preparacion: 'Listo!', lista: 'Entregar' };
          const btnGradient = estado === 'pendiente'
            ? 'from-orange-500 to-amber-500 shadow-orange-500/20'
            : estado === 'en_preparacion'
            ? 'from-emerald-500 to-green-500 shadow-emerald-500/20'
            : 'from-blue-500 to-indigo-500 shadow-blue-500/20';
          const actionIcon = estado === 'pendiente' ? <Flame className="h-4 w-4" /> : estado === 'en_preparacion' ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />;

          return (
            <div key={estado} className="space-y-3">
              {/* Column header */}
              <div className={`flex items-center justify-between rounded-xl bg-gradient-to-r ${cfg.gradient} border border-slate-200 px-4 py-3`}>
                <div className="flex items-center gap-2.5">
                  <span className={cfg.color}>{cfg.icon}</span>
                  <h3 className="font-bold text-slate-900 text-base">{cfg.title}</h3>
                </div>
                <Badge variant={cfg.badgeVariant}>{orders.length}</Badge>
              </div>

              {/* ── Orders view ── */}
              {viewMode === 'orders' && (
                orders.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                    <UtensilsCrossed className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 font-medium">Sin {cfg.title.toLowerCase()}</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[calc(100vh-420px)] overflow-y-auto pr-1">
                    {orders.map((orden: Orden) => {
                      const mins = getMinutesAgo(orden.creado_en);
                      const urgent = estado === 'pendiente' && mins > 10;
                      return (
                        <div
                          key={orden.id}
                          className={`rounded-2xl border-l-4 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all ${cfg.cardAccent} ${urgent ? 'ring-2 ring-red-400/50 animate-pulse' : ''}`}
                        >
                          <div className="p-4">
                            {/* Order header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xl font-black text-slate-900">#{orden.numero_orden}</span>
                                {urgent && (
                                  <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                                    <AlertTriangle className="h-3 w-3" /> URGENTE
                                  </span>
                                )}
                              </div>
                              <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${mins > 10 ? 'bg-red-100 text-red-600' : mins > 5 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                <Timer className="h-3 w-3" /> {mins}m
                              </div>
                            </div>

                            {/* Type + notes */}
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="default" className="text-[10px]">
                                {orden.tipo_orden === 'mesa' ? `🪑 Mesa ${orden.mesa_id || ''}` : orden.tipo_orden === 'para_llevar' ? '📦 Para llevar' : '🛵 Delivery'}
                              </Badge>
                              {orden.notas && (
                                <span className="text-[11px] text-amber-600 bg-amber-50 rounded-lg px-2 py-0.5 italic truncate max-w-[160px]">
                                  {orden.notas}
                                </span>
                              )}
                            </div>

                            {/* Items list */}
                            <div className="space-y-1 mb-4">
                              {(orden.items || []).map((item: ItemOrden, i: number) => (
                                <div key={i} className="flex items-start justify-between rounded-xl bg-slate-50 px-3 py-2">
                                  <div className="flex-1">
                                    <p className="text-sm text-slate-800">
                                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-slate-200 text-[10px] font-black text-slate-900 mr-1.5">{item.cantidad}</span>
                                      <span className="font-semibold">{item.nombre_producto || `Producto #${item.producto_menu_id}`}</span>
                                    </p>
                                    {item.notas && (
                                      <p className="text-[10px] text-amber-500 italic ml-7 mt-0.5">⚠️ {item.notas}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {(!orden.items || orden.items.length === 0) && (
                                <p className="text-xs text-slate-400 italic text-center py-2">Sin detalles</p>
                              )}
                            </div>

                            {/* Action button */}
                            <button
                              onClick={() => cambiarEstado.mutate({ id: String(orden.id), estado: next[estado] || 'entregada' })}
                              disabled={cambiarEstado.isPending}
                              className={`w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${btnGradient} py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60`}
                            >
                              {actionIcon}
                              <span className="text-base">{label[estado] || 'Completar'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* ── Dishes (grouped) view ── */}
              {viewMode === 'dishes' && (
                dishes.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                    <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 font-medium">Sin platos</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[calc(100vh-420px)] overflow-y-auto pr-1">
                    {dishes.map((g) => {
                      const oldest = Math.max(...g.ordenes.map(o => getMinutesAgo(o.creado_en)));
                      const urgent = estado === 'pendiente' && oldest > 10;
                      return (
                        <div key={g.nombre} className={`rounded-2xl border-l-4 bg-white border border-slate-200 shadow-sm ${cfg.cardAccent} ${urgent ? 'ring-2 ring-red-400/50' : ''}`}>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className={`flex h-10 w-10 items-center justify-center rounded-xl font-black text-lg ${estado === 'pendiente' ? 'bg-amber-100 text-amber-700' : estado === 'en_preparacion' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                  {g.cantidad_total}
                                </span>
                                <div>
                                  <h4 className="font-bold text-slate-900 text-base">{g.nombre}</h4>
                                  <p className="text-[11px] text-slate-500">{g.ordenes.length} órdenes</p>
                                </div>
                              </div>
                              {urgent && <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />}
                            </div>
                            <div className="space-y-1 mb-3">
                              {g.ordenes.map((o, i) => (
                                <div key={i} className="flex items-center justify-between text-xs rounded-xl bg-slate-50 px-3 py-2">
                                  <span className="text-slate-600">
                                    <span className="font-bold text-slate-900">#{o.numero_orden}</span> — {o.cantidad}x
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {o.notas && <span className="text-amber-500 italic text-[10px]">⚠️ {o.notas}</span>}
                                    <span className={`font-bold ${getMinutesAgo(o.creado_en) > 10 ? 'text-red-500' : 'text-slate-400'}`}>{getMinutesAgo(o.creado_en)}m</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => { const ids = [...new Set(g.ordenes.map(o => o.orden_id))]; ids.forEach(id => cambiarEstado.mutate({ id: String(id), estado: next[estado] || 'entregada' })); }}
                              disabled={cambiarEstado.isPending}
                              className={`w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${btnGradient} py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60`}
                            >
                              {actionIcon} {label[estado]} todos ({g.ordenes.length} órd.)
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

