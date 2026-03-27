import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Plus, MapPin, Package, User, Clock, Eye, Navigation, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { deliveryRepository } from '@/infraestructura/repositorios';
import type { ZonaDelivery, DeliveryOrden } from '@/dominio/entidades';
import { Button, Badge, Card, Modal, Input, DataTable, Tabs, StatCard, EmptyState } from '@/infraestructura/ui/componentes/comunes';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/compartidos/utilidades';
import type { Column } from '@/infraestructura/ui/componentes/comunes/DataTable';

// ═══════════════════════════════════════════════════════════
// Delivery — zonas CRUD + \u00f3rdenes + seguimiento
// ═══════════════════════════════════════════════════════════

const zonaSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  costo_envio: z.coerce.number().min(0, 'Min 0'),
  tiempo_estimado_min: z.coerce.number().min(1, 'Min 1'),
  radio_km: z.coerce.number().optional(),
  activo: z.boolean().optional(),
});

type ZonaForm = z.infer<typeof zonaSchema>;

export default function DeliveryPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('ordenes');
  const [showZonaModal, setShowZonaModal] = useState(false);
  const [editingZona, setEditingZona] = useState<ZonaDelivery | null>(null);
  const [showAsignarModal, setShowAsignarModal] = useState<string | null>(null);
  const [showSeguimiento, setShowSeguimiento] = useState<DeliveryOrden | null>(null);
  const [showDeleteZona, setShowDeleteZona] = useState<ZonaDelivery | null>(null);
  const [repartidorId, setRepartidorId] = useState('');

  const { data: ordenes = [], isLoading: ordenesLoading } = useQuery({
    queryKey: ['delivery', 'ordenes'],
    queryFn: () => deliveryRepository.listarDeliveryOrdenes(),
    refetchInterval: 10000,
  });

  const { data: zonas = [] } = useQuery({
    queryKey: ['delivery', 'zonas'],
    queryFn: () => deliveryRepository.listarZonas(),
  });

  const crearZona = useMutation({
    mutationFn: (data: ZonaForm) => deliveryRepository.crearZona(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['delivery', 'zonas'] }); toast.success('Zona creada'); closeZonaModal(); },
  });

  const actualizarZona = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ZonaDelivery> }) => deliveryRepository.actualizarZona(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['delivery', 'zonas'] }); toast.success('Zona actualizada'); closeZonaModal(); },
  });

  const eliminarZona = useMutation({
    mutationFn: (id: string) => deliveryRepository.eliminarZona(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['delivery', 'zonas'] }); toast.success('Zona eliminada'); setShowDeleteZona(null); },
  });

  const asignarRepartidor = useMutation({
    mutationFn: ({ id, repartidorId: rid }: { id: string; repartidorId: string }) =>
      deliveryRepository.asignarRepartidor(id, { repartidor_id: rid }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['delivery'] }); toast.success('Repartidor asignado'); setShowAsignarModal(null); setRepartidorId(''); },
  });

  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => deliveryRepository.actualizarEstadoDelivery(id, estado),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['delivery'] }); toast.success('Estado actualizado'); },
  });

  const zonaForm = useForm<ZonaForm>({ resolver: zodResolver(zonaSchema) });

  const closeZonaModal = () => { setShowZonaModal(false); setEditingZona(null); zonaForm.reset(); };

  const openNewZona = () => { setEditingZona(null); zonaForm.reset(); setShowZonaModal(true); };

  const openEditZona = (z: ZonaDelivery) => {
    setEditingZona(z);
    zonaForm.reset({
      nombre: z.nombre,
      costo_envio: z.costo_envio,
      tiempo_estimado_min: z.tiempo_estimado_min,
      radio_km: z.radio_km || undefined,
      activo: z.activo !== false,
    });
    setShowZonaModal(true);
  };

  const onZonaSubmit = (data: ZonaForm) => {
    if (editingZona) {
      actualizarZona.mutate({ id: String(editingZona.id), data });
    } else {
      crearZona.mutate(data);
    }
  };

  const pendientes = ordenes.filter((o: DeliveryOrden) => o.estado_delivery === 'pendiente');
  const enCamino = ordenes.filter((o: DeliveryOrden) => o.estado_delivery === 'en_camino');
  const entregadas = ordenes.filter((o: DeliveryOrden) => o.estado_delivery === 'entregado');

  const tabs = [
    { id: 'ordenes', label: '\u00d3rdenes', icon: <Package className="h-4 w-4" />, count: ordenes.length },
    { id: 'zonas', label: 'Zonas', icon: <MapPin className="h-4 w-4" />, count: zonas.length },
  ];

  const ordenColumns: Column<DeliveryOrden>[] = [
    {
      key: 'orden_id',
      label: 'Orden',
      render: (o) => <span className="font-mono text-sm font-bold">#{String(o.orden_id).slice(0, 8)}</span>,
    },
    {
      key: 'direccion_entrega',
      label: 'Direcci\u00f3n',
      render: (o) => (
        <div className="max-w-[250px]">
          <p className="text-sm text-slate-900 dark:text-white truncate">{o.direccion_entrega}</p>
          {o.referencia_entrega && <p className="text-xs text-slate-500 truncate">{o.referencia_entrega}</p>}
        </div>
      ),
    },
    {
      key: 'cliente_nombre',
      label: 'Cliente',
      render: (o) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400" />
          <span className="text-sm">{o.cliente_nombre || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (o) => <Badge variant={getStatusColor(o.estado_delivery) as any} dot>{getStatusLabel(o.estado_delivery)}</Badge>,
    },
    {
      key: 'repartidor_nombre',
      label: 'Repartidor',
      render: (o) => o.repartidor_nombre ? (
        <span className="flex items-center gap-1 text-sm"><Navigation className="h-3.5 w-3.5 text-teal-500" />{o.repartidor_nombre}</span>
      ) : <span className="text-slate-400">Sin asignar</span>,
    },
    {
      key: 'id',
      label: '',
      render: (o) => (
        <div className="flex gap-1">
          {!o.repartidor_id && o.estado_delivery === 'pendiente' && (
            <Button size="sm" variant="primary" onClick={() => setShowAsignarModal(String(o.id))}>Asignar</Button>
          )}
          {o.estado_delivery === 'pendiente' && o.repartidor_id && (
            <Button size="sm" variant="success" onClick={() => cambiarEstado.mutate({ id: String(o.id), estado: 'en_camino' })}>En camino</Button>
          )}
          {o.estado_delivery === 'en_camino' && (
            <Button size="sm" variant="success" onClick={() => cambiarEstado.mutate({ id: String(o.id), estado: 'entregado' })}>Entregado</Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setShowSeguimiento(o)}><Eye className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="h-7 w-7 text-teal-600" /> Delivery
          </h1>
          <p className="text-slate-500">Gesti\u00f3n de entregas y zonas de cobertura</p>
        </div>
        {tab === 'zonas' && (
          <Button onClick={openNewZona}>
            <Plus className="h-4 w-4" /> Nueva Zona
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="Pendientes" value={pendientes.length.toString()} icon={<Clock className="h-5 w-5" />} color="amber" />
        <StatCard title="En Camino" value={enCamino.length.toString()} icon={<Truck className="h-5 w-5" />} color="blue" />
        <StatCard title="Entregadas" value={entregadas.length.toString()} icon={<Package className="h-5 w-5" />} color="emerald" />
        <StatCard title="Zonas Activas" value={zonas.filter((z: ZonaDelivery) => z.activo !== false).length.toString()} icon={<MapPin className="h-5 w-5" />} color="teal" />
      </div>

      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {/* --- TAB: \u00d3rdenes --- */}
      {tab === 'ordenes' && (
        <Card>
          <DataTable
            columns={ordenColumns}
            data={ordenes}
            isLoading={ordenesLoading}
            searchable
            searchPlaceholder="Buscar por direcci\u00f3n, cliente..."
            emptyMessage="No hay \u00f3rdenes de delivery"
          />
        </Card>
      )}

      {/* --- TAB: Zonas --- */}
      {tab === 'zonas' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zonas.length === 0 ? (
            <div className="col-span-full">
              <EmptyState icon={<MapPin className="h-12 w-12" />} title="Sin zonas de delivery" description="Cree zonas para comenzar" action={<Button onClick={openNewZona}><Plus className="h-4 w-4" /> Crear zona</Button>} />
            </div>
          ) : (
            zonas.map((zona: ZonaDelivery) => (
              <Card key={zona.id}>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{zona.nombre}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={zona.activo !== false ? 'success' : 'danger'}>{zona.activo !== false ? 'Activa' : 'Inactiva'}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => openEditZona(zona)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setShowDeleteZona(zona)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Costo env\u00edo</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(zona.costo_envio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tiempo estimado</span>
                      <span className="font-semibold">{zona.tiempo_estimado_min} min</span>
                    </div>
                    {zona.radio_km && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Radio</span>
                        <span className="font-semibold">{zona.radio_km} km</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modal crear/editar zona */}
      <Modal isOpen={showZonaModal} onClose={closeZonaModal} title={editingZona ? 'Editar Zona' : 'Nueva Zona de Delivery'} size="md">
        <form onSubmit={zonaForm.handleSubmit(onZonaSubmit)} className="space-y-4">
          <Input label="Nombre" {...zonaForm.register('nombre')} error={zonaForm.formState.errors.nombre?.message} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input type="number" step="0.01" label="Costo Env\u00edo" {...zonaForm.register('costo_envio')} error={zonaForm.formState.errors.costo_envio?.message} />
            <Input type="number" label="Tiempo Estimado (min)" {...zonaForm.register('tiempo_estimado_min')} error={zonaForm.formState.errors.tiempo_estimado_min?.message} />
          </div>
          <Input type="number" step="0.1" label="Radio (km, opcional)" {...zonaForm.register('radio_km')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={closeZonaModal}>Cancelar</Button>
            <Button type="submit" isLoading={crearZona.isPending || actualizarZona.isPending}>{editingZona ? 'Guardar cambios' : 'Crear Zona'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal confirmar eliminar zona */}
      <Modal isOpen={!!showDeleteZona} onClose={() => setShowDeleteZona(null)} title="Eliminar Zona" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            \u00bfSeguro que deseas eliminar la zona <strong>{showDeleteZona?.nombre}</strong>? Esta acci\u00f3n no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteZona(null)}>Cancelar</Button>
            <Button variant="danger" onClick={() => showDeleteZona && eliminarZona.mutate(String(showDeleteZona.id))} isLoading={eliminarZona.isPending}>Eliminar</Button>
          </div>
        </div>
      </Modal>

      {/* Modal asignar repartidor */}
      <Modal isOpen={!!showAsignarModal} onClose={() => setShowAsignarModal(null)} title="Asignar Repartidor" size="sm">
        <div className="space-y-4">
          <Input label="ID del Repartidor" value={repartidorId} onChange={(e) => setRepartidorId(e.target.value)} placeholder="Ingrese el ID del repartidor" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAsignarModal(null)}>Cancelar</Button>
            <Button
              onClick={() => showAsignarModal && asignarRepartidor.mutate({ id: showAsignarModal, repartidorId })}
              isLoading={asignarRepartidor.isPending}
              disabled={!repartidorId}
            >
              Asignar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal seguimiento */}
      <Modal isOpen={!!showSeguimiento} onClose={() => setShowSeguimiento(null)} title="Seguimiento de Entrega" size="md">
        {showSeguimiento && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Direcci\u00f3n</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{showSeguimiento.direccion_entrega}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Estado</p>
                <Badge variant={getStatusColor(showSeguimiento.estado_delivery) as any} dot>{getStatusLabel(showSeguimiento.estado_delivery)}</Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500">Repartidor</p>
                <p className="text-sm font-medium">{showSeguimiento.repartidor_nombre || 'Sin asignar'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Cliente</p>
                <p className="text-sm font-medium">{showSeguimiento.cliente_nombre || 'N/A'}</p>
              </div>
            </div>
            {showSeguimiento.referencia_entrega && (
              <div>
                <p className="text-xs text-slate-500">Referencia</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{showSeguimiento.referencia_entrega}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
