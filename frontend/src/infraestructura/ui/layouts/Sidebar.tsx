import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingCart, CalendarDays, Users, Truck,
  BarChart3, Settings, ChefHat, Grid3X3, MapPin, CreditCard, X, Crown,
  Building2, Layers, UserCircle,
} from 'lucide-react';
import { cn } from '@/compartidos/utilidades';
import { useAuthStore } from '@/infraestructura/store/useAuthStore';
import { useUIStore } from '@/infraestructura/store/useUIStore';

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// Sidebar - navegacion principal role-aware
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

interface NavItem { to: string; label: string; icon: React.ReactNode }
interface NavSection { title: string; items: NavItem[] }

// ---- Nav configs por rol ----
const adminNav: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
      { to: '/menu', label: 'Menu', icon: <UtensilsCrossed className="h-5 w-5" /> },
      { to: '/ordenes', label: 'Ordenes', icon: <ShoppingCart className="h-5 w-5" /> },
      { to: '/cocina', label: 'Cocina', icon: <ChefHat className="h-5 w-5" /> },
      { to: '/mesas', label: 'Mesas', icon: <Grid3X3 className="h-5 w-5" /> },
      { to: '/caja', label: 'Caja', icon: <CreditCard className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Gestion',
    items: [
      { to: '/clientes', label: 'Clientes', icon: <Users className="h-5 w-5" /> },
      { to: '/reservas', label: 'Reservas', icon: <CalendarDays className="h-5 w-5" /> },
      { to: '/delivery', label: 'Delivery', icon: <Truck className="h-5 w-5" /> },
      { to: '/locales', label: 'Locales', icon: <MapPin className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Administracion',
    items: [
      { to: '/reportes', label: 'Reportes', icon: <BarChart3 className="h-5 w-5" /> },
      { to: '/usuarios', label: 'Personal', icon: <Users className="h-5 w-5" /> },
      { to: '/configuracion', label: 'Configuracion', icon: <Settings className="h-5 w-5" /> },
      { to: '/perfil', label: 'Mi Perfil', icon: <UserCircle className="h-5 w-5" /> },
    ],
  },
];

const meseroNav: NavSection[] = [
  {
    title: 'Mi turno',
    items: [
      { to: '/mesero', label: 'Inicio', icon: <LayoutDashboard className="h-5 w-5" /> },
      { to: '/mesero/ordenes', label: 'Mis Ordenes', icon: <ShoppingCart className="h-5 w-5" /> },
      { to: '/mesero/mesas', label: 'Mesas', icon: <Grid3X3 className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Gestion',
    items: [
      { to: '/mesero/clientes', label: 'Clientes', icon: <Users className="h-5 w-5" /> },
      { to: '/mesero/reservas', label: 'Reservas', icon: <CalendarDays className="h-5 w-5" /> },
      { to: '/mesero/perfil', label: 'Mi Perfil', icon: <UserCircle className="h-5 w-5" /> },
    ],
  },
];

const cocineroNav: NavSection[] = [
  {
    title: 'Cocina',
    items: [
      { to: '/cocinero', label: 'Panel Cocina', icon: <ChefHat className="h-5 w-5" /> },
      { to: '/cocinero/ordenes', label: 'Ordenes Activas', icon: <ShoppingCart className="h-5 w-5" /> },
      { to: '/cocinero/menu', label: 'Menu del Dia', icon: <UtensilsCrossed className="h-5 w-5" /> },
      { to: '/cocinero/perfil', label: 'Mi Perfil', icon: <UserCircle className="h-5 w-5" /> },
    ],
  },
];

const superAdminNav: NavSection[] = [
  {
    title: 'Plataforma',
    items: [
      { to: '/superadmin', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
      { to: '/superadmin/tenants', label: 'Restaurantes', icon: <Building2 className="h-5 w-5" /> },
      { to: '/superadmin/planes', label: 'Planes', icon: <Layers className="h-5 w-5" /> },
    ],
  },
];

function getNavForRole(rol: string | undefined, isSuperAdmin: boolean): NavSection[] {
  if (isSuperAdmin) return superAdminNav;
  switch (rol) {
    case 'mesero': return meseroNav;
    case 'cocinero': return cocineroNav;
    default: return adminNav; // admin, gerente, cajero, etc.
  }
}

function getRolLabel(rol: string | undefined, isSuperAdmin: boolean): string {
  if (isSuperAdmin) return 'Super Admin';
  switch (rol) {
    case 'admin': return 'Administrador';
    case 'gerente': return 'Gerente';
    case 'mesero': return 'Mesero';
    case 'cocinero': return 'Cocinero';
    case 'cajero': return 'Cajero';
    case 'repartidor': return 'Repartidor';
    default: return 'Usuario';
  }
}

function getRolColor(rol: string | undefined, isSuperAdmin: boolean): string {
  if (isSuperAdmin) return 'from-purple-500 to-violet-500';
  switch (rol) {
    case 'admin': return 'from-teal-500 to-emerald-500';
    case 'mesero': return 'from-blue-500 to-indigo-500';
    case 'cocinero': return 'from-amber-500 to-orange-500';
    case 'cajero': return 'from-green-500 to-emerald-500';
    default: return 'from-teal-500 to-emerald-500';
  }
}

function NavGroup({ title, items }: { title: string; items: NavItem[] }) {
  const { sidebarCollapsed, setSidebarOpen } = useUIStore();

  return (
    <div className="space-y-1">
      {!sidebarCollapsed && (
        <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </p>
      )}
      {sidebarCollapsed && <div className="mx-auto mb-1 h-px w-6 bg-slate-200" />}
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/mesero' || item.to === '/cocinero' || item.to === '/superadmin' || item.to === '/dashboard'}
          onClick={() => setSidebarOpen(false)}
          title={sidebarCollapsed ? item.label : undefined}
          className={({ isActive }) =>
            cn(
              'group/nav relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
              sidebarCollapsed && 'justify-center px-2',
              isActive
                ? 'bg-teal-50 text-teal-700 shadow-sm shadow-teal-500/5'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-teal-500 transition-all" />
              )}
              {item.icon}
              {!sidebarCollapsed && <span>{item.label}</span>}
              {sidebarCollapsed && (
                <span className="pointer-events-none absolute left-full ml-3 hidden rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg group-hover/nav:block whitespace-nowrap z-50">
                  {item.label}
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 h-2 w-2 rotate-45 bg-slate-900" />
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed } = useUIStore();
  const { usuario, isSuperAdmin } = useAuthStore();
  const rol = usuario?.rol;
  const navSections = getNavForRole(rol, isSuperAdmin);
  const rolLabel = getRolLabel(rol, isSuperAdmin);
  const rolColor = getRolColor(rol, isSuperAdmin);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white',
          'transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-[72px]' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo + role badge */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${rolColor} text-white font-bold text-sm`}>
                RF
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900">RestauFlow</h1>
                <p className="text-[10px] text-slate-400">{rolLabel}</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${rolColor} text-white font-bold text-sm`}>
              RF
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {navSections.map((section) => (
            <NavGroup key={section.title} title={section.title} items={section.items} />
          ))}
        </nav>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="border-t border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 px-3 py-2">
              <Crown className="h-4 w-4 text-teal-600" />
              <div className="text-xs">
                <p className="font-medium text-teal-700">RestauFlow Pro</p>
                <p className="text-teal-600/60">v1.0.0</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

