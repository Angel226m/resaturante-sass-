import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChefHat, ShoppingCart, Users, BarChart3, CreditCard, CalendarDays, Truck, Shield,
  Zap, Globe, ArrowRight, Star, CheckCircle2, Sparkles, Grid3X3, Clock,
  Quote, Play, Monitor, Smartphone, ChevronDown, ChevronUp,
  UtensilsCrossed, Flame, TrendingUp, Eye,
} from 'lucide-react';
import Button from '@/infraestructura/ui/componentes/comunes/Button';

// ═══════════════════════════════════════════════════════════
// Landing Page — hero, features, demo, testimonials, pricing, FAQ, CTA
// ═══════════════════════════════════════════════════════════

// ── Animated counter hook ──
function useCountUp(end: number, duration = 2000, suffix = '') {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return { ref, display: `${value.toLocaleString()}${suffix}` };
}

const features = [
  { icon: <ChefHat className="h-6 w-6" />, title: 'Gestión de Menú', desc: 'Categorías, productos, variantes, modificadores, combos y promociones en un solo lugar.', color: 'from-orange-500 to-amber-500' },
  { icon: <ShoppingCart className="h-6 w-6" />, title: 'Órdenes en Tiempo Real', desc: 'Crea y gestiona pedidos al instante. Tickets de cocina automáticos con WebSocket.', color: 'from-blue-500 to-cyan-500' },
  { icon: <Grid3X3 className="h-6 w-6" />, title: 'Mesas & Zonas', desc: 'Visualiza el plano de tu restaurante, gestiona zonas y estados de mesas visualmente.', color: 'from-teal-500 to-emerald-500' },
  { icon: <CreditCard className="h-6 w-6" />, title: 'Caja & Pagos', desc: 'Turnos de caja, múltiples métodos de pago, comprobantes y cierre automático.', color: 'from-purple-500 to-violet-500' },
  { icon: <CalendarDays className="h-6 w-6" />, title: 'Reservas', desc: 'Consulta disponibilidad, gestiona reservas y reduce no-shows con recordatorios.', color: 'from-pink-500 to-rose-500' },
  { icon: <Users className="h-6 w-6" />, title: 'Clientes', desc: 'Base de datos de clientes, historial de visitas y direcciones de entrega.', color: 'from-indigo-500 to-blue-500' },
  { icon: <Truck className="h-6 w-6" />, title: 'Delivery', desc: 'Zonas de reparto, asignación de repartidores y seguimiento en tiempo real.', color: 'from-red-500 to-orange-500' },
  { icon: <BarChart3 className="h-6 w-6" />, title: 'Reportes & Analytics', desc: 'Dashboard completo, resúmenes diarios y métricas clave para tu negocio.', color: 'from-emerald-500 to-green-500' },
];

const testimonials = [
  {
    name: 'Ricardo Vargas',
    role: 'Gerente, Cevichería Don Julio',
    avatar: 'RV',
    text: 'Redujimos los errores en pedidos un 80% desde que implementamos RestauFlow. La cocina recibe las órdenes al instante.',
    stars: 5,
  },
  {
    name: 'María Fernanda López',
    role: 'Dueña, Café La Esquina',
    avatar: 'ML',
    text: 'El sistema de reservas y control de mesas nos ayudó a organizar turnos. Nuestros clientes notan la diferencia.',
    stars: 5,
  },
  {
    name: 'Carlos Huamán',
    role: 'Chef Ejecutivo, Fusión 420',
    avatar: 'CH',
    text: 'El KDS para cocina es increíble. Veo los platos agrupados por tipo y puedo marcar agotados al instante.',
    stars: 5,
  },
];

const plans = [
  {
    name: 'Starter',
    price: 'S/ 99',
    desc: 'Ideal para restaurantes pequeños',
    features: ['1 local', '5 usuarios', 'Menú completo', 'Órdenes y cocina', 'Mesas y zonas', 'Caja básica', 'Soporte por email'],
    popular: false,
  },
  {
    name: 'Professional',
    price: 'S/ 199',
    desc: 'Para restaurantes en crecimiento',
    features: ['3 locales', '15 usuarios', 'Todo de Starter', 'Reservas online', 'Delivery integrado', 'Reportes avanzados', 'API + Webhooks', 'Soporte prioritario'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'S/ 399',
    desc: 'Cadenas y franquicias',
    features: ['Locales ilimitados', 'Usuarios ilimitados', 'Todo de Professional', 'Soporte 24/7 dedicado', 'Multi-moneda', 'Integraciones custom', 'SLA garantizado', 'Onboarding personalizado'],
    popular: false,
  },
];

const faqs = [
  { q: '¿Cuánto dura la prueba gratuita?', a: '14 días completos con acceso a todas las funcionalidades del plan Professional. Sin necesidad de tarjeta de crédito.' },
  { q: '¿Puedo migrar mis datos actuales?', a: 'Sí, ofrecemos importación desde Excel/CSV y migración asistida desde otros sistemas POS. Nuestro equipo te ayuda en el proceso.' },
  { q: '¿Funciona sin internet?', a: 'RestauFlow tiene modo offline parcial. Las órdenes se guardan localmente y se sincronizan cuando vuelve la conexión.' },
  { q: '¿Es seguro para múltiples sucursales?', a: 'Absolutamente. Usamos Row Level Security en PostgreSQL para garantizar aislamiento total de datos entre locales y tenants.' },
  { q: '¿Qué soporte ofrecen?', a: 'Soporte por email en plan Starter, chat + email prioritario en Professional, y soporte 24/7 dedicado con SLA en Enterprise.' },
];

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-5 text-left">
        <span className="text-base font-medium text-slate-900 dark:text-white">{q}</span>
        {open ? <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" /> : <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-5' : 'max-h-0'}`}>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto max-w-4xl">
      {/* Browser chrome */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/50 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="ml-4 flex-1 rounded-md bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs text-slate-400">
            app.restauflow.com/dashboard
          </div>
        </div>
        {/* Mock dashboard content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Ventas hoy', value: 'S/ 2,845', icon: <TrendingUp className="h-4 w-4" />, color: 'text-emerald-500' },
              { label: 'Órdenes activas', value: '6', icon: <Flame className="h-4 w-4" />, color: 'text-orange-500' },
              { label: 'Mesas ocupadas', value: '3/12', icon: <Grid3X3 className="h-4 w-4" />, color: 'text-blue-500' },
              { label: 'Reservas hoy', value: '3', icon: <CalendarDays className="h-4 w-4" />, color: 'text-purple-500' },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{s.label}</span>
                  <span className={s.color}>{s.icon}</span>
                </div>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{s.value}</p>
              </div>
            ))}
          </div>
          {/* Chart placeholder */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4">
            <p className="text-xs font-medium text-slate-500 mb-3">Ventas de la semana</p>
            <div className="flex items-end gap-2 h-24">
              {[40, 55, 38, 62, 75, 90, 68].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-teal-500 to-emerald-400 transition-all duration-1000" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-slate-400">
              <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
            </div>
          </div>
          {/* Recent orders */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4">
            <p className="text-xs font-medium text-slate-500 mb-2">Últimas órdenes</p>
            <div className="space-y-2">
              {[
                { id: 'ORD-001', mesa: 'Mesa 2', total: 'S/ 132.16', estado: 'Pendiente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
                { id: 'ORD-002', mesa: 'Mesa 6', total: 'S/ 142.78', estado: 'En preparación', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
                { id: 'ORD-004', mesa: 'Para llevar', total: 'S/ 82.60', estado: 'Lista', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
              ].map((o) => (
                <div key={o.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{o.id}</span>
                    <span className="text-slate-500">{o.mesa}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{o.total}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${o.color}`}>
                      {o.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Glow behind */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl scale-110" />
    </div>
  );
}

export default function LandingPage() {
  const stat1 = useCountUp(500, 2000, '+');
  const stat2 = useCountUp(1000000, 2500);
  const stat3 = useCountUp(999, 1500);
  const stat4 = useCountUp(24, 1000);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-teal-500/25">
              RF
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">RestauFlow</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-600 hover:text-teal-600 transition-colors dark:text-slate-400">Características</a>
            <a href="#demo" className="text-sm text-slate-600 hover:text-teal-600 transition-colors dark:text-slate-400">Demo</a>
            <a href="#testimonials" className="text-sm text-slate-600 hover:text-teal-600 transition-colors dark:text-slate-400">Testimonios</a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-teal-600 transition-colors dark:text-slate-400">Precios</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Iniciar sesión</Button>
            </Link>
            <Link to="/registro">
              <Button size="sm">Comenzar gratis <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-teal-400/10 blur-3xl animate-pulse" />
          <div className="absolute top-40 right-0 h-[400px] w-[400px] rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-cyan-400/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm text-teal-700 mb-8 dark:border-teal-800 dark:bg-teal-900/20 dark:text-teal-400 animate-[fadeIn_0.5s_ease-out]">
            <Sparkles className="h-4 w-4" />
            Plataforma SaaS Multi-Tenant para Restaurantes
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white leading-[1.1]">
            El sistema que tu restaurante{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                necesita para crecer
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none"><path d="M2 10C50 4 250 4 298 10" stroke="url(#g)" strokeWidth="3" strokeLinecap="round" /><defs><linearGradient id="g" x1="0" y1="6" x2="300" y2="6"><stop stopColor="#0d9488" /><stop offset="1" stopColor="#06b6d4" /></linearGradient></defs></svg>
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Menú, órdenes, cocina, mesas, caja, reservas, delivery y reportes —
            todo integrado en una plataforma cloud segura y escalable.
            <span className="font-medium text-slate-900 dark:text-slate-200"> Empieza en minutos.</span>
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/registro">
              <Button size="lg" className="min-w-[220px] shadow-lg shadow-teal-500/25">
                Comenzar prueba gratuita <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="min-w-[220px]">
                <Play className="h-4 w-4" /> Probar demo en vivo
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-400">14 días gratis · Sin tarjeta de crédito · Cancela cuando quieras</p>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4 mx-auto max-w-3xl">
            {[
              { ref: stat1.ref, display: stat1.display, label: 'Restaurantes', icon: <UtensilsCrossed className="h-5 w-5" /> },
              { ref: stat2.ref, display: `${(parseInt(stat2.display.replace(/,/g, '')) / 1000000).toFixed(1)}M+`, label: 'Órdenes procesadas', icon: <ShoppingCart className="h-5 w-5" /> },
              { ref: stat3.ref, display: `${(parseInt(stat3.display.replace(/,/g, '')) / 10).toFixed(1)}%`, label: 'Uptime', icon: <Zap className="h-5 w-5" /> },
              { ref: stat4.ref, display: `${stat4.display}/7`, label: 'Soporte técnico', icon: <Shield className="h-5 w-5" /> },
            ].map((s) => (
              <div key={s.label} ref={s.ref} className="group">
                <div className="flex items-center justify-center gap-2 text-teal-600">
                  {s.icon}
                  <p className="text-2xl font-bold sm:text-3xl">{s.display}</p>
                </div>
                <p className="mt-1 text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">Características</span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Todo lo que necesitas, nada que te sobre
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              8 módulos profesionales diseñados específicamente para la operación gastronómica
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-transparent hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:hover:border-transparent overflow-hidden"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-lg transition-transform group-hover:scale-110 group-hover:-rotate-3`}>
                  {f.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section id="demo" className="py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">Vista previa</span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Dashboard diseñado para la acción
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Información en tiempo real para tomar decisiones al instante
            </p>
          </div>

          <DashboardMockup />

          <div className="mt-12 flex justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Monitor className="h-4 w-4" /> Desktop
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Smartphone className="h-4 w-4" /> Mobile responsive
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Eye className="h-4 w-4" /> Tiempo real
            </div>
          </div>
        </div>
      </section>

      {/* Why RestauFlow */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div>
              <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">Ventajas</span>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
                ¿Por qué elegir <span className="text-teal-600">RestauFlow</span>?
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                Construido con tecnología moderna y las mejores prácticas de la industria. Diseñado para escalar con tu negocio.
              </p>
              <div className="mt-10 space-y-6">
                {[
                  { icon: <Shield className="h-5 w-5" />, title: 'Multi-Tenant Seguro', desc: 'Row Level Security en PostgreSQL. Cada restaurante accede solo a sus datos, garantizado a nivel de base de datos.', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
                  { icon: <Zap className="h-5 w-5" />, title: 'Tiempo Real con WebSocket', desc: 'Cocina, órdenes y notificaciones se actualizan al instante. Sin refrescar la página.', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
                  { icon: <Globe className="h-5 w-5" />, title: 'Cloud-Native & Escalable', desc: 'Go + React + PostgreSQL + Redis. Arquitectura diseñada para alta disponibilidad.', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' },
                  { icon: <Clock className="h-5 w-5" />, title: 'Operativo en Minutos', desc: 'Crea tu cuenta, configura tu menú y comienza a recibir pedidos. Sin instalaciones.', color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-8 dark:border-slate-700 dark:from-teal-900/10 dark:via-slate-800 dark:to-emerald-900/10">
                <div className="space-y-4">
                  {[
                    { text: 'Dashboard en tiempo real', sub: 'Ventas, órdenes y métricas al instante' },
                    { text: 'Comandas a cocina en 1 click', sub: 'Con KDS integrado y agrupación de platos' },
                    { text: 'Roles diferenciados', sub: 'Admin, Mesero, Cocinero, Cajero, Repartidor' },
                    { text: 'Cierre de caja automático', sub: 'Cuadre y reportes por turno' },
                    { text: 'Modo demo incluido', sub: 'Prueba sin configurar nada' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-white/80 px-4 py-3.5 shadow-sm dark:bg-slate-800/80">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.text}</span>
                        <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 opacity-10 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 border-y border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-center text-sm font-medium text-slate-400 mb-8 uppercase tracking-wider">Construido con tecnología moderna</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {['React 19', 'TypeScript', 'Go 1.23', 'PostgreSQL', 'Redis', 'Docker', 'Tailwind CSS', 'WebSocket', 'JWT Auth', 'Vite'].map((tech) => (
              <span key={tech} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-default">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">Testimonios</span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Lo que dicen nuestros clientes
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 hover:shadow-lg transition-shadow"
              >
                <Quote className="absolute top-4 right-4 h-8 w-8 text-slate-100 dark:text-slate-700" />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed relative z-10">
                  "{t.text}"
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-sm font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">Precios</span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Planes para cada tamaño
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Comienza gratis por 14 días. Sin tarjeta de crédito.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 transition-all duration-300 hover:shadow-lg ${
                  plan.popular
                    ? 'border-teal-500 bg-white shadow-xl shadow-teal-100/50 dark:bg-slate-800 dark:shadow-teal-900/20 scale-105'
                    : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-teal-500/25">
                      <Star className="h-3 w-3" /> Más popular
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{plan.desc}</p>
                <div className="mt-6">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="text-sm text-slate-500"> /mes</span>
                </div>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/registro" className="mt-8 block">
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    className="w-full"
                  >
                    Comenzar ahora
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">FAQ</span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700 border-t border-slate-200 dark:border-slate-700">
            {faqs.map((f) => <FAQ key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="relative rounded-3xl bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-600 px-8 py-20 sm:px-16 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative z-10">
              <UtensilsCrossed className="h-12 w-12 text-white/80 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                ¿Listo para transformar tu restaurante?
              </h2>
              <p className="mt-4 text-lg text-teal-100 max-w-xl mx-auto">
                Únete a más de 500 restaurantes que ya confían en RestauFlow para su operación diaria.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link to="/registro">
                  <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 min-w-[220px] shadow-xl">
                    Comenzar prueba gratuita
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 min-w-[220px]">
                    Probar demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-16 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-white font-bold text-xs">
                  RF
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">RestauFlow</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                La plataforma SaaS líder para la gestión integral de restaurantes en Latinoamérica.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Producto</h4>
              <ul className="space-y-2">
                {['Características', 'Precios', 'Demo en vivo', 'Integraciones'].map((l) => (
                  <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-teal-600 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Empresa</h4>
              <ul className="space-y-2">
                {['Sobre nosotros', 'Blog', 'Contacto', 'Trabaja con nosotros'].map((l) => (
                  <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-teal-600 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                {['Términos de servicio', 'Política de privacidad', 'Cookies', 'SLA'].map((l) => (
                  <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-teal-600 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} RestauFlow. Todos los derechos reservados.
            </p>
            <p className="text-xs text-slate-400">
              Hecho con Go, React, PostgreSQL & Redis
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
