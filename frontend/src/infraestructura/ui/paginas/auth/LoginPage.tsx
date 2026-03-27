import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye, EyeOff, Mail, Lock, Building2, ChefHat, Shield,
  UserCheck, Crown, Flame, ArrowRight, Utensils, BarChart3,
  ClipboardList, CreditCard, Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/infraestructura/store/useAuthStore';
import { useUIStore } from '@/infraestructura/store/useUIStore';
import Button from '@/infraestructura/ui/componentes/comunes/Button';
import Input from '@/infraestructura/ui/componentes/comunes/Input';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  tenant_slug: z.string().min(1, 'Ingresa tu código de restaurante'),
});
type LoginForm = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  {
    role: 'Admin Restaurante',
    icon: Shield,
    gradient: 'from-teal-500 to-emerald-500',
    shadow: 'shadow-teal-500/20',
    accent: 'text-teal-600',
    tenant_slug: 'demo-restaurant',
    email: 'admin@demo.com',
    password: 'admin123',
    desc: 'Gestión total · Reportes · Configuración',
  },
  {
    role: 'Mesero',
    icon: UserCheck,
    gradient: 'from-blue-500 to-indigo-500',
    shadow: 'shadow-blue-500/20',
    accent: 'text-blue-600',
    tenant_slug: 'demo-restaurant',
    email: 'mesero@demo.com',
    password: 'mesero123',
    desc: 'Mesas · Pedidos · Enviar a cocina',
  },
  {
    role: 'Cocinero',
    icon: ChefHat,
    gradient: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-500/20',
    accent: 'text-amber-600',
    tenant_slug: 'demo-restaurant',
    email: 'cocinero@demo.com',
    password: 'cocinero123',
    desc: 'KDS · Tickets · Preparación',
  },
];

const FEATURES = [
  { icon: <Utensils className="h-5 w-5" />, label: 'Menú digital' },
  { icon: <ClipboardList className="h-5 w-5" />, label: 'Gestión de órdenes' },
  { icon: <BarChart3 className="h-5 w-5" />, label: 'Reportes en tiempo real' },
  { icon: <CreditCard className="h-5 w-5" />, label: 'Control de caja' },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { login, loginSuperAdmin } = useAuthStore();
  const { setLocalSeleccionado } = useUIStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const loginDemo = async (acc: typeof DEMO_ACCOUNTS[0]) => {
    setDemoLoading(acc.role);
    try {
      await login(acc.email, acc.password, acc.tenant_slug);
      setLocalSeleccionado('demo-local-1');
      toast.success(`¡Bienvenido, ${acc.role}!`);
      const dest = acc.email.startsWith('mesero') ? '/mesero'
        : acc.email.startsWith('cocinero') ? '/cocinero'
        : '/dashboard';
      navigate(dest);
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje || 'Error al iniciar sesión');
    } finally {
      setDemoLoading(null);
    }
  };

  const loginSuperAdminDemo = async () => {
    setDemoLoading('superadmin');
    try {
      await loginSuperAdmin('superadmin@restauflow.com', 'superadmin123');
      toast.success('¡Bienvenido, Super Admin!');
      navigate('/superadmin');
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje || 'Error al iniciar sesión');
    } finally {
      setDemoLoading(null);
    }
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      if (data.tenant_slug === 'superadmin') {
        await loginSuperAdmin(data.email, data.password);
        toast.success('¡Bienvenido, Super Admin!');
        navigate('/superadmin');
      } else {
        await login(data.email, data.password, data.tenant_slug);
        setLocalSeleccionado('demo-local-1');
        toast.success('¡Bienvenido!');
        const rol = useAuthStore.getState().usuario?.rol;
        const dest = rol === 'mesero' ? '/mesero' : rol === 'cocinero' ? '/cocinero' : '/dashboard';
        navigate(dest);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje || 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* ═══════════════════════════════════════════
          LEFT PANEL — Hero decorative
      ═══════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Multi-layer gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/20 via-transparent to-emerald-600/10" />

        {/* Animated orbs */}
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-gradient-to-br from-teal-400/20 to-emerald-500/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/15 to-indigo-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/5 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-20">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-xl shadow-teal-500/30">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tight">RestauFlow</span>
              <p className="text-[10px] font-semibold text-teal-400 uppercase tracking-widest">Sistema de Gestión</p>
            </div>
          </div>

          {/* Hero text */}
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
            Gestiona tu<br />
            restaurante de<br />
            forma <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">inteligente</span>
          </h1>
          <p className="mt-5 text-lg text-slate-400 max-w-md leading-relaxed">
            Pedidos, cocina, mesas, inventario y reportes en una sola plataforma.
            Diseñado para restaurantes modernos.
          </p>

          {/* Feature pills */}
          <div className="mt-10 flex flex-wrap gap-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur px-4 py-2.5">
                <span className="text-teal-400">{f.icon}</span>
                <span className="text-sm font-medium text-slate-300">{f.label}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-2">
              {['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500'].map((c, i) => (
                <div key={i} className={`h-9 w-9 rounded-full ${c} border-2 border-slate-800 flex items-center justify-center text-white text-xs font-bold`}>
                  {['JL', 'MR', 'AC', 'KP'][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">150+ restaurantes activos</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          RIGHT PANEL — Login form / Demo access
      ═══════════════════════════════════════════ */}
      <div className="flex w-full items-center justify-center px-6 py-8 lg:w-[45%]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white">
              <Flame className="h-5 w-5" />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">RestauFlow</span>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {showForm ? 'Iniciar sesión' : '¡Prueba la demo!'}
            </h2>
            <p className="mt-2 text-slate-500 text-sm leading-relaxed">
              {showForm
                ? 'Ingresa tus credenciales para acceder al sistema'
                : 'Explora todas las funcionalidades sin crear una cuenta'}
            </p>
          </div>

          {!showForm ? (
            <>
              {/* Demo accounts — primary CTA */}
              <div className="space-y-3">
                {DEMO_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  const loading = demoLoading === acc.role;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      disabled={!!demoLoading}
                      onClick={() => loginDemo(acc)}
                      className={`group flex items-center gap-4 w-full rounded-2xl bg-white border border-slate-200 px-5 py-4 text-left transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-wait dark:bg-slate-800 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600`}
                    >
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${acc.gradient} text-white shadow-lg ${acc.shadow}`}>
                        {loading
                          ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          : <Icon className="h-5 w-5" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-slate-900 dark:text-white">
                          {loading ? 'Ingresando...' : acc.role}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{acc.desc}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all dark:text-slate-600" />
                    </button>
                  );
                })}
              </div>

              {/* Super Admin */}
              <button
                type="button"
                disabled={!!demoLoading}
                onClick={loginSuperAdminDemo}
                className="mt-3 flex items-center justify-center gap-2.5 w-full rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50 px-5 py-3.5 text-sm font-semibold text-purple-700 transition-all hover:shadow-lg hover:bg-purple-50 hover:border-purple-300 dark:border-purple-800 dark:bg-purple-900/10 dark:text-purple-300 disabled:opacity-60 disabled:cursor-wait"
              >
                {demoLoading === 'superadmin'
                  ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                  : <Crown className="h-4 w-4" />
                }
                {demoLoading === 'superadmin' ? 'Ingresando...' : 'Super Admin — Gestión SaaS'}
              </button>

              {/* Divider to manual login */}
              <div className="mt-8 relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
                <div className="relative flex justify-center">
                  <span className="bg-slate-50 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider dark:bg-slate-950">o</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-6 w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:shadow-md hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600"
              >
                Iniciar sesión con credenciales
              </button>
            </>
          ) : (
            <>
              {/* Login form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Código de restaurante"
                  placeholder="mi-restaurante"
                  leftIcon={<Building2 className="h-4 w-4" />}
                  error={errors.tenant_slug?.message}
                  {...register('tenant_slug')}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={errors.password?.message}
                  {...register('password')}
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                    Recordarme
                  </label>
                  <Link to="/recuperar-password" className="text-sm font-medium text-teal-600 hover:text-teal-700">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Button type="submit" isLoading={isLoading} className="w-full !py-3 !rounded-xl !text-base">
                  Iniciar sesión
                </Button>
              </form>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="mt-5 w-full text-center text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                ← Volver a cuentas demo
              </button>
            </>
          )}

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-slate-400">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-semibold text-teal-600 hover:text-teal-700">
              Crear cuenta gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
