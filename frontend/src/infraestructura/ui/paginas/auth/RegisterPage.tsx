import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Building2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/infraestructura/ui/componentes/comunes/Button';
import Input from '@/infraestructura/ui/componentes/comunes/Input';

const registerSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  apellido: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
  tenant_nombre: z.string().min(3, 'Mínimo 3 caracteres'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});
type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (_data: RegisterForm) => {
    setIsLoading(true);
    try {
      // This would call a registration endpoint
      toast.success('¡Cuenta creada exitosamente! Inicia sesión.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje || 'Error al crear cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-lg">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 mb-8">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white font-bold">
                RF
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">RestauFlow</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Crea tu cuenta</h2>
            <p className="mt-1 text-slate-500">Prueba gratuita por 14 días, sin compromiso</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nombre" placeholder="Juan" leftIcon={<User className="h-4 w-4" />} error={errors.nombre?.message} {...register('nombre')} />
              <Input label="Apellido" placeholder="García" error={errors.apellido?.message} {...register('apellido')} />
            </div>
            <Input label="Nombre del restaurante" placeholder="Mi Restaurante" leftIcon={<Building2 className="h-4 w-4" />} error={errors.tenant_nombre?.message} {...register('tenant_nombre')} />
            <Input label="Email" type="email" placeholder="tu@email.com" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
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
            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" isLoading={isLoading} className="w-full mt-2">
              Crear cuenta gratis
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-teal-600 hover:text-teal-700">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
