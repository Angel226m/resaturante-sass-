import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '@/infraestructura/ui/paginas/auth/LoginPage';

// ── vi.hoisted: funciones mock disponibles antes de que vi.mock sea ejecutado ──
const { loginFn, loginSuperAdminFn, navigateFn, setLocalFn } = vi.hoisted(() => ({
  loginFn: vi.fn().mockResolvedValue(undefined),
  loginSuperAdminFn: vi.fn().mockResolvedValue(undefined),
  navigateFn: vi.fn(),
  setLocalFn: vi.fn(),
}));

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/infraestructura/store/useAuthStore', () => {
  const useAuthStore = vi.fn(() => ({
    login: loginFn,
    loginSuperAdmin: loginSuperAdminFn,
  }));
  // useAuthStore.getState() es llamado en onSubmit para navegar según rol
  (useAuthStore as any).getState = vi.fn(() => ({ usuario: { rol: 'admin' } }));
  return { useAuthStore };
});

vi.mock('@/infraestructura/store/useUIStore', () => ({
  useUIStore: vi.fn(() => ({
    setLocalSeleccionado: setLocalFn,
  })),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateFn };
});

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

// ── Helper ───────────────────────────────────────────────────────────────────
function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  loginFn.mockResolvedValue(undefined);
  loginSuperAdminFn.mockResolvedValue(undefined);
  navigateFn.mockReset();
  setLocalFn.mockReset();
});

// ─── Vista demo (por defecto) ─────────────────────────────────────────────────

describe('LoginPage — vista demo', () => {
  it('renderiza sin errores', () => {
    expect(() => renderLogin()).not.toThrow();
  });

  it('muestra la tarjeta Admin Restaurante', () => {
    renderLogin();
    expect(screen.getByText('Admin Restaurante')).toBeInTheDocument();
  });

  it('muestra la tarjeta Mesero', () => {
    renderLogin();
    expect(screen.getByText('Mesero')).toBeInTheDocument();
  });

  it('muestra la tarjeta Cocinero', () => {
    renderLogin();
    expect(screen.getByText('Cocinero')).toBeInTheDocument();
  });

  it('muestra el botón Super Admin', () => {
    renderLogin();
    expect(screen.getByText(/Super Admin/i)).toBeInTheDocument();
  });

  it('muestra el botón para ir al formulario', () => {
    renderLogin();
    expect(screen.getByText('Iniciar sesión con credenciales')).toBeInTheDocument();
  });

  it('no muestra el formulario de credenciales por defecto', () => {
    renderLogin();
    expect(screen.queryByPlaceholderText('mi-restaurante')).not.toBeInTheDocument();
  });
});

// ─── Formulario de credenciales ───────────────────────────────────────────────

describe('LoginPage — formulario de credenciales', () => {
  async function mostrarFormulario() {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByText('Iniciar sesión con credenciales'));
    return user;
  }

  it('aparece al hacer clic en el botón', async () => {
    await mostrarFormulario();
    expect(screen.getByPlaceholderText('mi-restaurante')).toBeInTheDocument();
  });

  it('tiene campo de email', async () => {
    await mostrarFormulario();
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
  });

  it('tiene campo de contraseña', async () => {
    await mostrarFormulario();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('tiene checkbox "Recordarme 7 días"', async () => {
    await mostrarFormulario();
    expect(screen.getByLabelText(/Recordarme 7 días/i)).toBeInTheDocument();
  });

  it('tiene botón de envío', async () => {
    await mostrarFormulario();
    expect(screen.getByRole('button', { name: /Iniciar sesión/i })).toBeInTheDocument();
  });

  it('el botón volver regresa a la vista demo', async () => {
    const user = await mostrarFormulario();
    await user.click(screen.getByText(/Volver a cuentas demo/i));
    expect(screen.getByText('Admin Restaurante')).toBeInTheDocument();
  });
});

// ─── Clicks en cuentas demo ───────────────────────────────────────────────────

describe('LoginPage — login demo', () => {
  it('Admin Restaurante: llama a login con credenciales correctas', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByText('Admin Restaurante'));

    await waitFor(() => {
      expect(loginFn).toHaveBeenCalledWith(
        'admin@demo.com',
        'admin123',
        'demo-restaurant',
      );
    });
  });

  it('Mesero: llama a login con credenciales de mesero', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByText('Mesero'));

    await waitFor(() => {
      expect(loginFn).toHaveBeenCalledWith(
        'mesero@demo.com',
        'mesero123',
        'demo-restaurant',
      );
    });
  });

  it('Super Admin: llama a loginSuperAdmin con credenciales demo', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByText(/Super Admin/i));

    await waitFor(() => {
      expect(loginSuperAdminFn).toHaveBeenCalledWith(
        'superadmin@restauflow.com',
        'superadmin123',
      );
    });
  });

  it('redirige a /dashboard tras login demo admin', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByText('Admin Restaurante'));

    await waitFor(() => {
      expect(navigateFn).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('redirige a /mesero tras login demo mesero', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByText('Mesero'));

    await waitFor(() => {
      expect(navigateFn).toHaveBeenCalledWith('/mesero');
    });
  });
});
