import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Phone, Mail, MapPin, Eye, Pencil, Trash2, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { clientesRepository } from '@/infraestructura/repositorios';
import type { Cliente } from '@/dominio/entidades';
import { Button, Badge, Card, Modal, Input, DataTable } from '@/infraestructura/ui/componentes/comunes';
import { formatDate, formatCurrency, getInitials } from '@/compartidos/utilidades';
import type { Column } from '@/infraestructura/ui/componentes/comunes/DataTable';

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// Clientes Ã¢â‚¬â€ CRUD, bÃƒÂºsqueda, visitas
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

const clienteSchema = z.object({
  nombres: z.string().min(1, 'Requerido'),
  apellidos: z.string().min(1, 'Requerido'),
  correo: z.string().email('Email invÃƒÂ¡lido').optional().or(z.literal('')),
  celular: z.string().optional(),
  tipo_documento: z.string().optional(),
  numero_documento: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  // notas removed().optional(),
});

type ClienteForm = z.infer<typeof clienteSchema>;

export default function ClientesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Cliente | null>(null);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clientesRepository.listarClientes(),
  });

  const crear = useMutation({
    mutationFn: (data: ClienteForm) => editingCliente
      ? clientesRepository.actualizarCliente(String(editingCliente.id), data as any)
      : clientesRepository.crearCliente(data as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] });
      toast.success(editingCliente ? 'Cliente actualizado' : 'Cliente creado');
      setShowModal(false);
      setEditingCliente(null);
      form.reset();
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => clientesRepository.eliminarCliente(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clientes'] }); toast.success('Cliente eliminado'); },
  });

  const registrarVisita = useMutation({
    mutationFn: (id: string) => clientesRepository.registrarVisita(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clientes'] }); toast.success('Visita registrada'); },
  });

  const form = useForm<ClienteForm>({ resolver: zodResolver(clienteSchema) });

  const openEdit = (c: Cliente) => {
    setEditingCliente(c);
    form.reset({
      nombres: c.nombres,
      apellidos: c.apellidos,
      correo: c.correo || '',
      celular: c.celular || '',
      tipo_documento: c.tipo_documento || '',
      numero_documento: c.numero_documento || '',
    });
    setShowModal(true);
  };

  const columns: Column<Cliente>[] = [
    {
      key: 'nombre',
      label: 'Cliente',
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-xs font-bold text-white">
            {getInitials(`${c.nombres} ${c.apellidos}`)}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{c.nombres} {c.apellidos}</p>
            {c.correo && <p className="text-xs text-slate-500">{c.correo}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'telefono',
      label: 'TelÃƒÂ©fono',
      render: (c) => c.celular ? (
        <span className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
          <Phone className="h-3.5 w-3.5" /> {c.celular}
        </span>
      ) : <span className="text-slate-400">Ã¢â‚¬â€</span>,
    },
    {
      key: 'total_visitas',
      label: 'Visitas',
      sortable: true,
      render: (c) => (
        <Badge variant={c.cantidad_visitas > 10 ? 'success' : c.cantidad_visitas > 3 ? 'info' : 'default'}>
          {c.cantidad_visitas || 0} visitas
        </Badge>
      ),
    },
    {
      key: 'total_gastado',
      label: 'Total Gastado',
      sortable: true,
      render: (c) => <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(c.total_compras || 0)}</span>,
    },
    {
      key: 'ultima_visita',
      label: 'ÃƒÅ¡ltima Visita',
      sortable: true,
      render: (c) => c.actualizado_en ? <span className="text-sm text-slate-500">{formatDate(c.actualizado_en)}</span> : <span className="text-slate-400">Ã¢â‚¬â€</span>,
    },
    {
      key: 'id',
      label: '',
      render: (c) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setShowDetail(c)}><Eye className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => registrarVisita.mutate(String(c.id))}><Calendar className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => { if (confirm('Ã‚Â¿Eliminar cliente?')) eliminar.mutate(String(c.id)); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-7 w-7 text-teal-600" /> Clientes
          </h1>
          <p className="text-slate-500">{clientes.length} clientes registrados</p>
        </div>
        <Button onClick={() => { setEditingCliente(null); form.reset(); setShowModal(true); }}>
          <Plus className="h-4 w-4" /> Nuevo Cliente
        </Button>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={clientes}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Buscar por nombre, email, telÃƒÂ©fono..."
          emptyMessage="No se encontraron clientes"
        />
      </Card>

      {/* Modal crear / editar */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingCliente(null); }} title={editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'} size="lg">
        <form onSubmit={form.handleSubmit((d) => crear.mutate(d))} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nombre" {...form.register('nombres')} error={form.formState.errors.nombres?.message} />
            <Input label="Apellido" {...form.register('apellidos')} error={form.formState.errors.apellidos?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Email" type="email" {...form.register('correo')} error={form.formState.errors.correo?.message} leftIcon={<Mail className="h-4 w-4" />} />
            <Input label="TelÃƒÂ©fono" {...form.register('celular')} leftIcon={<Phone className="h-4 w-4" />} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Tipo Documento" {...form.register('tipo_documento')} placeholder="DNI, RUC, etc." />
            <Input label="NÃ‚Âº Documento" {...form.register('numero_documento')} />
          </div>
          <Input label="Fecha de Nacimiento" type="date" {...form.register('fecha_nacimiento')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowModal(false); setEditingCliente(null); }}>Cancelar</Button>
            <Button type="submit" isLoading={crear.isPending}>{editingCliente ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal detalle */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title="Detalle del Cliente" size="lg">
        {showDetail && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-xl font-bold text-white">
                {getInitials(`${showDetail.nombres} ${showDetail.apellidos}`)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{showDetail.nombres} {showDetail.apellidos}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  {showDetail.correo && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{showDetail.correo}</span>}
                  {showDetail.celular && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{showDetail.celular}</span>}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-teal-50 p-4 dark:bg-teal-900/20">
                <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">{showDetail.cantidad_visitas || 0}</p>
                <p className="text-xs text-slate-500">Visitas totales</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(showDetail.total_compras || 0)}</p>
                <p className="text-xs text-slate-500">Total gastado</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{showDetail.actualizado_en ? formatDate(showDetail.actualizado_en) : 'Ã¢â‚¬â€'}</p>
                <p className="text-xs text-slate-500">ÃƒÅ¡ltima visita</p>
              </div>
            </div>

            {(showDetail as any).direcciones && (showDetail as any).direcciones.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Direcciones</h4>
                <div className="space-y-2">
                  {(showDetail as any).direcciones.map((d: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                      <MapPin className="mt-0.5 h-4 w-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{d.direccion}</p>
                        {d.referencia && <p className="text-xs text-slate-500">{d.referencia}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(showDetail as any).notas && (
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Notas</h4>
                <p className="text-sm text-slate-500">{(showDetail as any).notas}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
