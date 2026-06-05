import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, Clock, DollarSign, Palette, Bell } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { localRepository } from '@/infraestructura/repositorios';
import { Button, Card, CardHeader, Input, Select, Tabs } from '@/infraestructura/ui/componentes/comunes';
import { useUIStore } from '@/infraestructura/store/useUIStore';
import { useState } from 'react';

// Configuración - ajustes del restaurante y sistema

const configSchema = z.object({
  nombre_restaurante: z.string().min(1, 'Requerido'),
  moneda: z.string().min(1, 'Requerido'),
  zona_horaria: z.string().min(1, 'Requerido'),
  idioma: z.string().optional(),
  impuesto_porcentaje: z.coerce.number().min(0).max(100),
  propina_sugerida: z.coerce.number().min(0).max(100).optional(),
  formato_ticket: z.string().optional(),
  telefono_soporte: z.string().optional(),
  email_soporte: z.string().optional(),
  direccion: z.string().optional(),
  logo_url: z.string().optional(),
});

type ConfigForm = z.infer<typeof configSchema>;

export default function ConfiguracionPage() {
  const qc = useQueryClient();
  const localId = useUIStore((s) => s.localSeleccionadoId);
  const [tab, setTab] = useState('general');

  const { data: config, isLoading } = useQuery({
    queryKey: ['configuracion', localId],
    queryFn: () => localRepository.obtenerConfiguracion(),
    enabled: !!localId,
  });

  const guardar = useMutation({
    mutationFn: (data: ConfigForm) => localRepository.actualizarConfiguracion(data as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['configuracion'] }); toast.success('Configuración guardada'); },
  });

  const form = useForm<ConfigForm>({
    resolver: zodResolver(configSchema),
    values: (config as any) || { nombre_restaurante: '', moneda: 'PEN', zona_horaria: 'America/Lima', impuesto_porcentaje: 18 },
  });

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings className="h-4 w-4" /> },
    { id: 'finanzas', label: 'Finanzas', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'apariencia', label: 'Apariencia', icon: <Palette className="h-4 w-4" /> },
    { id: 'notificaciones', label: 'Notificaciones', icon: <Bell className="h-4 w-4" /> },
  ];

  if (isLoading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="h-7 w-7 text-teal-600" /> Configuración
          </h1>
          <p className="text-slate-500">Ajustes del restaurante y sistema</p>
        </div>
        <Button onClick={form.handleSubmit((d: ConfigForm) => guardar.mutate(d))} isLoading={guardar.isPending}>
          <Save className="h-4 w-4" /> Guardar Cambios
        </Button>
      </div>

      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      <form className="space-y-6">
        {/* --- General --- */}
        {tab === 'general' && (
          <div className="space-y-6">
            <Card>
              <CardHeader title="Información del Restaurante" description="Datos básicos de su negocio" />
              <div className="p-6 space-y-4">
                <Input label="Nombre del Restaurante" {...form.register('nombre_restaurante')} error={form.formState.errors.nombre_restaurante?.message} />
                <Input label="Dirección" {...form.register('direccion')} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Teléfono Soporte" {...form.register('telefono_soporte')} />
                  <Input label="Email Soporte" {...form.register('email_soporte')} />
                </div>
                <Input label="URL del Logo" {...form.register('logo_url')} placeholder="https://..." />
              </div>
            </Card>

            <Card>
              <CardHeader title="Regional" description="Configuración de zona horaria e idioma" />
              <div className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <Input label="Zona Horaria" {...form.register('zona_horaria')} leftIcon={<Clock className="h-4 w-4" />} />
                  </div>
                  <Select
                    label="Idioma"
                    options={[
                      { value: 'es', label: 'Español' },
                      { value: 'en', label: 'English' },
                      { value: 'pt', label: 'Portugués' },
                    ]}
                    {...form.register('idioma')}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* --- Finanzas --- */}
        {tab === 'finanzas' && (
          <div className="space-y-6">
            <Card>
              <CardHeader title="Moneda y Impuestos" description="Configuración financiera" />
              <div className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Select
                    label="Moneda"
                    options={[
                      { value: 'PEN', label: 'PEN - Sol Peruano' },
                      { value: 'USD', label: 'USD - Dólar' },
                      { value: 'EUR', label: 'EUR - Euro' },
                      { value: 'COP', label: 'COP - Peso Colombiano' },
                      { value: 'MXN', label: 'MXN - Peso Mexicano' },
                      { value: 'ARS', label: 'ARS - Peso Argentino' },
                    ]}
                    {...form.register('moneda')}
                    error={form.formState.errors.moneda?.message}
                  />
                  <Input type="number" step="0.01" label="Impuesto (%)" {...form.register('impuesto_porcentaje')} error={form.formState.errors.impuesto_porcentaje?.message} leftIcon={<DollarSign className="h-4 w-4" />} />
                  <Input type="number" step="0.01" label="Propina Sugerida (%)" {...form.register('propina_sugerida')} />
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Comprobantes" description="Formato de tickets y facturas" />
              <div className="p-6">
                <Select
                  label="Formato de Ticket"
                  options={[
                    { value: 'ticket_80mm', label: 'Ticket 80mm' },
                    { value: 'ticket_58mm', label: 'Ticket 58mm' },
                    { value: 'a4', label: 'A4' },
                  ]}
                  {...form.register('formato_ticket')}
                />
              </div>
            </Card>
          </div>
        )}

        {/* --- Apariencia --- */}
        {tab === 'apariencia' && (
          <Card>
            <CardHeader title="Tema y Apariencia" description="Personalice la apariencia del sistema" />
            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-3 block">Tema</label>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { value: 'light', label: 'Claro', icon: '☀️', desc: 'Fondo blanco' },
                    { value: 'dark', label: 'Oscuro', icon: '🌙', desc: 'Fondo oscuro' },
                    { value: 'system', label: 'Sistema', icon: '💻', desc: 'Automático' },
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      type="button"
                      className="flex flex-col items-center gap-2 rounded-xl border-2 border-slate-200 p-6 transition-all hover:border-teal-500 hover:bg-teal-50"
                    >
                      <span className="text-3xl">{theme.icon}</span>
                      <span className="font-medium text-slate-900">{theme.label}</span>
                      <span className="text-xs text-slate-500">{theme.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-3 block">Color Primario</label>
                <div className="flex gap-3">
                  {['#0d9488', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#ec4899'].map((c) => (
                    <button key={c} type="button" className="h-10 w-10 rounded-xl border-2 border-transparent transition-all hover:scale-110 hover:border-slate-300" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* --- Notificaciones --- */}
        {tab === 'notificaciones' && (
          <Card>
            <CardHeader title="Notificaciones" description="Configure las alertas del sistema" />
            <div className="p-6 space-y-4">
              {[
                { label: 'Nueva orden', desc: 'Notificar cuando se reciba una nueva orden' },
                { label: 'Reserva pendiente', desc: 'Recordatorio de reservas por confirmar' },
                { label: 'Stock bajo', desc: 'Alerta cuando un producto tenga stock bajo' },
                { label: 'Turno de caja sin cerrar', desc: 'Recordar cerrar el turno de caja' },
                { label: 'Pedido delivery demorado', desc: 'Alerta de pedidos demorados' },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div>
                    <p className="font-medium text-slate-900">{n.label}</p>
                    <p className="text-xs text-slate-500">{n.desc}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" defaultChecked className="peer sr-only" />
                    <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-teal-500 peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
            </div>
          </Card>
        )}
      </form>
    </div>
  );
}

