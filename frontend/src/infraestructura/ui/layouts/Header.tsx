import { Menu, Bell, Moon, Sun, LogOut, ChevronDown, User, Store } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/infraestructura/store/useAuthStore';
import { useUIStore } from '@/infraestructura/store/useUIStore';

// ═══════════════════════════════════════════════════════════
// Header — barra superior con menu burger, user menu
// ═══════════════════════════════════════════════════════════

export default function Header() {
  const { usuario, logout } = useAuthStore();
  const { toggleSidebar, toggleCollapsed, theme, setTheme } = useUIStore();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
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
        >
          <Menu className="h-5 w-5" />
        </button>
        {/* Desktop collapse */}
        <button
          onClick={toggleCollapsed}
          className="hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:block dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <button className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {usuario ? `${usuario.nombre} ${usuario.apellidos}` : 'Super Admin'}
              </p>
              <p className="text-[11px] text-slate-400">{usuario?.rol || 'Administrador'}</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {usuario ? `${usuario.nombre} ${usuario.apellidos}` : 'Super Admin'}
                </p>
                <p className="text-xs text-slate-500">{usuario?.correo || 'admin@restauflow.com'}</p>
              </div>
              <button
                onClick={() => { navigate('/perfil'); setUserMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <User className="h-4 w-4" /> Mi perfil
              </button>
              <button
                onClick={() => { navigate('/configuracion'); setUserMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <Store className="h-4 w-4" /> Configuración
              </button>
              <div className="border-t border-slate-100 dark:border-slate-700" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
