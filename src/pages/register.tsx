import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FormField } from '@/components/FormField';
import { MaskedFormField } from '@/components/MaskedFormField';
import { DateFormField } from '@/components/DateFormField';
import { validateCPF, isValidDate, dateToISO, stripCPFFormatting } from '@/lib/validation';
import { Loader2, ArrowRight } from 'lucide-react';

// Registration form validation schema
const registrationSchema = z.object({
  name: z.string({ required_error: "Nome completo é obrigatório" })
    .min(1, "Nome completo é obrigatório"),
  email: z.string({ required_error: "E-mail é obrigatório" })
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido"),
  cpf: z.string({ required_error: "CPF é obrigatório" })
    .min(1, "CPF é obrigatório")
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato XXX.XXX.XXX-XX")
    .refine((cpf) => validateCPF(cpf), "CPF inválido"),
  birthDate: z.string({ required_error: "Data de nascimento é obrigatória" })
    .min(1, "Data de nascimento é obrigatória")
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data deve estar no formato DD/MM/AAAA")
    .refine((date) => isValidDate(date), "Data inválida"),
  password: z.string({ required_error: "Senha é obrigatória" })
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string({ required_error: "Confirmação de senha é obrigatória" })
    .min(1, "Confirmação de senha é obrigatória")
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function RegisterPage() {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { control, handleSubmit } = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        mode: 'onBlur',
        defaultValues: {
            name: '',
            email: '',
            cpf: '',
            birthDate: '',
            password: '',
            confirmPassword: ''
        }
    });

    const onSubmit = async (data: RegistrationFormData) => {
        setError('');
        setIsLoading(true);

        try {
            // Format data for API
            const payload = {
                name: data.name,
                email: data.email,
                cpf: stripCPFFormatting(data.cpf),
                birthDate: dateToISO(data.birthDate),
                password: data.password
            };

            const response = await api.post('/auth/register', payload);
            
            // Store token and update context
            signIn(response.data.token, {
                id: response.data.id,
                name: response.data.name,
                email: response.data.email
            });

            // Navigate to dashboard
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao criar conta. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Header />
            
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Hero banner inside card */}
                    <div className="relative bg-gray-900 py-12 bg-[url('https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2869&auto=format&fit=crop')] bg-cover bg-center">
                        <div className="absolute inset-0 bg-gray-900/70" />
                        <div className="relative z-10 text-center">
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                Comece sua jornada
                            </h1>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Crie sua conta no Listly
                            </h2>
                            <p className="text-sm text-gray-500">
                                Organize sua lista de presentes e receba contribuições via PIX
                            </p>
                        </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            name="name"
                            control={control}
                            label="Nome Completo"
                            type="text"
                            placeholder="Como devemos te chamar?"
                        />

                        <FormField
                            name="email"
                            control={control}
                            label="E-mail"
                            type="email"
                            placeholder="seu@email.com"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <MaskedFormField
                                name="cpf"
                                control={control}
                                label="CPF"
                                mask="000.000.000-00"
                                placeholder="000.000.000-00"
                            />

                            <DateFormField
                                name="birthDate"
                                control={control}
                                label="Data de Nascimento"
                                placeholder="DD/MM/AAAA"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                name="password"
                                control={control}
                                label="Senha"
                                type="password"
                                placeholder="••••••••"
                            />

                            <FormField
                                name="confirmPassword"
                                control={control}
                                label="Confirmar Senha"
                                type="password"
                                placeholder="••••••••"
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-6 rounded-lg text-base"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Criando conta...
                                </>
                            ) : (
                                <>
                                    Criar Minha Conta
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </form>

                        <div className="text-center pt-2">
                            <p className="text-sm text-gray-600">
                                Já possui uma conta?{' '}
                                <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium">
                                    Entre aqui
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
