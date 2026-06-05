import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, Plus, Users, Coffee, Ban, Sparkles, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { localRepository } from '@/infraestructura/repositorios';
import type { Zona, Mesa } from '@/dominio/entidades';
import { Button, Badge, Card, Modal, Input, Select, Tabs, EmptyState } from '@/infraestructura/ui/componentes/comunes';
import { useUIStore } from '@/infraestructura/store/useUIStore';
import { useAuthStore } from '@/infraestructura/store/useAuthStore';

// ═══════════════════════════════════════════════════════════
// Mesas — plano visual de zonas y mesas
// ═══════════════════════════════════════════════════════════

const mesaSchema = z.object({
  numero: z.coerce.number().min(1, 'Requerido'),
  capacidad: z.coerce.number().min(1, 'Min 1'),
  zona_id: z.string().min(1, 'Seleccione zona'),
  forma: z.string().optional(),
  pos_x: z.coerce.number().optional(),
  pos_y: z.coerce.number().optional(),
});

const zonaSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  descripcion: z.string().optional(),
  color: z.string().optional(),
});

type MesaForm = z.infer<typeof mesaSchema>;
type ZonaForm = z.infer<typeof zonaSchema>;

const estadoConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  disponible: { icon: <Sparkles className="h-4 w-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Disponible' },
  ocupada: { icon: <Users className="h-4 w-4" />, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'Ocupada' },
  reservada: { icon: <Coffee className="h-4 w-4" />, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Reservada' },
  fuera_servicio: { icon: <Ban className="h-4 w-4" />, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Fuera de servicio' },
};

export default function MesasPage() {
  const qc = useQueryClient();
  const localId = useUIStore((s) => s.localSeleccionadoId);
  const { usuario } = useAuthStore();
  const isReadOnly = usuario?.rol === 'mesero' || usuario?.rol === 'cocinero';
  const [zonaActiva, setZonaActiva] = useState<string>('todas');
  const [showMesaModal, setShowMesaModal] = useState(false);
  const [showZonaModal, setShowZonaModal] = useState(false);
  const [editingMesa, setEditingMesa] = useState<Mesa | null>(null);

  const { data: zonas = [] } = useQuery({
    queryKey: ['zonas', localId],
    queryFn: () => localRepository.listarZonas(),
    enabled: !!localId,
  });

  const { data: mesas = [], isLoading } = useQuery({
    queryKey: ['mesas', localId],
    queryFn: () => localRepository.listarMesas(),
    enabled: !!localId,
    refetchInterval: 10000,
  });

  const crearZona = useMutation({
    mutationFn: (data: ZonaForm) => localRepository.crearZona(data as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['zonas'] }); toast.success('Zona creada'); setShowZonaModal(false); },
  });

  const crearMesa = useMutation({
    mutationFn: (data: MesaForm) => localRepository.crearMesa(data as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mesas'] }); toast.success('Mesa creada'); setShowMesaModal(false); setEditingMesa(null); },
  });

  const actualizarMesa = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MesaForm }) => localRepository.actualizarMesa(id, data as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mesas'] }); toast.success('Mesa actualizada'); setShowMesaModal(false); setEditingMesa(null); },
  });

  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => localRepository.cambiarEstadoMesa(id, estado),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mesas'] }); toast.success('Estado actualizado'); },
  });

  const eliminarMesa = useMutation({
    mutationFn: (id: string) => localRepository.eliminarMesa(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mesas'] }); toast.success('Mesa eliminada'); },
  });

  const mesaForm = useForm<MesaForm>({ resolver: zodResolver(mesaSchema) });
  const zonaForm = useForm<ZonaForm>({ resolver: zodResolver(zonaSchema) });

  const mesasFiltradas = zonaActiva === 'todas' ? mesas : mesas.filter((m: Mesa) => String(m.zona_id) === zonaActiva);

  const tabs = [
    { id: 'todas', label: 'Todas', count: mesas.length },
    ...zonas.map((z: Zona) => ({
      id: String(z.id),
      label: z.nombre,
      count: mesas.filter((m: Mesa) => m.zona_id === z.id).length,
    })),
  ];

  const nextEstado = (current: string) => {
    const map: Record<string, string> = { disponible: 'ocupada', ocupada: 'disponible', reservada: 'ocupada', fuera_servicio: 'disponible' };
    return map[current] || 'disponible';
  };

  if (!localId) return <EmptyState icon={<LayoutGrid className="h-12 w-12" />} title="Seleccione un local" description="Debe seleccionar un local para gestionar las mesas" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutGrid className="h-7 w-7 text-teal-600" /> Mesas
          </h1>
          <p className="text-slate-500">Gestión visual de zonas y mesas del restaurante</p>
        </div>
        <div className="flex gap-2">
          {!isReadOnly && (
            <>
              <Button variant="outline" onClick={() => setShowZonaModal(true)}>
                <Plus className="h-4 w-4" /> Zona
              </Button>
              <Button onClick={() => { setEditingMesa(null); mesaForm.reset(); setShowMesaModal(true); }}>
                <Plus className="h-4 w-4" /> Mesa
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        {Object.entries(estadoConfig).map(([key, cfg]) => {
          const count = mesas.filter((m: Mesa) => m.estado === key).length;
          return (
            <Card key={key}>
              <div className="flex items-center gap-3 p-4">
                <div className={`rounded-xl p-2 ${cfg.bg}`}>
                  <span className={cfg.color}>{cfg.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                  <p className="text-xs text-slate-500">{cfg.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Tabs tabs={tabs} activeTab={zonaActiva} onChange={setZonaActiva} />

      {/* Mesa grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : mesasFiltradas.length === 0 ? (
        <EmptyState icon={<LayoutGrid className="h-12 w-12" />} title="No hay mesas" description="Cree una mesa para comenzar" action={!isReadOnly ? <Button onClick={() => setShowMesaModal(true)}><Plus className="h-4 w-4" /> Crear mesa</Button> : undefined} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {mesasFiltradas.map((mesa: Mesa) => {
            const cfg = estadoConfig[mesa.estado] ?? estadoConfig['disponible']!;
            return (
              <div
                key={mesa.id}
                className={`group relative rounded-2xl border-2 p-5 text-center cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${cfg.bg}`}
                onClick={() => cambiarEstado.mutate({ id: String(mesa.id), estado: nextEstado(mesa.estado) })}
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isReadOnly && (
                    <>
                      <button
                        className="rounded-lg bg-white/85 p-1.5 text-slate-500 hover:text-teal-600"
                        onClick={(e) => { e.stopPropagation(); setEditingMesa(mesa); mesaForm.reset({ numero: mesa.numero, capacidad: mesa.capacidad, zona_id: String(mesa.zona_id) }); setShowMesaModal(true); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="rounded-lg bg-white/85 p-1.5 text-slate-500 hover:text-red-600"
                        onClick={(e) => { e.stopPropagation(); if (confirm('¿Eliminar mesa?')) eliminarMesa.mutate(String(mesa.id)); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>

                <div className={`mb-2 ${cfg.color}`}>{cfg.icon}</div>
                <p className="text-3xl font-bold text-slate-900">{mesa.numero}</p>
                <p className="text-xs text-slate-500 mt-1">
                  <Users className="inline h-3 w-3 mr-1" />{mesa.capacidad} personas
                </p>
                <Badge variant={mesa.estado === 'disponible' ? 'success' : mesa.estado === 'ocupada' ? 'info' : mesa.estado === 'reservada' ? 'warning' : 'danger'} className="mt-2">
                  {cfg.label}
                </Badge>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal crear/editar mesa */}
      <Modal isOpen={showMesaModal} onClose={() => setShowMesaModal(false)} title={editingMesa ? 'Editar Mesa' : 'Nueva Mesa'} size="md">
        <form onSubmit={mesaForm.handleSubmit((d) => editingMesa ? actualizarMesa.mutate({ id: String(editingMesa.id), data: d }) : crearMesa.mutate(d))} className="space-y-4">
          <Input type="number" label="Número" {...mesaForm.register('numero')} error={mesaForm.formState.errors.numero?.message} />
          <Input type="number" label="Capacidad" {...mesaForm.register('capacidad')} error={mesaForm.formState.errors.capacidad?.message} />
          <Select
            label="Zona"
            options={zonas.map((z: Zona) => ({ value: String(z.id), label: z.nombre }))}
            {...mesaForm.register('zona_id')}
            error={mesaForm.formState.errors.zona_id?.message}
          />
          <Select
            label="Forma"
            options={[{ value: 'cuadrada', label: 'Cuadrada' }, { value: 'redonda', label: 'Redonda' }, { value: 'rectangular', label: 'Rectangular' }]}
            {...mesaForm.register('forma')}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowMesaModal(false)}>Cancelar</Button>
            <Button type="submit" isLoading={crearMesa.isPending || actualizarMesa.isPending}>{editingMesa ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal crear zona */}
      <Modal isOpen={showZonaModal} onClose={() => setShowZonaModal(false)} title="Nueva Zona" size="md">
        <form onSubmit={zonaForm.handleSubmit((d) => crearZona.mutate(d))} className="space-y-4">
          <Input label="Nombre" {...zonaForm.register('nombre')} error={zonaForm.formState.errors.nombre?.message} />
          <Input label="Descripción" {...zonaForm.register('descripcion')} />
          <Input label="Color (hex)" {...zonaForm.register('color')} placeholder="#10b981" />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowZonaModal(false)}>Cancelar</Button>
            <Button type="submit" isLoading={crearZona.isPending}>Crear zona</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
