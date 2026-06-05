import { Menu, Bell, Sun, LogOut, ChevronDown, User, Store, Search, Maximize2, Minimize2, CheckCheck, X } from 'lucide-react';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/infraestructura/store/useAuthStore';
import { useUIStore } from '@/infraestructura/store/useUIStore';

// ═══════════════════════════════════════════════════════════
// Header — barra superior con menu burger, search, user menu
// ═══════════════════════════════════════════════════════════

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/menu': 'Menú',
  '/ordenes': 'Órdenes',
  '/cocina': 'Cocina',
  '/mesas': 'Mesas',
  '/caja': 'Caja',
  '/clientes': 'Clientes',
  '/reservas': 'Reservas',
  '/delivery': 'Delivery',
  '/locales': 'Locales',
  '/reportes': 'Reportes',
  '/usuarios': 'Personal',
  '/configuracion': 'Configuración',
  '/perfil': 'Mi Perfil',
  '/mesero': 'Panel Mesero',
  '/cocinero': 'Panel Cocina',
  '/superadmin': 'Super Admin',
};

function getPageTitle(pathname: string): string {
  return PAGE_TITLES[pathname] || PAGE_TITLES[`/${pathname.split('/')[1]}`] || '';
}

export default function Header() {
  const { usuario, logout } = useAuthStore();
  const { toggleSidebar, toggleCollapsed, notifications, markNotificationRead, markAllNotificationsRead, dismissNotification } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const pageTitle = getPageTitle(location.pathname);
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const formatNotifTime = useCallback((isoDate: string) => {
    const date = new Date(isoDate);
    const diffMin = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = usuario
    ? `${usuario.nombre?.charAt(0) || ''}${usuario.apellidos?.charAt(0) || ''}`.toUpperCase()
    : 'SA';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-xl px-4 lg:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggleSidebar}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        {/* Desktop collapse */}
        <button
          onClick={toggleCollapsed}
          className="hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:block"
          aria-label="Colapsar sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page title breadcrumb */}
        {pageTitle && (
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-5 w-px bg-slate-200" />
            <h2 className="text-sm font-semibold text-slate-700">{pageTitle}</h2>
          </div>
        )}
      </div>

      {/* Center — Search (desktop only) */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <button
          className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-400 transition-colors hover:border-slate-300 hover:bg-white"
          onClick={() => { /* Future: command palette */ }}
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 lg:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Fullscreen toggle (desktop) */}
        <button
          onClick={toggleFullscreen}
          className="hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:block"
          aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          {isFullscreen ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
        </button>

        {/* Theme status (light mode locked) */}
        <button
          type="button"
          disabled
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Modo claro activo"
          title="Modo claro activo"
        >
          <Sun className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => setNotificationsOpen((v) => !v)}
            className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-[360px] max-w-[88vw] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl animate-scale-in origin-top-right">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-800">Notificaciones</h3>
                <button
                  onClick={markAllNotificationsRead}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50"
                  type="button"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Marcar todo visto
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500">Sin notificaciones por ahora.</div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={`border-b border-slate-100 px-4 py-3 ${n.read ? 'bg-white' : 'bg-emerald-50/40'}`}>
                      <div className="flex items-start gap-2.5">
                        <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                          <p className="mt-0.5 text-sm text-slate-600">{n.message}</p>
                          <p className="mt-1 text-[11px] text-slate-400">{formatNotifTime(n.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!n.read && (
                            <button
                              onClick={() => markNotificationRead(n.id)}
                              className="rounded-md px-2 py-1 text-[11px] font-medium text-teal-700 hover:bg-teal-50"
                              type="button"
                            >
                              Visto
                            </button>
                          )}
                          <button
                            onClick={() => dismissNotification(n.id)}
                            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            aria-label="Cerrar notificación"
                            type="button"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="mx-1.5 h-6 w-px bg-slate-200" />

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-xs font-bold text-white ring-2 ring-white">
              {initials}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-slate-700">
                {usuario ? `${usuario.nombre} ${usuario.apellidos}` : 'Super Admin'}
              </p>
              <p className="text-[11px] text-slate-400">{usuario?.rol || 'Administrador'}</p>
            </div>
            <ChevronDown className={`hidden h-4 w-4 text-slate-400 transition-transform md:block ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-xl animate-scale-in origin-top-right">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900">
                  {usuario ? `${usuario.nombre} ${usuario.apellidos}` : 'Super Admin'}
                </p>
                <p className="text-xs text-slate-500 truncate">{usuario?.correo || 'admin@restauflow.com'}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { navigate('/perfil'); setUserMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <User className="h-4 w-4" /> Mi perfil
                </button>
                <button
                  onClick={() => { navigate('/configuracion'); setUserMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Store className="h-4 w-4" /> Configuración
                </button>
              </div>
              <div className="border-t border-slate-100" />
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
