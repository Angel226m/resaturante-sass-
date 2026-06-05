import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '@/infraestructura/ui/componentes/comunes/Modal';

// ═══════════════════════════════════════════════════════════
// Unit tests: Modal component
// ═══════════════════════════════════════════════════════════

describe('Modal — visibilidad', () => {
  it('no renderiza nada cuando isOpen=false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={vi.fn()}>Oculto</Modal>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza contenido cuando isOpen=true', () => {
    render(<Modal isOpen={true} onClose={vi.fn()}>Visible</Modal>);
    expect(screen.getByText('Visible')).toBeInTheDocument();
  });

  it('el contenedor externo tiene clase fixed', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={vi.fn()}>C</Modal>,
    );
    const fixed = container.querySelector('.fixed');
    expect(fixed).toBeTruthy();
  });
});

describe('Modal — contenido', () => {
  it('muestra el título cuando se pasa', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} title="Editar producto">C</Modal>);
    expect(screen.getByText('Editar producto')).toBeInTheDocument();
  });

  it('muestra la descripción cuando se pasa', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="T" description="Descripción de prueba">
        C
      </Modal>,
    );
    expect(screen.getByText('Descripción de prueba')).toBeInTheDocument();
  });

  it('no muestra header si no hay title', () => {
    render(<Modal isOpen={true} onClose={vi.fn()}>Contenido sin título</Modal>);
    // No debe haber un h2
    expect(document.querySelector('h2')).toBeNull();
  });

  it('renderiza el footer', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        footer={<button>Confirmar</button>}
      >
        Cuerpo
      </Modal>,
    );
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
  });

  it('muestra el botón de cierre (X) en el header', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Modal con X">
        Cuerpo
      </Modal>,
    );
    // El botón X de cierre
    const closeBtn = screen.getByRole('button');
    expect(closeBtn).toBeTruthy();
  });

  it('el children se renderiza dentro del modal', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <input data-testid="inner-input" />
      </Modal>,
    );
    expect(screen.getByTestId('inner-input')).toBeInTheDocument();
  });
});

describe('Modal — tamaños', () => {
  const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;

  sizes.forEach(size => {
    it(`size="${size}" renderiza sin error`, () => {
      const { container } = render(
        <Modal isOpen={true} onClose={vi.fn()} title="T" size={size}>C</Modal>,
      );
      expect(container.querySelector('.relative')).toBeTruthy();
    });
  });
});

describe('Modal — cierre con botón X', () => {
  it('llama onClose al hacer clic en el botón X del header', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal isOpen={true} onClose={onClose} title="Modal cerrable">
        Cuerpo
      </Modal>,
    );
    const closeBtn = screen.getByRole('button');
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('Modal — cierre con Escape', () => {
  it('llama onClose al presionar la tecla Escape', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <input autoFocus />
      </Modal>,
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('no llama onClose si el modal está cerrado', async () => {
    const onClose = vi.fn();
    render(<Modal isOpen={false} onClose={onClose}>C</Modal>);
    // Simular Escape directamente en documento
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('Modal — cierre con overlay', () => {
  it('llama onClose al hacer clic en el overlay (closeOnOverlay=true por defecto)', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <Modal isOpen={true} onClose={onClose}>Cuerpo</Modal>,
    );
    // El overlay es el primer div hijo del wrapper fixed
    const wrapper = container.querySelector('.fixed')!;
    const overlay = wrapper.firstElementChild as HTMLElement;
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('NO llama onClose al hacer clic en overlay si closeOnOverlay=false', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <Modal isOpen={true} onClose={onClose} closeOnOverlay={false}>Cuerpo</Modal>,
    );
    const wrapper = container.querySelector('.fixed')!;
    const overlay = wrapper.firstElementChild as HTMLElement;
    await user.click(overlay);
    expect(onClose).not.toHaveBeenCalled();
  });
});
