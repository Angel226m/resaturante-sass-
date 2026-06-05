import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '@/infraestructura/ui/componentes/comunes/Input';

// ═══════════════════════════════════════════════════════════
// Unit tests: Input component
// ═══════════════════════════════════════════════════════════

describe('Input — render básico', () => {
  it('renderiza un elemento input', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('pasa placeholder al input', () => {
    render(<Input placeholder="Escribe aquí" />);
    expect(screen.getByPlaceholderText('Escribe aquí')).toBeInTheDocument();
  });

  it('aplica className adicional al input', () => {
    const { container } = render(<Input className="mi-clase-extra" />);
    const input = container.querySelector('input')!;
    expect(input.className).toContain('mi-clase-extra');
  });
});

describe('Input — label', () => {
  it('renderiza el label cuando se pasa', () => {
    render(<Input label="Correo" />);
    expect(screen.getByText('Correo')).toBeInTheDocument();
  });

  it('el label está enlazado al input mediante htmlFor/id', () => {
    render(<Input label="Correo electrónico" />);
    const label = screen.getByText('Correo electrónico') as HTMLLabelElement;
    const input = screen.getByRole('textbox') as HTMLInputElement;
    // El id del input debe coincidir con el htmlFor del label
    expect(label.htmlFor).toBe(input.id);
    expect(input.id.length).toBeGreaterThan(0);
  });

  it('no renderiza label cuando no se pasa la prop', () => {
    render(<Input placeholder="Sin label" />);
    const labels = document.querySelectorAll('label');
    expect(labels.length).toBe(0);
  });

  it('usa el id explícito cuando se pasa', () => {
    render(<Input id="mi-input" label="Mi campo" />);
    expect(screen.getByRole('textbox').id).toBe('mi-input');
  });
});

describe('Input — error', () => {
  it('muestra el mensaje de error', () => {
    render(<Input error="Campo requerido" />);
    expect(screen.getByText('Campo requerido')).toBeInTheDocument();
  });

  it('el mensaje de error tiene clase text-red-500', () => {
    const { container } = render(<Input error="Error!" />);
    const errorEl = container.querySelector('p')!;
    expect(errorEl.className).toContain('text-red-500');
  });

  it('el input tiene borde rojo cuando hay error', () => {
    const { container } = render(<Input error="Error" />);
    const input = container.querySelector('input')!;
    expect(input.className).toContain('border-red-500');
  });

  it('no muestra mensaje de error si no se pasa la prop', () => {
    const { container } = render(<Input />);
    expect(container.querySelector('p')).toBeNull();
  });
});

describe('Input — iconos', () => {
  it('renderiza leftIcon cuando se pasa', () => {
    render(<Input leftIcon={<span data-testid="left-icon">@</span>} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renderiza rightIcon cuando se pasa', () => {
    render(<Input rightIcon={<span data-testid="right-icon">👁</span>} />);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('con leftIcon el input tiene padding-left mayor', () => {
    const { container } = render(<Input leftIcon={<span>@</span>} />);
    const input = container.querySelector('input')!;
    expect(input.className).toContain('pl-10');
  });

  it('con rightIcon el input tiene padding-right mayor', () => {
    const { container } = render(<Input rightIcon={<span>👁</span>} />);
    const input = container.querySelector('input')!;
    expect(input.className).toContain('pr-10');
  });

  it('sin iconos no tiene pl-10 ni pr-10 extra', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input')!;
    expect(input.className).not.toContain('pl-10');
    expect(input.className).not.toContain('pr-10');
  });
});

describe('Input — estados de interacción', () => {
  it('disabled deshabilita el input', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('acepta escritura del usuario', async () => {
    const user = userEvent.setup();
    render(<Input />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'hola mundo');
    expect(input).toHaveValue('hola mundo');
  });

  it('dispara onChange al escribir', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Input onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('type="password" oculta el texto', () => {
    render(<Input type="password" />);
    const input = document.querySelector('input[type="password"]');
    expect(input).toBeTruthy();
  });

  it('value controlado funciona correctamente', () => {
    render(<Input value="fijo" onChange={() => undefined} />);
    expect(screen.getByRole('textbox')).toHaveValue('fijo');
  });
});

describe('Input — ref forwarding', () => {
  it('el ref apunta al elemento input', () => {
    let ref: HTMLInputElement | null = null;
    render(<Input ref={(el) => { ref = el; }} />);
    expect(ref).toBeInstanceOf(HTMLInputElement);
  });
});
