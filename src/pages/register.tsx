import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/register', { name, email, password });
            signIn(data.token, { id: data.id, name: data.name, email: data.email });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow">
                <h2 className="text-3xl font-bold text-center">Create your account</h2>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full">Sign up</Button>
                </form>
                <div className="text-center">
                    <Link to="/login" className="text-blue-500 hover:underline">Already have an account? Sign in</Link>
                </div>
            </div>
        </div>
    );
}
