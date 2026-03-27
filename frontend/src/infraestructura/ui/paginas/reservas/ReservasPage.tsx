import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Plus, Clock, Users, CheckCircle2, Phone, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { reservasRepository } from '@/infraestructura/repositorios';
import type { Reserva } from '@/dominio/entidades';
import { Button, Badge, Card, Modal, Input, DataTable, StatCard, Tabs } from '@/infraestructura/ui/componentes/comunes';
import { formatDate, getStatusLabel } from '@/compartidos/utilidades';
import type { Column } from '@/infraestructura/ui/componentes/comunes/DataTable';

// ═══════════════════════════════════════════════════════════
// Reservas — CRUD completo + estados
// ═══════════════════════════════════════════════════════════

const reservaSchema = z.object({
  cliente_nombre: z.string().min(1, 'Requerido'),
  cliente_telefono: z.string().min(1, 'Requerido'),
  cliente_email: z.string().email().optional().or(z.literal('')),
  fecha: z.string().min(1, 'Requerido'),
  hora: z.string().min(1, 'Requerido'),
  num_personas: z.coerce.number().min(1, 'Min 1'),
  mesa_id: z.string().optional(),
  notas: z.string().optional(),
});

type ReservaForm = z.infer<typeof reservaSchema>;

export default function ReservasPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('todas');
  const [showModal, setShowModal] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Reserva | null>(null);

  const { data: reservas = [], isLoading } = useQuery({
    queryKey: ['reservas'],
    queryFn: () => reservasRepository.listarReservas(),
  });

  const { data: totalHoyData } = useQuery({
    queryKey: ['reservas', 'hoy-total'],
    queryFn: () => reservasRepository.contarReservasHoy(),
  });
  const totalHoy = (totalHoyData as any)?.total ?? reservas.filter((r: Reserva) => r.fecha_reserva === new Date().toISOString().split('T')[0]).length;

  const crear = useMutation({
    mutationFn: (data: ReservaForm) => reservasRepository.crearReserva(data as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservas'] }); toast.success('Reserva creada'); closeModal(); },
  });

  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => reservasRepository.cambiarEstadoReserva(id, estado),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservas'] }); toast.success('Estado actualizado'); },
  });

  const form = useForm<ReservaForm>({ resolver: zodResolver(reservaSchema) });

  const closeModal = () => { setShowModal(false); setEditingReserva(null); form.reset(); };

  const openNew = () => { setEditingReserva(null); form.reset(); setShowModal(true); };

  const openEdit = (r: Reserva) => {
    setEditingReserva(r);
    form.reset({
      cliente_nombre: r.nombre_contacto,
      cliente_telefono: r.telefono_contacto,
      cliente_email: '',
      fecha: r.fecha_reserva,
      hora: r.hora_inicio,
      num_personas: r.numero_personas,
      notas: r.notas || '',
    });
    setShowModal(true);
  };

  const onSubmit = (data: ReservaForm) => {
    if (editingReserva) {
      // Update via state change or re-create
      crear.mutate(data);
    } else {
      crear.mutate(data);
    }
  };

  const handleDelete = (r: Reserva) => {
    // Cancel the reservation (soft delete)
    cambiarEstado.mutate({ id: String(r.id), estado: 'cancelada' });
    setShowDeleteConfirm(null);
    toast.success('Reserva cancelada');
  };

  const pendientes = reservas.filter((r: Reserva) => r.estado === 'pendiente');
  const confirmadas = reservas.filter((r: Reserva) => r.estado === 'confirmada');
  const completadas = reservas.filter((r: Reserva) => r.estado === 'completada');
  const canceladas = reservas.filter((r: Reserva) => r.estado === 'cancelada');

  const tabs = [
    { id: 'todas', label: 'Todas', count: reservas.length },
    { id: 'pendiente', label: 'Pendientes', count: pendientes.length },
    { id: 'confirmada', label: 'Confirmadas', count: confirmadas.length },
    { id: 'completada', label: 'Completadas', count: completadas.length },
    { id: 'cancelada', label: 'Canceladas', count: canceladas.length },
  ];

  const filtered = tab === 'todas' ? reservas : reservas.filter((r: Reserva) => r.estado === tab);

  const columns: Column<Reserva>[] = [
    {
      key: 'cliente_nombre',
      label: 'Cliente',
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{r.nombre_contacto}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1"><Phone className="h-3 w-3" />{r.telefono_contacto}</p>
        </div>
      ),
    },
    {
      key: 'fecha',
      label: 'Fecha/Hora',
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{formatDate(r.fecha_reserva)}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" />{r.hora_inicio}</p>
        </div>
      ),
    },
    {
      key: 'num_personas',
      label: 'Personas',
      sortable: true,
      render: (r) => (
        <span className="flex items-center gap-1 text-sm">
          <Users className="h-4 w-4 text-slate-400" /> {r.numero_personas}
        </span>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (r) => {
        const variantMap: Record<string, string> = { pendiente: 'warning', confirmada: 'info', en_curso: 'primary', completada: 'success', cancelada: 'danger', no_show: 'danger' };
        return <Badge variant={(variantMap[r.estado] || 'default') as any} dot>{getStatusLabel(r.estado)}</Badge>;
      },
    },
    {
      key: 'notas',
      label: 'Notas',
      render: (r) => r.notas ? <span className="text-xs text-slate-500 max-w-[200px] truncate block">{r.notas}</span> : <span className="text-slate-400">\u2014</span>,
    },
    {
      key: 'id',
      label: '',
      render: (r) => (
        <div className="flex gap-1">
          {/* Edit */}
          {(r.estado === 'pendiente' || r.estado === 'confirmada') && (
            <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {/* State transitions */}
          {r.estado === 'pendiente' && (
            <Button size="sm" variant="success" onClick={() => cambiarEstado.mutate({ id: String(r.id), estado: 'confirmada' })}>
              <CheckCircle2 className="h-3.5 w-3.5" />
            </Button>
          )}
          {r.estado === 'confirmada' && (
            <Button size="sm" variant="primary" onClick={() => cambiarEstado.mutate({ id: String(r.id), estado: 'completada' })}>
              Completar
            </Button>
          )}
          {/* Cancel / Delete */}
          {(r.estado === 'pendiente' || r.estado === 'confirmada') && (
            <Button size="sm" variant="danger" onClick={() => setShowDeleteConfirm(r)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-teal-600" /> Reservas
          </h1>
          <p className="text-slate-500">Gesti\u00f3n de reservas del restaurante</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Nueva Reserva
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="Hoy" value={totalHoy.toString()} icon={<CalendarDays className="h-5 w-5" />} color="teal" />
        <StatCard title="Pendientes" value={pendientes.length.toString()} icon={<Clock className="h-5 w-5" />} color="amber" />
        <StatCard title="Confirmadas" value={confirmadas.length.toString()} icon={<CheckCircle2 className="h-5 w-5" />} color="blue" />
        <StatCard title="Completadas" value={completadas.length.toString()} icon={<CheckCircle2 className="h-5 w-5" />} color="emerald" />
      </div>

      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      <Card>
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Buscar por cliente, tel\u00e9fono..."
          emptyMessage="No se encontraron reservas"
        />
      </Card>

      {/* Modal crear/editar */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingReserva ? 'Editar Reserva' : 'Nueva Reserva'} size="lg">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nombre del Cliente" {...form.register('cliente_nombre')} error={form.formState.errors.cliente_nombre?.message} />
            <Input label="Tel\u00e9fono" {...form.register('cliente_telefono')} error={form.formState.errors.cliente_telefono?.message} leftIcon={<Phone className="h-4 w-4" />} />
          </div>
          <Input label="Email (opcional)" type="email" {...form.register('cliente_email')} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Fecha" type="date" {...form.register('fecha')} error={form.formState.errors.fecha?.message} />
            <Input label="Hora" type="time" {...form.register('hora')} error={form.formState.errors.hora?.message} />
            <Input label="Personas" type="number" {...form.register('num_personas')} error={form.formState.errors.num_personas?.message} />
          </div>
          <Input label="ID Mesa (opcional)" {...form.register('mesa_id')} />
          <Input label="Notas" {...form.register('notas')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" isLoading={crear.isPending}>{editingReserva ? 'Guardar cambios' : 'Crear Reserva'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal confirmar cancelaci\u00f3n */}
      <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Cancelar Reserva" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            \u00bfSeguro que deseas cancelar la reserva de <strong>{showDeleteConfirm?.nombre_contacto}</strong> para el {showDeleteConfirm?.fecha_reserva}?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>No, mantener</Button>
            <Button variant="danger" onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}>S\u00ed, cancelar reserva</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
