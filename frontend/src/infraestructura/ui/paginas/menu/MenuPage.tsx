import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, UtensilsCrossed, Package, Layers, Percent, Ticket, Pencil, Trash2, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import { menuRepository } from '@/infraestructura/repositorios';
import type { CategoriaMenu, ProductoMenu, Combo, Promocion, Cupon } from '@/dominio/entidades';
import { Button, Card, Input, Modal, Badge, DataTable, Tabs, EmptyState, StatCard } from '@/infraestructura/ui/componentes/comunes';
import type { Column } from '@/infraestructura/ui/componentes/comunes';
import { formatCurrency } from '@/compartidos/utilidades';
import { useAuthStore } from '@/infraestructura/store/useAuthStore';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Menu Page â€” Full CRUD: CategorÃ­as, Productos, Combos, Promos, Cupones
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState('categorias');
  const qc = useQueryClient();
  const { usuario } = useAuthStore();
  const isReadOnly = usuario?.rol === 'mesero';
  const isCocinero = usuario?.rol === 'cocinero';
  const canEditMenu = !isReadOnly && !isCocinero;

  // â”€â”€â”€ Modals state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoriaMenu | null>(null);
  const [catForm, setCatForm] = useState({ nombre: '', descripcion: '' });

  const [showProdModal, setShowProdModal] = useState(false);
  const [editingProd, setEditingProd] = useState<ProductoMenu | null>(null);
  const [prodForm, setProdForm] = useState({ nombre: '', precio_base: '', categoria_menu_id: '', descripcion: '' });

  const [showComboModal, setShowComboModal] = useState(false);
  const [comboForm, setComboForm] = useState({ nombre: '', descripcion: '', precio_combo: '' });

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoForm, setPromoForm] = useState({ nombre: '', descripcion: '', tipo_descuento: 'porcentaje', valor_descuento: '', fecha_inicio: '', fecha_fin: '' });

  const [showCuponModal, setShowCuponModal] = useState(false);
  const [cuponForm, setCuponForm] = useState({ codigo: '', descripcion: '', tipo_descuento: 'porcentaje', valor_descuento: '', monto_minimo: '', fecha_inicio: '', fecha_fin: '', usos_maximos: '' });

  // â”€â”€â”€ Queries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { data: categorias = [], isLoading: loadingCats } = useQuery({
    queryKey: ['menu', 'categorias'],
    queryFn: () => menuRepository.listarCategorias(),
  });
  const { data: productos = [], isLoading: loadingProds } = useQuery({
    queryKey: ['menu', 'productos'],
    queryFn: () => menuRepository.listarProductos(),
  });
  const { data: combos = [] } = useQuery({ queryKey: ['menu', 'combos'], queryFn: () => menuRepository.listarCombos() });
  const { data: promos = [] } = useQuery({ queryKey: ['menu', 'promociones'], queryFn: () => menuRepository.listarPromociones() });
  const { data: cupones = [] } = useQuery({ queryKey: ['menu', 'cupones'], queryFn: () => menuRepository.listarCupones() });

  const categoriasSafe = Array.isArray(categorias) ? categorias : [];
  const productosSafe = Array.isArray(productos) ? productos : [];
  const combosSafe = Array.isArray(combos) ? combos : [];
  const promosSafe = Array.isArray(promos) ? promos : [];
  const cuponesSafe = Array.isArray(cupones) ? cupones : [];

  // â”€â”€â”€ Mutations: CategorÃ­as â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const crearCat = useMutation({
    mutationFn: (data: Partial<CategoriaMenu>) => menuRepository.crearCategoria(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu', 'categorias'] }); toast.success('CategorÃ­a creada'); closeCatModal(); },
    onError: () => toast.error('Error al crear categorÃ­a'),
  });
  const actualizarCat = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoriaMenu> }) => menuRepository.actualizarCategoria(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu', 'categorias'] }); toast.success('CategorÃ­a actualizada'); closeCatModal(); },
    onError: () => toast.error('Error al actualizar categorÃ­a'),
  });
  const eliminarCat = useMutation({
    mutationFn: (id: string) => menuRepository.eliminarCategoria(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu', 'categorias'] }); toast.success('CategorÃ­a eliminada'); },
  });

  // â”€â”€â”€ Mutations: Productos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const crearProd = useMutation({
    mutationFn: (data: Partial<ProductoMenu>) => menuRepository.crearProducto(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu', 'productos'] }); toast.success('Producto creado'); closeProdModal(); },
    onError: () => toast.error('Error al crear producto'),
  });
  const actualizarProd = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductoMenu> }) => menuRepository.actualizarProducto(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu', 'productos'] }); toast.success('Producto actualizado'); closeProdModal(); },
    onError: () => toast.error('Error al actualizar producto'),
  });
  const eliminarProd = useMutation({
    mutationFn: (id: string) => menuRepository.eliminarProducto(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu', 'productos'] }); toast.success('Producto eliminado'); },
  });
  const toggleDisp = useMutation({
    mutationFn: ({ id, disponible }: { id: string; disponible: boolean }) => menuRepository.cambiarDisponibilidad(id, disponible),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu', 'productos'] }); },
  });

  // â”€â”€â”€ Mutations: Combos, Promos, Cupones â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const crearCombo = useMutation({
    mutationFn: (data: Partial<Combo>) => menuRepository.crearCombo(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu', 'combos'] }); toast.success('Combo creado'); setShowComboModal(false); },
    onError: () => toast.error('Error al crear combo'),
  });
  const crearPromo = useMutation({
    mutationFn: (data: Partial<Promocion>) => menuRepository.crearPromocion(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu', 'promociones'] }); toast.success('PromociÃ³n creada'); setShowPromoModal(false); },
    onError: () => toast.error('Error al crear promociÃ³n'),
  });
  const crearCupon = useMutation({
    mutationFn: (data: Partial<Cupon>) => menuRepository.crearCupon(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu', 'cupones'] }); toast.success('CupÃ³n creado'); setShowCuponModal(false); },
    onError: () => toast.error('Error al crear cupÃ³n'),
  });

  // â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const closeCatModal = () => { setShowCatModal(false); setEditingCat(null); setCatForm({ nombre: '', descripcion: '' }); };
  const openEditCat = (c: CategoriaMenu) => { setEditingCat(c); setCatForm({ nombre: c.nombre, descripcion: c.descripcion }); setShowCatModal(true); };
  const openNewCat = () => { setEditingCat(null); setCatForm({ nombre: '', descripcion: '' }); setShowCatModal(true); };

  const closeProdModal = () => { setShowProdModal(false); setEditingProd(null); setProdForm({ nombre: '', precio_base: '', categoria_menu_id: '', descripcion: '' }); };
  const openEditProd = (p: ProductoMenu) => { setEditingProd(p); setProdForm({ nombre: p.nombre, precio_base: String(p.precio_base), categoria_menu_id: String(p.categoria_menu_id), descripcion: p.descripcion }); setShowProdModal(true); };
  const openNewProd = () => { setEditingProd(null); setProdForm({ nombre: '', precio_base: '', categoria_menu_id: '', descripcion: '' }); setShowProdModal(true); };

  const saveCat = () => {
    const data = { nombre: catForm.nombre, descripcion: catForm.descripcion, activo: true };
    if (editingCat) actualizarCat.mutate({ id: String(editingCat.id), data });
    else crearCat.mutate(data);
  };

  const saveProd = () => {
    const data = { nombre: prodForm.nombre, precio_base: parseFloat(prodForm.precio_base) || 0, categoria_menu_id: parseInt(prodForm.categoria_menu_id) || 0, descripcion: prodForm.descripcion, disponible: true };
    if (editingProd) actualizarProd.mutate({ id: String(editingProd.id), data });
    else crearProd.mutate(data);
  };

  // â”€â”€â”€ Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const tabs = [
    { id: 'categorias', label: 'CategorÃ­as', icon: <Layers className="h-4 w-4" />, count: categoriasSafe.length },
    { id: 'productos', label: 'Productos', icon: <Package className="h-4 w-4" />, count: productosSafe.length },
    { id: 'combos', label: 'Combos', icon: <UtensilsCrossed className="h-4 w-4" />, count: combosSafe.length },
    { id: 'promociones', label: 'Promociones', icon: <Percent className="h-4 w-4" />, count: promosSafe.length },
    { id: 'cupones', label: 'Cupones', icon: <Ticket className="h-4 w-4" />, count: cuponesSafe.length },
  ];

  // â”€â”€â”€ Column Definitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const catColumns: Column<CategoriaMenu>[] = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'orden', label: 'Orden', sortable: true },
    { key: 'activo', label: 'Estado', render: (c) => <Badge variant={c.activo ? 'success' : 'default'} dot>{c.activo ? 'Activa' : 'Inactiva'}</Badge> },
    ...(!isReadOnly && !isCocinero ? [{ key: 'acciones' as keyof CategoriaMenu, label: '', render: (c: CategoriaMenu) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => openEditCat(c)}><Pencil className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => { if (confirm('¿Eliminar esta categoría?')) eliminarCat.mutate(String(c.id)); }}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    )}] : []),
  ];

  const prodColumns: Column<ProductoMenu>[] = [
    { key: 'nombre', label: 'Producto', sortable: true, render: (p) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center"><Package className="h-5 w-5 text-slate-400" /></div>
        <div>
          <p className="font-medium text-slate-900">{p.nombre}</p>
          <p className="text-xs text-slate-400 max-w-[200px] truncate">{p.descripcion || '-'}</p>
        </div>
      </div>
    )},
    { key: 'precio_base', label: 'Precio', sortable: true, render: (p) => <span className="font-semibold">{formatCurrency(p.precio_base)}</span> },
    { key: 'categoria_menu_id', label: 'Categoría', render: (p) => {
      const cat = categoriasSafe.find((c: CategoriaMenu) => c.id === p.categoria_menu_id);
      return <Badge variant="teal">{cat?.nombre || '-'}</Badge>;
    }},
    { key: 'disponible', label: 'Disponible', render: (p) => (
      <button onClick={() => !isReadOnly && !isCocinero && toggleDisp.mutate({ id: String(p.id), disponible: !p.disponible })} className={`relative h-6 w-11 rounded-full transition-colors ${p.disponible ? 'bg-emerald-500' : 'bg-slate-300'} ${isReadOnly || isCocinero ? 'cursor-default opacity-60' : 'cursor-pointer'}`} disabled={isReadOnly || isCocinero}>
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${p.disponible ? 'translate-x-5' : ''}`} />
      </button>
    )},
    ...(isCocinero ? [{ key: 'agotado' as keyof ProductoMenu, label: 'Agotado Hoy', render: (p: ProductoMenu) => (
      <button
        onClick={() => toggleDisp.mutate({ id: String(p.id), disponible: !!p.disponible ? false : true })}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
          !p.disponible ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600'
        }`}
      >
        <Ban className="h-3.5 w-3.5" />
        {!p.disponible ? 'Agotado' : 'Marcar agotado'}
      </button>
    )}] : []),
    ...(!isReadOnly && !isCocinero ? [{ key: 'acciones' as keyof ProductoMenu, label: '', render: (p: ProductoMenu) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => openEditProd(p)}><Pencil className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => { if (confirm('¿Eliminar este producto?')) eliminarProd.mutate(String(p.id)); }}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    )}] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-amber-100 bg-gradient-to-br from-white via-amber-50/70 to-teal-50 p-6 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.14),transparent_32%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700 shadow-sm">
              <Layers className="h-3.5 w-3.5" />
              Catálogo operativo
            </div>
            <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">Menú</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Gestiona categorías, productos, combos, promociones y cupones desde una sola vista.
            </p>
          </div>
          {canEditMenu && (
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={openNewCat}>Nueva categoría</Button>
              <Button onClick={openNewProd}>Nuevo producto</Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Categorías" value={categoriasSafe.length} icon={<Layers className="h-5 w-5" />} color="teal" />
        <StatCard title="Productos" value={productosSafe.length} icon={<Package className="h-5 w-5" />} color="blue" />
        <StatCard title="Combos" value={combosSafe.length} icon={<UtensilsCrossed className="h-5 w-5" />} color="emerald" />
        <StatCard title="Promociones" value={promosSafe.length} icon={<Percent className="h-5 w-5" />} color="amber" />
        <StatCard title="Cupones" value={cuponesSafe.length} icon={<Ticket className="h-5 w-5" />} color="purple" />
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* â”€â”€ CategorÃ­as â”€â”€ */}
      {activeTab === 'categorias' && (
        <Card>
          <DataTable columns={catColumns} data={categoriasSafe} keyExtractor={(c: CategoriaMenu) => String(c.id)} isLoading={loadingCats} searchable emptyMessage="No hay categorías creadas" actions={!isReadOnly && !isCocinero ? <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openNewCat}>Nueva categoría</Button> : undefined} />
        </Card>
      )}

      {/* â”€â”€ Productos â”€â”€ */}
      {activeTab === 'productos' && (
        <Card>
          <DataTable columns={prodColumns} data={productosSafe} keyExtractor={(p: ProductoMenu) => String(p.id)} isLoading={loadingProds} searchable searchPlaceholder="Buscar productos..." emptyMessage="No hay productos creados" actions={!isReadOnly && !isCocinero ? <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openNewProd}>Nuevo producto</Button> : undefined} />
        </Card>
      )}

      {/* â”€â”€ Combos â”€â”€ */}
      {activeTab === 'combos' && (
        <Card>
          {!isReadOnly && !isCocinero && (
            <div className="flex justify-end mb-4">
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setComboForm({ nombre: '', descripcion: '', precio_combo: '' }); setShowComboModal(true); }}>Nuevo combo</Button>
            </div>
          )}
          {combosSafe.length === 0 ? (
            <EmptyState title="Sin combos" description="Crea combos para ofrecer a tus clientes" action={<Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowComboModal(true)}>Nuevo combo</Button>} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {combosSafe.map((c: Combo) => (
                <div key={c.id} className="rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900">{c.nombre}</h4>
                    <Badge variant={c.disponible ? 'success' : 'default'}>{c.disponible ? 'Disponible' : 'No disp.'}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{c.descripcion}</p>
                  <p className="mt-2 text-lg font-bold text-teal-600">{formatCurrency(c.precio_combo)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* â”€â”€ Promociones â”€â”€ */}
      {activeTab === 'promociones' && (
        <Card>
          {!isReadOnly && !isCocinero && (
            <div className="flex justify-end mb-4">
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setPromoForm({ nombre: '', descripcion: '', tipo_descuento: 'porcentaje', valor_descuento: '', fecha_inicio: '', fecha_fin: '' }); setShowPromoModal(true); }}>Nueva promoción</Button>
            </div>
          )}
          {promosSafe.length === 0 ? (
            <EmptyState title="Sin promociones" description="Crea promociones para atraer más clientes" action={<Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowPromoModal(true)}>Nueva promoción</Button>} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {promosSafe.map((p: Promocion) => (
                <div key={p.id} className="rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900">{p.nombre}</h4>
                    <Badge variant={p.activo ? 'success' : 'default'}>{p.activo ? 'Activa' : 'Inactiva'}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{p.descripcion}</p>
                  <p className="mt-2 text-sm font-medium text-emerald-600">
                    {p.tipo_descuento === 'porcentaje' ? `${p.valor_descuento}% OFF` : `${formatCurrency(p.valor_descuento)} OFF`}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{p.fecha_inicio} - {p.fecha_fin}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* â”€â”€ Cupones â”€â”€ */}
      {activeTab === 'cupones' && (
        <Card>
          {!isReadOnly && !isCocinero && (
            <div className="flex justify-end mb-4">
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setCuponForm({ codigo: '', descripcion: '', tipo_descuento: 'porcentaje', valor_descuento: '', monto_minimo: '', fecha_inicio: '', fecha_fin: '', usos_maximos: '' }); setShowCuponModal(true); }}>Nuevo cupón</Button>
            </div>
          )}
          {cuponesSafe.length === 0 ? (
            <EmptyState title="Sin cupones" description="Genera cupones de descuento para tus clientes" action={<Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowCuponModal(true)}>Nuevo cupón</Button>} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cuponesSafe.map((c: Cupon) => (
                <div key={c.id} className="rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <code className="rounded-lg bg-teal-50 px-3 py-1 text-sm font-bold text-teal-700">{c.codigo}</code>
                    <Badge variant={c.activo ? 'success' : 'default'}>{c.activo ? 'Activo' : 'Inactivo'}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">{c.descripcion}</p>
                  <p className="text-sm font-medium text-emerald-600 mt-1">
                    {c.tipo_descuento === 'porcentaje' ? `${c.valor_descuento}%` : formatCurrency(c.valor_descuento)} de descuento
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                    <span>Usos: {c.usos_actuales}/{c.usos_maximos || '∞'}</span>
                    <span>{c.fecha_inicio} - {c.fecha_fin}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â• MODALS â•â•â•â•â•â•â•â•â•â•â•â• */}

      {/* Modal: CategorÃ­a (crear/editar) */}
      <Modal isOpen={showCatModal} onClose={closeCatModal} title={editingCat ? 'Editar categorÃ­a' : 'Nueva categorÃ­a'} footer={
        <>
          <Button variant="outline" onClick={closeCatModal}>Cancelar</Button>
          <Button isLoading={crearCat.isPending || actualizarCat.isPending} onClick={saveCat}>{editingCat ? 'Guardar cambios' : 'Crear categorÃ­a'}</Button>
        </>
      }>
        <div className="space-y-4">
          <Input label="Nombre" placeholder="Ej: Entradas" value={catForm.nombre} onChange={(e) => setCatForm({ ...catForm, nombre: e.target.value })} />
          <Input label="DescripciÃ³n" placeholder="DescripciÃ³n opcional" value={catForm.descripcion} onChange={(e) => setCatForm({ ...catForm, descripcion: e.target.value })} />
        </div>
      </Modal>

      {/* Modal: Producto (crear/editar) */}
      <Modal isOpen={showProdModal} onClose={closeProdModal} title={editingProd ? 'Editar producto' : 'Nuevo producto'} size="lg" footer={
        <>
          <Button variant="outline" onClick={closeProdModal}>Cancelar</Button>
          <Button isLoading={crearProd.isPending || actualizarProd.isPending} onClick={saveProd}>{editingProd ? 'Guardar cambios' : 'Crear producto'}</Button>
        </>
      }>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre" placeholder="Ej: Lomo Saltado" value={prodForm.nombre} onChange={(e) => setProdForm({ ...prodForm, nombre: e.target.value })} />
          <Input label="Precio" type="number" placeholder="0.00" value={prodForm.precio_base} onChange={(e) => setProdForm({ ...prodForm, precio_base: e.target.value })} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">CategorÃ­a</label>
            <select className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" value={prodForm.categoria_menu_id} onChange={(e) => setProdForm({ ...prodForm, categoria_menu_id: e.target.value })}>
              <option value="">Seleccionar categorÃ­a</option>
              {categoriasSafe.map((c: CategoriaMenu) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <Input label="DescripciÃ³n" placeholder="DescripciÃ³n del producto" value={prodForm.descripcion} onChange={(e) => setProdForm({ ...prodForm, descripcion: e.target.value })} />
        </div>
      </Modal>

      {/* Modal: Combo */}
      <Modal isOpen={showComboModal} onClose={() => setShowComboModal(false)} title="Nuevo Combo" footer={
        <>
          <Button variant="outline" onClick={() => setShowComboModal(false)}>Cancelar</Button>
          <Button isLoading={crearCombo.isPending} onClick={() => crearCombo.mutate({ nombre: comboForm.nombre, descripcion: comboForm.descripcion, precio_combo: parseFloat(comboForm.precio_combo) || 0, disponible: true, activo: true })}>Crear combo</Button>
        </>
      }>
        <div className="space-y-4">
          <Input label="Nombre" placeholder="Ej: Combo Familiar" value={comboForm.nombre} onChange={(e) => setComboForm({ ...comboForm, nombre: e.target.value })} />
          <Input label="DescripciÃ³n" placeholder="QuÃ© incluye el combo" value={comboForm.descripcion} onChange={(e) => setComboForm({ ...comboForm, descripcion: e.target.value })} />
          <Input label="Precio del combo" type="number" placeholder="0.00" value={comboForm.precio_combo} onChange={(e) => setComboForm({ ...comboForm, precio_combo: e.target.value })} />
        </div>
      </Modal>

      {/* Modal: PromociÃ³n */}
      <Modal isOpen={showPromoModal} onClose={() => setShowPromoModal(false)} title="Nueva PromociÃ³n" size="lg" footer={
        <>
          <Button variant="outline" onClick={() => setShowPromoModal(false)}>Cancelar</Button>
          <Button isLoading={crearPromo.isPending} onClick={() => crearPromo.mutate({ nombre: promoForm.nombre, descripcion: promoForm.descripcion, tipo_descuento: promoForm.tipo_descuento as 'porcentaje' | 'monto_fijo', valor_descuento: parseFloat(promoForm.valor_descuento) || 0, fecha_inicio: promoForm.fecha_inicio, fecha_fin: promoForm.fecha_fin, activo: true })}>Crear promociÃ³n</Button>
        </>
      }>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre" placeholder="Ej: 2x1 Martes" value={promoForm.nombre} onChange={(e) => setPromoForm({ ...promoForm, nombre: e.target.value })} />
          <Input label="DescripciÃ³n" placeholder="Detalles de la promo" value={promoForm.descripcion} onChange={(e) => setPromoForm({ ...promoForm, descripcion: e.target.value })} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Tipo descuento</label>
            <select className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" value={promoForm.tipo_descuento} onChange={(e) => setPromoForm({ ...promoForm, tipo_descuento: e.target.value })}>
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="monto_fijo">Monto fijo ($)</option>
            </select>
          </div>
          <Input label="Valor descuento" type="number" placeholder="10" value={promoForm.valor_descuento} onChange={(e) => setPromoForm({ ...promoForm, valor_descuento: e.target.value })} />
          <Input label="Fecha inicio" type="date" value={promoForm.fecha_inicio} onChange={(e) => setPromoForm({ ...promoForm, fecha_inicio: e.target.value })} />
          <Input label="Fecha fin" type="date" value={promoForm.fecha_fin} onChange={(e) => setPromoForm({ ...promoForm, fecha_fin: e.target.value })} />
        </div>
      </Modal>

      {/* Modal: CupÃ³n */}
      <Modal isOpen={showCuponModal} onClose={() => setShowCuponModal(false)} title="Nuevo CupÃ³n" size="lg" footer={
        <>
          <Button variant="outline" onClick={() => setShowCuponModal(false)}>Cancelar</Button>
          <Button isLoading={crearCupon.isPending} onClick={() => crearCupon.mutate({ codigo: cuponForm.codigo.toUpperCase(), descripcion: cuponForm.descripcion, tipo_descuento: cuponForm.tipo_descuento, valor_descuento: parseFloat(cuponForm.valor_descuento) || 0, monto_minimo: cuponForm.monto_minimo ? parseFloat(cuponForm.monto_minimo) : null, fecha_inicio: cuponForm.fecha_inicio, fecha_fin: cuponForm.fecha_fin, usos_maximos: cuponForm.usos_maximos ? parseInt(cuponForm.usos_maximos) : null, activo: true })}>Crear cupÃ³n</Button>
        </>
      }>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="CÃ³digo" placeholder="Ej: DESCUENTO20" value={cuponForm.codigo} onChange={(e) => setCuponForm({ ...cuponForm, codigo: e.target.value })} />
          <Input label="DescripciÃ³n" placeholder="DescripciÃ³n del cupÃ³n" value={cuponForm.descripcion} onChange={(e) => setCuponForm({ ...cuponForm, descripcion: e.target.value })} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Tipo descuento</label>
            <select className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm" value={cuponForm.tipo_descuento} onChange={(e) => setCuponForm({ ...cuponForm, tipo_descuento: e.target.value })}>
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="monto_fijo">Monto fijo ($)</option>
            </select>
          </div>
          <Input label="Valor descuento" type="number" placeholder="10" value={cuponForm.valor_descuento} onChange={(e) => setCuponForm({ ...cuponForm, valor_descuento: e.target.value })} />
          <Input label="Monto mÃ­nimo (opcional)" type="number" placeholder="0" value={cuponForm.monto_minimo} onChange={(e) => setCuponForm({ ...cuponForm, monto_minimo: e.target.value })} />
          <Input label="Usos mÃ¡ximos (opcional)" type="number" placeholder="100" value={cuponForm.usos_maximos} onChange={(e) => setCuponForm({ ...cuponForm, usos_maximos: e.target.value })} />
          <Input label="Fecha inicio" type="date" value={cuponForm.fecha_inicio} onChange={(e) => setCuponForm({ ...cuponForm, fecha_inicio: e.target.value })} />
          <Input label="Fecha fin" type="date" value={cuponForm.fecha_fin} onChange={(e) => setCuponForm({ ...cuponForm, fecha_fin: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}

