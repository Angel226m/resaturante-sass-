import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart, Users, Clock, Plus, Minus, Send, ArrowLeft,
  Sparkles, Ban, Coffee, Search, Trash2, NotepadText,
  CalendarDays, UtensilsCrossed, Receipt,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ordenesRepository, localRepository, menuRepository, reservasRepository } from '@/infraestructura/repositorios';
import { useAuthStore } from '@/infraestructura/store/useAuthStore';
import { useUIStore } from '@/infraestructura/store/useUIStore';
import type { Mesa, Orden, ProductoMenu, CategoriaMenu } from '@/dominio/entidades';
import { Card, Badge, StatCard, EmptyState, Modal } from '@/infraestructura/ui/componentes/comunes';
import { formatCurrency, getStatusLabel } from '@/compartidos/utilidades';

// ═══════════════════════════════════════════════════════════
// Mesero Dashboard — flujo POS completo
// 1. Seleccionar mesa → 2. Armar pedido del menú → 3. Enviar a cocina
// ═══════════════════════════════════════════════════════════

interface CartItem {
  producto: ProductoMenu;
  cantidad: number;
  notas: string;
}

type ViewStep = 'dashboard' | 'menu';

const estadoMesa: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode; ring: string }> = {
  disponible: { color: 'text-emerald-600', bg: 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 dark:from-emerald-900/20 dark:to-green-900/20 dark:border-emerald-800', label: 'Libre', icon: <Sparkles className="h-5 w-5" />, ring: 'ring-emerald-400' },
  ocupada: { color: 'text-blue-600', bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800', label: 'Ocupada', icon: <Users className="h-5 w-5" />, ring: 'ring-blue-400' },
  reservada: { color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 dark:from-amber-900/20 dark:to-yellow-900/20 dark:border-amber-800', label: 'Reservada', icon: <Coffee className="h-5 w-5" />, ring: 'ring-amber-400' },
  fuera_servicio: { color: 'text-red-600', bg: 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-800', label: 'No disponible', icon: <Ban className="h-5 w-5" />, ring: 'ring-red-400' },
};

export default function MeseroDashboard() {
  const { usuario } = useAuthStore();
  const localId = useUIStore((s) => s.localSeleccionadoId);
  const qc = useQueryClient();

  // ─── View state ───
  const [step, setStep] = useState<ViewStep>('dashboard');
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [catActiva, setCatActiva] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [numPersonas, setNumPersonas] = useState(2);
  const [notasOrden, setNotasOrden] = useState('');
  const [showNotasItem, setShowNotasItem] = useState<number | null>(null);
  const [showOrdenDetalle, setShowOrdenDetalle] = useState<Orden | null>(null);

  // ─── Queries ───
  const { data: ordenes = [] } = useQuery({ queryKey: ['ordenes'], queryFn: () => ordenesRepository.listarOrdenes(), refetchInterval: 8_000, retry: false });
  const { data: mesas = [] } = useQuery({ queryKey: ['mesas', localId], queryFn: () => localRepository.listarMesas(), enabled: !!localId, refetchInterval: 10_000, retry: false });
  const { data: categorias = [] } = useQuery({ queryKey: ['menu', 'categorias'], queryFn: () => menuRepository.listarCategorias(), retry: false });
  const { data: productos = [] } = useQuery({ queryKey: ['menu', 'productos'], queryFn: () => menuRepository.listarProductos(), retry: false });
  const { data: reservasHoy = [] } = useQuery({ queryKey: ['reservas'], queryFn: () => reservasRepository.listarReservas(), retry: false });

  // ─── Mutations ───
  const cambiarEstadoMesa = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => localRepository.cambiarEstadoMesa(id, estado),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mesas'] }),
  });

  const crearOrden = useMutation({
    mutationFn: (data: Partial<Orden>) => ordenesRepository.crearOrden(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ordenes'] });
      qc.invalidateQueries({ queryKey: ['mesas'] });
      toast.success('¡Pedido enviado a cocina! 🔥', { duration: 3000 });
      resetOrder();
    },
    onError: () => toast.error('Error al enviar el pedido'),
  });

  // ─── Derived data ───
  const ordenesActivas = ordenes.filter((o: Orden) => o.estado !== 'entregada' && o.estado !== 'cancelada');
  const misOrdenes = ordenesActivas.filter((o: Orden) => o.mesero_id === (usuario?.id || 2));
  const mesasLibres = mesas.filter((m: Mesa) => m.estado === 'disponible').length;
  const mesasOcupadas = mesas.filter((m: Mesa) => m.estado === 'ocupada').length;
  const totalVentas = misOrdenes.reduce((s: number, o: Orden) => s + (o.total || 0), 0);

  const productosDisponibles = useMemo(() =>
    productos.filter((p: ProductoMenu) => p.disponible && p.activo !== false),
  [productos]);

  const productosFiltrados = useMemo(() => {
    let list = productosDisponibles;
    if (catActiva) list = list.filter((p: ProductoMenu) => p.categoria_menu_id === catActiva);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      list = list.filter((p: ProductoMenu) => p.nombre.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q));
    }
    return list;
  }, [productosDisponibles, catActiva, busqueda]);

  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.producto.precio_base * i.cantidad, 0), [cart]);
  const cartItems = useMemo(() => cart.reduce((s, i) => s + i.cantidad, 0), [cart]);
  const igv = cartTotal * 0.18;

  // ─── Cart actions ───
  const addToCart = (producto: ProductoMenu) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.producto.id === producto.id);
      if (idx >= 0) {
        const existing = prev[idx]!;
        const next = [...prev];
        next[idx] = { ...existing, cantidad: existing.cantidad + 1 };
        return next;
      }
      return [...prev, { producto, cantidad: 1, notas: '' }];
    });
  };

  const removeFromCart = (productoId: number) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.producto.id === productoId);
      if (idx < 0) return prev;
      const existing = prev[idx]!;
      const next = [...prev];
      if (existing.cantidad > 1) { next[idx] = { ...existing, cantidad: existing.cantidad - 1 }; }
      else { next.splice(idx, 1); }
      return next;
    });
  };

  const deleteFromCart = (productoId: number) => setCart(prev => prev.filter(i => i.producto.id !== productoId));

  const setItemNotas = (productoId: number, notas: string) => {
    setCart(prev => prev.map(i => i.producto.id === productoId ? { ...i, notas } : i));
  };

  const getCartQty = (productoId: number) => cart.find(i => i.producto.id === productoId)?.cantidad || 0;

  // ─── Flow actions ───
  const handleSelectMesa = (mesa: Mesa) => {
    if (mesa.estado !== 'disponible' && mesa.estado !== 'ocupada') return;
    setMesaSeleccionada(mesa);
    if (mesa.estado === 'disponible') {
      cambiarEstadoMesa.mutate({ id: String(mesa.id), estado: 'ocupada' });
    }
    setStep('menu');
  };

  const resetOrder = () => {
    setCart([]);
    setNotasOrden('');
    setNumPersonas(2);
    setBusqueda('');
    setCatActiva(null);
    setMesaSeleccionada(null);
    setStep('dashboard');
  };

  const handleEnviarACocina = () => {
    if (cart.length === 0) { toast.error('Agrega platos al pedido'); return; }
    if (!mesaSeleccionada) return;

    const subtotal = cartTotal;
    const igvCalc = subtotal * 0.18;

    crearOrden.mutate({
      tipo_orden: 'mesa',
      mesa_id: mesaSeleccionada.id,
      mesero_id: usuario?.id || 2,
      numero_personas: numPersonas,
      subtotal,
      descuento: 0,
      igv: Math.round(igvCalc * 100) / 100,
      total: Math.round((subtotal + igvCalc) * 100) / 100,
      notas: notasOrden,
      estado: 'pendiente',
      items: cart.map(i => ({
        id: 0,
        orden_id: 0,
        producto_menu_id: i.producto.id,
        variante_id: null,
        cantidad: i.cantidad,
        precio_unitario: i.producto.precio_base,
        precio_modificadores: 0,
        descuento: 0,
        subtotal: i.producto.precio_base * i.cantidad,
        estado: 'pendiente',
        notas: i.notas,
        nombre_producto: i.producto.nombre,
      })),
    });
  };

  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches'; };

  // ═══════════════════════════════════════════════════════════
  // STEP 2: Menú + Carrito — tomar pedido
  // ═══════════════════════════════════════════════════════════
  if (step === 'menu' && mesaSeleccionada) {
    return (
      <div className="flex h-[calc(100vh-4rem)] gap-0 -m-6">
        {/* ▸▸▸ Panel izquierdo: Menú */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900/50">
          {/* Header menú */}
          <div className="flex items-center gap-4 px-6 py-4 bg-white border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <button onClick={resetOrder} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Volver
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                {mesaSeleccionada.numero}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Mesa {mesaSeleccionada.numero}</p>
                <p className="text-[10px] text-slate-500">{numPersonas} personas</p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <button onClick={() => setNumPersonas(Math.max(1, numPersonas - 1))} className="h-6 w-6 rounded-md border border-slate-300 flex items-center justify-center hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors">
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-xs font-medium w-4 text-center">{numPersonas}</span>
              <button onClick={() => setNumPersonas(numPersonas + 1)} className="h-6 w-6 rounded-md border border-slate-300 flex items-center justify-center hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors">
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <div className="flex-1" />
            {/* Buscador */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar plato..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Categorías */}
          <div className="flex gap-2 px-6 py-3 overflow-x-auto border-b border-slate-100 bg-white dark:bg-slate-800 dark:border-slate-700 scrollbar-hide">
            <button
              onClick={() => setCatActiva(null)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${!catActiva ? 'bg-teal-500 text-white shadow-md shadow-teal-500/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400'}`}
            >
              Todos
            </button>
            {categorias.map((c: CategoriaMenu) => (
              <button
                key={c.id}
                onClick={() => setCatActiva(c.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${catActiva === c.id ? 'bg-teal-500 text-white shadow-md shadow-teal-500/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400'}`}
              >
                {c.icono && <span className="mr-1">{c.icono}</span>}
                {c.nombre}
              </button>
            ))}
          </div>

          {/* Grid de productos */}
          <div className="flex-1 overflow-y-auto p-6">
            {productosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <UtensilsCrossed className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm font-medium">No se encontraron platos</p>
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {productosFiltrados.map((p: ProductoMenu) => {
                  const qty = getCartQty(p.id);
                  const cat = categorias.find((c: CategoriaMenu) => c.id === p.categoria_menu_id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className={`group relative rounded-2xl border-2 bg-white p-4 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 dark:bg-slate-800 ${qty > 0 ? 'border-teal-400 shadow-md shadow-teal-500/10 ring-1 ring-teal-400/30' : 'border-slate-200 dark:border-slate-700'}`}
                    >
                      {/* Qty badge */}
                      {qty > 0 && (
                        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-white shadow-lg shadow-teal-500/30 z-10">
                          {qty}
                        </span>
                      )}
                      {/* Emoji / visual */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{cat?.icono || '🍽️'}</span>
                        {(p as any).es_especialidad && <Badge variant="teal" className="text-[9px]">⭐ Especial</Badge>}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{p.nombre}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{p.descripcion}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-base font-bold text-teal-600">{formatCurrency(p.precio_base)}</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity dark:bg-teal-900/30">
                          <Plus className="h-4 w-4" />
                        </span>
                      </div>
                      {p.tiempo_preparacion && (
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{p.tiempo_preparacion} min</p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ▸▸▸ Panel derecho: Carrito */}
        <div className="w-[380px] shrink-0 flex flex-col bg-white border-l border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          {/* Cart header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="h-5 w-5 text-teal-500" />
                Pedido
              </h3>
              <Badge variant={cart.length > 0 ? 'teal' : 'default'}>{cartItems} items</Badge>
            </div>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <ShoppingCart className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">Carrito vacío</p>
                <p className="text-xs text-slate-400 mt-1">Selecciona platos del menú</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {cart.map(item => (
                  <div key={item.producto.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.producto.nombre}</p>
                        <p className="text-xs text-slate-400">{formatCurrency(item.producto.precio_base)} c/u</p>
                        {item.notas && <p className="text-[10px] text-amber-500 italic mt-0.5">&quot;{item.notas}&quot;</p>}
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(item.producto.precio_base * item.cantidad)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.producto.id); }} className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors dark:border-slate-600">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">{item.cantidad}</span>
                        <button onClick={(e) => { e.stopPropagation(); addToCart(item.producto); }} className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-teal-50 hover:border-teal-300 hover:text-teal-500 transition-colors dark:border-slate-600">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setShowNotasItem(showNotasItem === item.producto.id ? null : item.producto.id)} className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${item.notas ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-100 text-slate-400'}`}>
                          <NotepadText className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deleteFromCart(item.producto.id)} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {/* Notas inline */}
                    {showNotasItem === item.producto.id && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Ej: sin cebolla, bien cocido..."
                          value={item.notas}
                          onChange={(e) => setItemNotas(item.producto.id, e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart footer — totals + send */}
          {cart.length > 0 && (
            <div className="border-t border-slate-200 p-5 space-y-3 bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-700">
              {/* Notas generales */}
              <input
                type="text"
                placeholder="Notas del pedido (opcional)..."
                value={notasOrden}
                onChange={(e) => setNotasOrden(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              {/* Totals */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{formatCurrency(cartTotal)}</span></div>
                <div className="flex justify-between text-slate-500"><span>IGV (18%)</span><span>{formatCurrency(igv)}</span></div>
                <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Total</span><span className="text-teal-600">{formatCurrency(cartTotal + igv)}</span>
                </div>
              </div>
              {/* Send button */}
              <button
                onClick={handleEnviarACocina}
                disabled={crearOrden.isPending}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-wait"
              >
                {crearOrden.isPending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar a Cocina
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 1: Dashboard — ver mesas + órdenes activas
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{greeting()}, {usuario?.nombre || 'Mesero'} 👋</h1>
            <p className="mt-1 text-blue-100">Selecciona una mesa disponible para iniciar un nuevo pedido</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur px-4 py-2">
              <Clock className="h-4 w-4 text-blue-200" />
              <span className="text-sm font-medium text-white">{new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Mis órdenes activas" value={misOrdenes.length} icon={<ShoppingCart className="h-5 w-5" />} color="blue" />
        <StatCard title="Mesas libres" value={mesasLibres} icon={<Sparkles className="h-5 w-5" />} color="emerald" />
        <StatCard title="Mesas ocupadas" value={mesasOcupadas} icon={<Users className="h-5 w-5" />} color="amber" />
        <StatCard title="Mis ventas hoy" value={formatCurrency(totalVentas)} icon={<Receipt className="h-5 w-5" />} color="teal" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ▸▸▸ Mapa de mesas */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="p-5 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" /> Seleccionar Mesa
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Toca una mesa <strong>libre</strong> para iniciar un nuevo pedido, o una <strong>ocupada</strong> para agregar</p>
            </div>
            {mesas.length === 0 ? (
              <div className="p-5 pt-0"><EmptyState icon={<Users className="h-10 w-10" />} title="Sin mesas" description="No hay mesas configuradas" /></div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-5 pt-2">
                {mesas.map((mesa: Mesa) => {
                  const cfg = estadoMesa[mesa.estado] ?? estadoMesa['disponible']!;
                  const isClickable = mesa.estado === 'disponible' || mesa.estado === 'ocupada';
                  const ordenMesa = ordenesActivas.find((o: Orden) => o.mesa_id === mesa.id);
                  return (
                    <button
                      key={mesa.id}
                      disabled={!isClickable}
                      onClick={() => handleSelectMesa(mesa)}
                      className={`group relative rounded-2xl border-2 p-4 text-center transition-all ${cfg.bg} ${isClickable ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:ring-2 ' + cfg.ring : 'opacity-50 cursor-not-allowed'}`}
                    >
                      <div className={`mb-1.5 flex justify-center ${cfg.color}`}>{cfg.icon}</div>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">{mesa.numero}</p>
                      <p className="text-[10px] font-medium text-slate-500 mt-0.5">{mesa.capacidad} pers.</p>
                      <Badge variant={mesa.estado === 'disponible' ? 'success' : mesa.estado === 'ocupada' ? 'info' : mesa.estado === 'reservada' ? 'warning' : 'danger'} className="mt-1.5 text-[9px]">
                        {cfg.label}
                      </Badge>
                      {ordenMesa && (
                        <p className="text-[9px] text-blue-500 font-semibold mt-1">#{ordenMesa.numero_orden}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Reservas del día */}
          {reservasHoy.length > 0 && (
            <Card>
              <div className="p-5 pb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-amber-500" /> Reservas de Hoy
                </h2>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 px-5 pb-5">
                {reservasHoy.slice(0, 6).map((r: any) => (
                  <div key={r.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.nombre_contacto}</p>
                      <Badge variant={r.estado === 'confirmada' ? 'success' : 'warning'} className="text-[9px]">{r.estado}</Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.hora_inicio}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{r.numero_personas} pers.</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* ▸▸▸ Órdenes activas */}
        <div>
          <Card>
            <div className="p-5 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-indigo-500" /> Mis Órdenes
              </h2>
            </div>
            {misOrdenes.length === 0 ? (
              <div className="p-5 pt-0"><EmptyState icon={<ShoppingCart className="h-10 w-10" />} title="Sin órdenes" description="Selecciona una mesa para crear un pedido" /></div>
            ) : (
              <div className="space-y-2 p-5 pt-0 max-h-[500px] overflow-y-auto">
                {misOrdenes.map((orden: Orden) => {
                  const estadoVariant = orden.estado === 'pendiente' ? 'warning' : orden.estado === 'en_preparacion' ? 'info' : orden.estado === 'lista' ? 'success' : 'default';
                  return (
                    <button
                      key={orden.id}
                      onClick={() => setShowOrdenDetalle(orden)}
                      className="w-full flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:hover:bg-slate-800 text-left"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">#{orden.numero_orden}</p>
                        <p className="text-xs text-slate-500">Mesa {orden.mesa_id} · {(orden.items || []).length} platos</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(orden.total)}</p>
                        <Badge variant={estadoVariant as any} className="text-[9px]">{getStatusLabel(orden.estado)}</Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modal detalle orden */}
      <Modal isOpen={!!showOrdenDetalle} onClose={() => setShowOrdenDetalle(null)} title={`Orden #${showOrdenDetalle?.numero_orden}`} size="md">
        {showOrdenDetalle && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <Badge variant={showOrdenDetalle.estado === 'pendiente' ? 'warning' : showOrdenDetalle.estado === 'en_preparacion' ? 'info' : showOrdenDetalle.estado === 'lista' ? 'success' : 'default'} dot>
                {getStatusLabel(showOrdenDetalle.estado)}
              </Badge>
              <span className="text-xs text-slate-500">Mesa {showOrdenDetalle.mesa_id}</span>
              <span className="text-xs text-slate-500">{showOrdenDetalle.numero_personas} personas</span>
            </div>
            <div className="space-y-2">
              {(showOrdenDetalle.items || []).map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2 dark:bg-slate-800">
                  <div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.cantidad}x</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 ml-2">{item.nombre_producto}</span>
                    {item.notas && <p className="text-[10px] text-amber-500 italic">&quot;{item.notas}&quot;</p>}
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
              <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white">
                <span>Total</span>
                <span className="text-teal-600">{formatCurrency(showOrdenDetalle.total)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
