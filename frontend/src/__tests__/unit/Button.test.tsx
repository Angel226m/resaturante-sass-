import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@/infraestructura/ui/componentes/comunes/Button';

// ═══════════════════════════════════════════════════════════
// Unit tests: Button component
// ═══════════════════════════════════════════════════════════

describe('Button — render', () => {
  it('muestra el texto hijo', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('por defecto no está deshabilitado', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('disabled=true deshabilita el botón', () => {
    render(<Button disabled>No puedo</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('isLoading=true deshabilita el botón', () => {
    render(<Button isLoading>Cargando</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('isLoading muestra spinner (svg) en lugar del icono left', () => {
    render(<Button isLoading leftIcon={<span data-testid="icon" />}>Texto</Button>);
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
    // Loader2 renders an svg
    expect(screen.getByRole('button').querySelector('svg')).toBeTruthy();
  });

  it('llama onClick al hacer clic', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Button onClick={fn}>Clic</Button>);
    await user.click(screen.getByRole('button'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('no llama onClick cuando está deshabilitado', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Button disabled onClick={fn}>Clic</Button>);
    await user.click(screen.getByRole('button'));
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('Button — variantes', () => {
  it('variante primary tiene clases teal', () => {
    render(<Button variant="primary">P</Button>);
    expect(screen.getByRole('button').className).toMatch(/teal/);
  });

  it('variante danger tiene clases red', () => {
    render(<Button variant="danger">D</Button>);
    expect(screen.getByRole('button').className).toMatch(/red/);
  });

  it('variante success tiene clases emerald', () => {
    render(<Button variant="success">S</Button>);
    expect(screen.getByRole('button').className).toMatch(/emerald/);
  });
});

describe('Button — tamaños', () => {
  it('size lg tiene h-12', () => {
    render(<Button size="lg">Grande</Button>);
    expect(screen.getByRole('button').className).toMatch(/h-12/);
  });

  it('size sm tiene h-8', () => {
    render(<Button size="sm">Pequeño</Button>);
    expect(screen.getByRole('button').className).toMatch(/h-8/);
  });
});

describe('Button — slots', () => {
  it('renderiza leftIcon cuando no está cargando', () => {
    render(<Button leftIcon={<span data-testid="left-icon" />}>OK</Button>);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renderiza rightIcon', () => {
    render(<Button rightIcon={<span data-testid="right-icon" />}>OK</Button>);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('acepta className extra', () => {
    render(<Button className="mi-clase-custom">OK</Button>);
    expect(screen.getByRole('button').className).toMatch(/mi-clase-custom/);
  });
});
