import { Menu, Bell, Moon, Sun, LogOut, ChevronDown, User, Store, Search, Maximize2, Minimize2 } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
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
  const { toggleSidebar, toggleCollapsed, theme, toggleTheme } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const pageTitle = getPageTitle(location.pathname);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-xl px-4 lg:px-6 dark:border-slate-700 dark:bg-slate-900/80">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggleSidebar}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        {/* Desktop collapse */}
        <button
          onClick={toggleCollapsed}
          className="hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:block dark:hover:bg-slate-800"
          aria-label="Colapsar sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page title breadcrumb */}
        {pageTitle && (
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{pageTitle}</h2>
          </div>
        )}
      </div>

      {/* Center — Search (desktop only) */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <button
          className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-400 transition-colors hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600 dark:hover:bg-slate-800"
          onClick={() => { /* Future: command palette */ }}
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 lg:inline-block dark:border-slate-600 dark:bg-slate-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Fullscreen toggle (desktop) */}
        <button
          onClick={toggleFullscreen}
          className="hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:block dark:hover:bg-slate-800"
          aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          {isFullscreen ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <button
          className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
        </button>

        {/* Separator */}
        <div className="mx-1.5 h-6 w-px bg-slate-200 dark:bg-slate-700" />

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-xs font-bold text-white ring-2 ring-white dark:ring-slate-900">
              {initials}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {usuario ? `${usuario.nombre} ${usuario.apellidos}` : 'Super Admin'}
              </p>
              <p className="text-[11px] text-slate-400">{usuario?.rol || 'Administrador'}</p>
            </div>
            <ChevronDown className={`hidden h-4 w-4 text-slate-400 transition-transform md:block ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800 animate-scale-in origin-top-right">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {usuario ? `${usuario.nombre} ${usuario.apellidos}` : 'Super Admin'}
                </p>
                <p className="text-xs text-slate-500 truncate">{usuario?.correo || 'admin@restauflow.com'}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { navigate('/perfil'); setUserMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <User className="h-4 w-4" /> Mi perfil
                </button>
                <button
                  onClick={() => { navigate('/configuracion'); setUserMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <Store className="h-4 w-4" /> Configuración
                </button>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-700" />
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
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
