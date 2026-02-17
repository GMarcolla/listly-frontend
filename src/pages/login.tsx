import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });
            signIn(data.token, { id: data.id, name: data.name, email: data.email });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Side - Hero */}
            <div className="hidden lg:flex w-1/2 bg-orange-500 flex-col justify-center p-12 text-white bg-[url('https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=2874&auto=format&fit=crop')] bg-cover bg-center relative">
                <div className="absolute inset-0 bg-orange-600/80 mix-blend-multiply" />
                <div className="relative z-10 max-w-lg">
                    <div className="mb-8 p-3 bg-white/20 w-fit rounded-xl backdrop-blur-sm">
                        <Gift className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Celebre os maiores momentos da vida.</h1>
                    <p className="text-lg text-orange-100 leading-relaxed">
                        Crie a lista perfeita para seu casamento ou chá de bebê com sistema de cotas via PIX.
                        Junte-se a milhares de casais felizes.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Bem-vindo de volta</h2>
                        <p className="mt-2 text-sm text-gray-600">Acesse sua conta para gerenciar sua lista.</p>
                    </div>

                    {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Senha</label>
                                    <a href="#" className="text-sm font-medium text-orange-600 hover:text-orange-500">Esqueceu a senha?</a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white h-11 text-base">
                            Entrar
                        </Button>
                    </form>

                    <p className="text-center text-sm text-gray-600">
                        Não tem uma conta?{' '}
                        <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-500">
                            Cadastre-se gratuitamente
                        </Link>
                    </p>
                    <div className="text-center text-xs text-gray-400 mt-8">
                        © 2024 Listly. Todos os direitos reservados.
                    </div>
                </div>
            </div>
        </div>
    );
}
