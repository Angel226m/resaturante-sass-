import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ShoppingCart, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ordenesRepository, menuRepository } from '@/infraestructura/repositorios';
import type { Orden, ProductoMenu } from '@/dominio/entidades';
import { Button, Card, Badge, DataTable, Modal, Tabs, Input } from '@/infraestructura/ui/componentes/comunes';
import type { Column } from '@/infraestructura/ui/componentes/comunes';
import { formatCurrency, formatDateTime, getStatusColor, getStatusLabel } from '@/compartidos/utilidades';

interface NewOrderItem { producto_menu_id: number; nombre: string; cantidad: number; precio_unitario: number; }

export default function OrdenesPage() {
  const [tab, setTab] = useState('todas');
  const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [orderType, setOrderType] = useState<'mesa' | 'para_llevar' | 'delivery'>('mesa');
  const [mesaId, setMesaId] = useState('');
  const [notas, setNotas] = useState('');
  const [newItems, setNewItems] = useState<NewOrderItem[]>([]);
  const qc = useQueryClient();

  const { data: ordenes = [], isLoading } = useQuery({
    queryKey: ['ordenes'],
    queryFn: () => ordenesRepository.listarOrdenes(),
    refetchInterval: 10000,
  });

  const { data: productos = [] } = useQuery({
    queryKey: ['menu', 'productos'],
    queryFn: () => menuRepository.listarProductos(),
  });

  const crearOrden = useMutation({
    mutationFn: (data: Partial<Orden>) => ordenesRepository.crearOrden(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ordenes'] }); toast.success('Orden creada'); closeNewOrder(); },
    onError: () => toast.error('Error al crear orden'),
  });

  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => ordenesRepository.cambiarEstadoOrden(id, estado),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ordenes'] }); toast.success('Estado actualizado'); },
  });

  const closeNewOrder = () => { setShowNewOrder(false); setNewItems([]); setMesaId(''); setNotas(''); setOrderType('mesa'); };

  const addItem = (p: ProductoMenu) => {
    const existing = newItems.find(i => i.producto_menu_id === p.id);
    if (existing) {
      setNewItems(newItems.map(i => i.producto_menu_id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i));
    } else {
      setNewItems([...newItems, { producto_menu_id: p.id, nombre: p.nombre, cantidad: 1, precio_unitario: p.precio_base }]);
    }
  };

  const removeItem = (prodId: number) => setNewItems(newItems.filter(i => i.producto_menu_id !== prodId));
  const updateQty = (prodId: number, qty: number) => {
    if (qty < 1) return removeItem(prodId);
    setNewItems(newItems.map(i => i.producto_menu_id === prodId ? { ...i, cantidad: qty } : i));
  };

  const orderTotal = newItems.reduce((sum, i) => sum + i.precio_unitario * i.cantidad, 0);

  const submitOrder = () => {
    if (newItems.length === 0) { toast.error('Agrega al menos un producto'); return; }
    crearOrden.mutate({
      tipo_orden: orderType,
      mesa_id: mesaId ? parseInt(mesaId) : null,
      notas,
      subtotal: orderTotal,
      total: orderTotal,
      items: newItems.map(i => ({
        id: 0, orden_id: 0, producto_menu_id: i.producto_menu_id, variante_id: null,
        cantidad: i.cantidad, precio_unitario: i.precio_unitario, precio_modificadores: 0,
        descuento: 0, subtotal: i.precio_unitario * i.cantidad, estado: 'pendiente', notas: '',
      })),
    } as any);
  };

  const filteredOrdenes = tab === 'todas' ? ordenes : ordenes.filter((o: Orden) => o.estado === tab);

  const tabs = [
    { id: 'todas', label: 'Todas', count: ordenes.length },
    { id: 'pendiente', label: 'Pendientes', count: ordenes.filter((o: Orden) => o.estado === 'pendiente').length },
    { id: 'en_preparacion', label: 'En preparaci\u00f3n', count: ordenes.filter((o: Orden) => o.estado === 'en_preparacion').length },
    { id: 'lista', label: 'Listas', count: ordenes.filter((o: Orden) => o.estado === 'lista').length },
    { id: 'entregada', label: 'Completadas', count: ordenes.filter((o: Orden) => o.estado === 'entregada').length },
  ];

  const columns: Column<Orden>[] = [
    { key: 'numero', label: '#', sortable: true, render: (o) => (
      <span className="font-mono font-bold text-teal-600">#{o.numero_orden}</span>
    )},
    { key: 'tipo', label: 'Tipo', render: (o) => <Badge variant="teal">{o.tipo_orden}</Badge> },
    { key: 'estado', label: 'Estado', render: (o) => <Badge variant={getStatusColor(o.estado) as any} dot>{getStatusLabel(o.estado)}</Badge> },
    { key: 'total', label: 'Total', sortable: true, render: (o) => <span className="font-semibold">{formatCurrency(o.total)}</span> },
    { key: 'created_at', label: 'Fecha', render: (o) => (
      <span className="text-slate-500 text-xs">{formatDateTime(o.creado_en)}</span>
    )},
    { key: 'acciones', label: '', render: (o) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => setSelectedOrden(o)}><Eye className="h-4 w-4" /></Button>
        {o.estado === 'pendiente' && (
          <Button variant="ghost" size="sm" className="text-amber-600" onClick={() => cambiarEstado.mutate({ id: String(o.id), estado: 'en_preparacion' })}>
            Preparar
          </Button>
        )}
        {o.estado === 'en_preparacion' && (
          <Button variant="ghost" size="sm" className="text-emerald-600" onClick={() => cambiarEstado.mutate({ id: String(o.id), estado: 'lista' })}>
            Lista
          </Button>
        )}
        {o.estado === 'lista' && (
          <Button variant="ghost" size="sm" className="text-teal-600" onClick={() => cambiarEstado.mutate({ id: String(o.id), estado: 'entregada' })}>
            Entregar
          </Button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">\u00d3rdenes</h1>
          <p className="text-slate-500">Gestiona las \u00f3rdenes de tu restaurante</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowNewOrder(true)}>Nueva orden</Button>
      </div>

      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      <Card>
        <DataTable
          columns={columns}
          data={filteredOrdenes}
          keyExtractor={(o) => String(o.id)}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Buscar por n\u00famero de orden..."
          emptyMessage="No hay \u00f3rdenes"
          emptyIcon={<ShoppingCart className="h-8 w-8 text-slate-300" />}
        />
      </Card>

      {/* Detalle Orden Modal */}
      <Modal isOpen={!!selectedOrden} onClose={() => setSelectedOrden(null)} title={`Orden #${selectedOrden?.numero_orden}`} size="lg">
        {selectedOrden && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Tipo</p>
                <p className="font-medium">{selectedOrden.tipo_orden}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Estado</p>
                <Badge variant={getStatusColor(selectedOrden.estado) as any} dot>{getStatusLabel(selectedOrden.estado)}</Badge>
              </div>
              <div>
                <p className="text-sm text-slate-500">Subtotal</p>
                <p className="font-medium">{formatCurrency(selectedOrden.subtotal)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-lg font-bold text-teal-600">{formatCurrency(selectedOrden.total)}</p>
              </div>
            </div>
            {selectedOrden.notas && (
              <div>
                <p className="text-sm text-slate-500">Notas</p>
                <p className="mt-1 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-700">{selectedOrden.notas}</p>
              </div>
            )}
            {selectedOrden.items && selectedOrden.items.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrden.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2 dark:bg-slate-700">
                      <div>
                        <p className="text-sm font-medium">{item.nombre_producto}</p>
                        <p className="text-xs text-slate-400">x{item.cantidad}</p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Nueva Orden Modal */}
      <Modal isOpen={showNewOrder} onClose={closeNewOrder} title="Nueva Orden" size="xl" footer={
        <>
          <Button variant="outline" onClick={closeNewOrder}>Cancelar</Button>
          <Button isLoading={crearOrden.isPending} onClick={submitOrder}>
            Crear orden — {formatCurrency(orderTotal)}
          </Button>
        </>
      }>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Config */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de orden</label>
              <select className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" value={orderType} onChange={(e) => setOrderType(e.target.value as any)}>
                <option value="mesa">En mesa</option>
                <option value="para_llevar">Para llevar</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
            {orderType === 'mesa' && (
              <Input label="N\u00famero de mesa" type="number" placeholder="Ej: 5" value={mesaId} onChange={(e) => setMesaId(e.target.value)} />
            )}
            <Input label="Notas" placeholder="Instrucciones especiales..." value={notas} onChange={(e) => setNotas(e.target.value)} />

            {/* Selected items */}
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Items seleccionados ({newItems.length})</p>
              {newItems.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">Selecciona productos del cat\u00e1logo</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {newItems.map((item) => (
                    <div key={item.producto_menu_id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.nombre}</p>
                        <p className="text-xs text-slate-400">{formatCurrency(item.precio_unitario)} c/u</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.producto_menu_id, item.cantidad - 1)} className="h-7 w-7 rounded-lg bg-slate-100 text-sm font-bold hover:bg-slate-200 dark:bg-slate-700">-</button>
                        <span className="text-sm font-semibold w-6 text-center">{item.cantidad}</span>
                        <button onClick={() => updateQty(item.producto_menu_id, item.cantidad + 1)} className="h-7 w-7 rounded-lg bg-slate-100 text-sm font-bold hover:bg-slate-200 dark:bg-slate-700">+</button>
                        <button onClick={() => removeItem(item.producto_menu_id)} className="ml-1 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-600">Total</span>
                <span className="text-lg font-bold text-teal-600">{formatCurrency(orderTotal)}</span>
              </div>
            </div>
          </div>

          {/* Right: Product catalog */}
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cat\u00e1logo de productos</p>
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {productos.filter((p: ProductoMenu) => p.disponible).map((p: ProductoMenu) => (
                <button key={p.id} type="button" onClick={() => addItem(p)} className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-left hover:bg-teal-50 hover:border-teal-300 transition-colors dark:border-slate-700 dark:hover:bg-teal-900/20">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{p.nombre}</p>
                    <p className="text-xs text-slate-400 truncate">{p.descripcion || 'Sin descripci\u00f3n'}</p>
                  </div>
                  <span className="ml-2 text-sm font-semibold text-teal-600 shrink-0">{formatCurrency(p.precio_base)}</span>
                </button>
              ))}
              {productos.filter((p: ProductoMenu) => p.disponible).length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">No hay productos disponibles</p>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
