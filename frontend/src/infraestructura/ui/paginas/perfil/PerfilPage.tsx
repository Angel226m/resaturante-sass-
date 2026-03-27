import { useState } from 'react';
import { User, Mail, Lock, Palette, Camera, Save, Shield, Clock, ChefHat } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/infraestructura/store/useAuthStore';
import { Button, Card, CardHeader, Input, Tabs } from '@/infraestructura/ui/componentes/comunes';

// ═══════════════════════════════════════════════════════════
// Perfil — configuración personal del usuario
// ═══════════════════════════════════════════════════════════

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luis',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
];

const COLORS = [
  '#0d9488', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
];

const rolLabels: Record<string, string> = {
  admin: 'Administrador',
  gerente: 'Gerente',
  mesero: 'Mesero',
  cocinero: 'Cocinero',
  cajero: 'Cajero',
  repartidor: 'Repartidor',
  almacen: 'Almacén',
};

export default function PerfilPage() {
  const { usuario, isDemoMode } = useAuthStore();
  const [tab, setTab] = useState('datos');
  const [saving, setSaving] = useState(false);

  // Form state (simulated for demo)
  const [form, setForm] = useState({
    nombre: usuario?.nombre || '',
    apellidos: usuario?.apellidos || '',
    correo: usuario?.correo || '',
    avatar_url: usuario?.avatar_url || AVATARS[0],
    color_identificacion: usuario?.color_identificacion || '#0d9488',
  });

  const [passwordForm, setPasswordForm] = useState({
    actual: '',
    nueva: '',
    confirmar: '',
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success('Perfil actualizado correctamente');
  };

  const handlePasswordChange = async () => {
    if (passwordForm.nueva !== passwordForm.confirmar) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (passwordForm.nueva.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setPasswordForm({ actual: '', nueva: '', confirmar: '' });
    toast.success('Contraseña actualizada');
  };

  const tabs = [
    { id: 'datos', label: 'Datos personales', icon: <User className="h-4 w-4" /> },
    { id: 'seguridad', label: 'Seguridad', icon: <Lock className="h-4 w-4" /> },
    { id: 'apariencia', label: 'Apariencia', icon: <Palette className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header with user card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 p-6 sm:p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex items-center gap-5">
          <div className="relative">
            <div
              className="h-20 w-20 rounded-2xl border-4 border-white/30 bg-white/20 flex items-center justify-center text-3xl font-bold text-white overflow-hidden"
              style={{ backgroundColor: form.color_identificacion + '40' }}
            >
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span>{(form.nombre[0] || 'U').toUpperCase()}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1.5 shadow-lg">
              <Camera className="h-3.5 w-3.5 text-teal-600" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {form.nombre} {form.apellidos}
            </h1>
            <div className="mt-1 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                <Shield className="h-3 w-3" />
                {rolLabels[usuario?.rol || 'admin'] || 'Usuario'}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-teal-100">
                <Mail className="h-3 w-3" />
                {form.correo}
              </span>
            </div>
            {isDemoMode && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-0.5 text-[10px] font-semibold text-amber-100">
                MODO DEMO
              </span>
            )}
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {/* ── Datos personales ── */}
      {tab === 'datos' && (
        <Card>
          <CardHeader title="Información Personal" description="Actualiza tus datos de perfil" />
          <div className="p-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombre"
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
              <Input
                label="Apellidos"
                placeholder="Tus apellidos"
                value={form.apellidos}
                onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
              />
            </div>
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
            />

            {/* Role info (read-only) */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rol</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ChefHat className="h-4 w-4 text-teal-500" />
                    {rolLabels[usuario?.rol || 'admin']}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Último acceso</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {usuario?.ultimo_acceso
                      ? new Date(usuario.ultimo_acceso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Miembro desde</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                    {usuario?.creado_en
                      ? new Date(usuario.creado_en).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSave} isLoading={saving}>
                <Save className="h-4 w-4" /> Guardar cambios
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Seguridad ── */}
      {tab === 'seguridad' && (
        <Card>
          <CardHeader title="Cambiar Contraseña" description="Mantén tu cuenta segura" />
          <form onSubmit={(e) => { e.preventDefault(); handlePasswordChange(); }} className="p-6 space-y-4" autoComplete="off">
            <Input
              label="Contraseña actual"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={passwordForm.actual}
              onChange={(e) => setPasswordForm({ ...passwordForm, actual: e.target.value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nueva contraseña"
                type="password"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                value={passwordForm.nueva}
                onChange={(e) => setPasswordForm({ ...passwordForm, nueva: e.target.value })}
              />
              <Input
                label="Confirmar contraseña"
                type="password"
                placeholder="Repetir contraseña"
                autoComplete="new-password"
                value={passwordForm.confirmar}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmar: e.target.value })}
              />
            </div>

            {/* Security tips */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
              <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400">Consejos de seguridad</h4>
              <ul className="mt-2 space-y-1 text-xs text-amber-700 dark:text-amber-300">
                <li>• Usa al menos 8 caracteres con letras, números y símbolos</li>
                <li>• No reutilices contraseñas de otros servicios</li>
                <li>• Cambia tu contraseña periódicamente</li>
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={saving}>
                <Lock className="h-4 w-4" /> Actualizar contraseña
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── Apariencia ── */}
      {tab === 'apariencia' && (
        <div className="space-y-6">
          {/* Avatar selector */}
          <Card>
            <CardHeader title="Avatar" description="Elige tu imagen de perfil" />
            <div className="p-6">
              <div className="grid grid-cols-6 gap-3 sm:grid-cols-6 max-w-md">
                {AVATARS.map((url) => (
                  <button
                    key={url}
                    onClick={() => setForm({ ...form, avatar_url: url })}
                    className={`rounded-xl border-2 p-1 transition-all ${
                      form.avatar_url === url
                        ? 'border-teal-500 shadow-lg shadow-teal-100 scale-110 dark:shadow-teal-900/30'
                        : 'border-slate-200 hover:border-teal-300 dark:border-slate-700'
                    }`}
                  >
                    <img src={url} alt="Avatar" className="h-12 w-12 rounded-lg" />
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Color selector */}
          <Card>
            <CardHeader title="Color de identificación" description="Los demás te verán con este color en el sistema" />
            <div className="p-6">
              <div className="flex flex-wrap gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setForm({ ...form, color_identificacion: color })}
                    className={`h-10 w-10 rounded-xl transition-all ${
                      form.color_identificacion === color
                        ? 'ring-2 ring-offset-2 ring-teal-500 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Color actual: <span className="font-mono font-semibold">{form.color_identificacion}</span>
              </p>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} isLoading={saving}>
              <Save className="h-4 w-4" /> Guardar apariencia
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
