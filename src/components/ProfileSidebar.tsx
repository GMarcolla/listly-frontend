import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { User, Mail, CreditCard, Calendar, LogOut, Loader2 } from 'lucide-react';

interface ProfileData {
    id: string;
    name: string | null;
    email: string;
    cpf: string | null;
    birthDate: string | null;
    createdAt: string;
}

interface ProfileSidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ProfileSidebar({ open, onOpenChange }: ProfileSidebarProps) {
    const { user, signOut } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [cpf, setCpf] = useState('');
    const [birthDate, setBirthDate] = useState('');

    // Fetch profile when sidebar opens
    useEffect(() => {
        if (open) {
            fetchProfile();
        }
    }, [open]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/profile');
            setProfile(data);
            setName(data.name || '');
            setCpf(data.cpf || '');
            setBirthDate(data.birthDate ? data.birthDate.substring(0, 10) : '');
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCpf = (value: string) => {
        const digits = value.replace(/\D/g, '').substring(0, 11);
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
        if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCpf(formatCpf(e.target.value));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await api.patch('/profile', {
                name: name || undefined,
                cpf: cpf || undefined,
                birthDate: birthDate || undefined,
            });
            setProfile(data);

            // Update localStorage user data
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                parsed.name = data.name;
                localStorage.setItem('user', JSON.stringify(parsed));
            }

            onOpenChange(false);
        } catch (err) {
            console.error('Failed to save profile:', err);
            alert('Erro ao salvar perfil.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        signOut();
        onOpenChange(false);
        window.location.href = '/login';
    };

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : user?.email?.charAt(0).toUpperCase() || 'U';

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex flex-col overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Meu Perfil</SheetTitle>
                    <SheetDescription>Gerencie suas informações pessoais.</SheetDescription>
                </SheetHeader>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                    </div>
                ) : (
                    <>
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center px-6 py-6 border-b border-gray-100">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-orange-100 mb-3">
                                {initials}
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{profile?.name || 'Usuário'}</p>
                            <p className="text-xs text-gray-400">{profile?.email}</p>
                        </div>

                        {/* Form */}
                        <div className="flex-1 px-6 py-5 space-y-5">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-orange-500" />
                                    Nome Completo
                                </label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Seu nome completo"
                                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors h-10"
                                />
                            </div>

                            {/* Email (read-only) */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-orange-500" />
                                    E-mail
                                </label>
                                <Input
                                    value={profile?.email || ''}
                                    disabled
                                    className="bg-gray-100 text-gray-500 cursor-not-allowed h-10"
                                />
                                <p className="text-[10px] text-gray-400">O e-mail não pode ser alterado.</p>
                            </div>

                            {/* CPF */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <CreditCard className="w-3.5 h-3.5 text-orange-500" />
                                    CPF
                                </label>
                                <Input
                                    value={cpf}
                                    onChange={handleCpfChange}
                                    placeholder="000.000.000-00"
                                    maxLength={14}
                                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors h-10"
                                />
                            </div>

                            {/* Birth Date */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                                    Data de Nascimento
                                </label>
                                <Input
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors h-10"
                                />
                            </div>

                            {/* Member Since */}
                            {profile?.createdAt && (
                                <div className="pt-2">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                                        Membro desde {new Date(profile.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 px-6 py-4 space-y-3">
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sair da Conta
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
