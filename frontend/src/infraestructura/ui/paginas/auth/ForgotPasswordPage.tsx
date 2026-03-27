import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, Building2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authRepository } from '@/infraestructura/repositorios';
import Button from '@/infraestructura/ui/componentes/comunes/Button';
import Input from '@/infraestructura/ui/componentes/comunes/Input';

const schema = z.object({
  email: z.string().email('Email inválido'),
  tenant_slug: z.string().min(1, 'Ingresa tu código de restaurante'),
});
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    setIsLoading(true);
    try {
      await authRepository.recuperarPassword(data);
      setSent(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje || 'Error al enviar el email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 mb-8">
          <ArrowLeft className="h-4 w-4" /> Volver al login
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {sent ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Email enviado</h2>
              <p className="mt-2 text-sm text-slate-500">
                Si existe una cuenta con ese email, recibirás las instrucciones para restablecer tu contraseña.
              </p>
              <Link to="/login" className="mt-6 block">
                <Button variant="outline" className="w-full">Volver al login</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recuperar contraseña</h2>
                <p className="mt-1 text-slate-500">Te enviaremos un enlace para restablecer tu contraseña</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Código de restaurante" placeholder="mi-restaurante" leftIcon={<Building2 className="h-4 w-4" />} error={errors.tenant_slug?.message} {...register('tenant_slug')} />
                <Input label="Email" type="email" placeholder="tu@email.com" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
                <Button type="submit" isLoading={isLoading} className="w-full">Enviar enlace</Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
