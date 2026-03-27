import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Store, Plus, MapPin, Phone, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { localRepository } from '@/infraestructura/repositorios';
import type { Local } from '@/dominio/entidades';
import { Button, Badge, Card, Modal, Input, EmptyState } from '@/infraestructura/ui/componentes/comunes';

// ═══════════════════════════════════════════════════════════
// Locales — CRUD de locales/sucursales (admin)
// ═══════════════════════════════════════════════════════════

const localSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  direccion: z.string().min(1, 'Requerido'),
  telefono: z.string().optional(),
});

type LocalForm = z.infer<typeof localSchema>;

export default function LocalesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Local | null>(null);

  const { data: locales = [], isLoading } = useQuery({
    queryKey: ['locales'],
    queryFn: () => localRepository.listarLocales(),
  });

  const crear = useMutation({
    mutationFn: (data: LocalForm) => editing
      ? localRepository.actualizarLocal(String(editing.id), data)
      : localRepository.crearLocal(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locales'] });
      toast.success(editing ? 'Local actualizado' : 'Local creado');
      setShowModal(false);
      setEditing(null);
      form.reset();
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => localRepository.eliminarLocal(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['locales'] }); toast.success('Local eliminado'); },
  });

  const form = useForm<LocalForm>({ resolver: zodResolver(localSchema) });

  const openEdit = (l: Local) => {
    setEditing(l);
    form.reset({ nombre: l.nombre, direccion: l.direccion, telefono: l.telefono || '' });
    setShowModal(true);
  };

  if (isLoading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Store className="h-7 w-7 text-teal-600" /> Locales
          </h1>
          <p className="text-slate-500">{locales.length} locales registrados</p>
        </div>
        <Button onClick={() => { setEditing(null); form.reset(); setShowModal(true); }}>
          <Plus className="h-4 w-4" /> Nuevo Local
        </Button>
      </div>

      {locales.length === 0 ? (
        <EmptyState icon={<Store className="h-12 w-12" />} title="Sin locales" description="Cree su primer local o sucursal" action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4" /> Crear local</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locales.map((local: Local) => (
            <Card key={local.id}>
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 p-3">
                      <Store className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{local.nombre}</h3>
                      <Badge variant={local.activo !== false ? 'success' : 'danger'} className="mt-1">
                        {local.activo !== false ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="rounded-lg p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => openEdit(local)}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => { if (confirm('¿Eliminar local?')) eliminar.mutate(String(local.id)); }}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{local.direccion}</span>
                  </div>
                  {local.telefono && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{local.telefono}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal crear/editar */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }} title={editing ? 'Editar Local' : 'Nuevo Local'} size="lg">
        <form onSubmit={form.handleSubmit((d) => crear.mutate(d))} className="space-y-4">
          <Input label="Nombre" {...form.register('nombre')} error={form.formState.errors.nombre?.message} />
          <Input label="Dirección" {...form.register('direccion')} error={form.formState.errors.direccion?.message} leftIcon={<MapPin className="h-4 w-4" />} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Teléfono" {...form.register('telefono')} leftIcon={<Phone className="h-4 w-4" />} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowModal(false); setEditing(null); }}>Cancelar</Button>
            <Button type="submit" isLoading={crear.isPending}>{editing ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
