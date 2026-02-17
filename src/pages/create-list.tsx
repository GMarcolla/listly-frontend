import { useState } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Gift, ArrowLeft, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const DEFAULT_EVENT_TYPES = [
    { id: 'CASAMENTO', label: 'Casamento' },
    { id: 'CHA_CASA_NOVA', label: 'Chá de Casa Nova' },
    { id: 'CHA_DE_BEBE', label: 'Chá de Bebê' },
    { id: 'ANIVERSARIO', label: 'Aniversário' },
    { id: 'OUTROS', label: 'Outros' },
];

export default function CreateListPage() {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventType, setEventType] = useState('');
    const [customEventType, setCustomEventType] = useState('');
    const [availableEventTypes, setAvailableEventTypes] = useState(DEFAULT_EVENT_TYPES);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/lists', {
                title,
                slug,
                description: description || undefined,
                eventDate: eventDate || undefined,
                eventType: eventType || undefined,
            });
            navigate(`/lists/${data.id}`);
        } catch (err: any) {
            setError('Erro ao criar lista. O link (slug) pode já estar em uso.');
        } finally {
            setLoading(false);
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setSlug(val);
    };

    const handleAddCustomEventType = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && customEventType.trim()) {
            e.preventDefault();
            const newId = customEventType.trim().toUpperCase().replace(/\s+/g, '_');
            if (!availableEventTypes.some(t => t.id === newId)) {
                setAvailableEventTypes([...availableEventTypes, { id: newId, label: customEventType.trim() }]);
            }
            setEventType(newId);
            setCustomEventType('');
        }
    };

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Side - Image */}
            <div className="hidden lg:flex w-1/2 bg-orange-50 flex-col justify-center p-12 text-white bg-[url('https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=2874&auto=format&fit=crop')] bg-cover bg-center relative">
                <div className="absolute inset-0 bg-orange-900/40 mix-blend-multiply" />
                <div className="relative z-10 max-w-lg">
                    <div className="mb-8 p-3 bg-white/20 w-fit rounded-xl backdrop-blur-sm">
                        <Gift className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-6 leading-tight">Comece sua nova jornada.</h1>
                    <p className="text-lg text-orange-100 leading-relaxed">
                        Crie sua lista de presentes personalizada em segundos e compartilhe com todos os seus convidados de forma fácil e elegante.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white relative overflow-y-auto">
                <Button variant="ghost" className="absolute top-8 left-8" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>

                <div className="w-full max-w-md space-y-8 py-16">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Criar Nova Lista</h2>
                        <p className="mt-2 text-sm text-gray-600">Configure os detalhes do seu evento.</p>
                    </div>

                    {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Event Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Tipo do Evento</label>
                            <div className="flex flex-wrap gap-2">
                                {availableEventTypes.map(type => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setEventType(type.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${eventType === type.id
                                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <Input
                                    placeholder="Ou digite um tipo personalizado e pressione Enter"
                                    value={customEventType}
                                    onChange={(e) => setCustomEventType(e.target.value)}
                                    onKeyDown={handleAddCustomEventType}
                                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors h-9 text-sm"
                                />
                                {customEventType.trim() && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newId = customEventType.trim().toUpperCase().replace(/\s+/g, '_');
                                            if (!availableEventTypes.some(t => t.id === newId)) {
                                                setAvailableEventTypes([...availableEventTypes, { id: newId, label: customEventType.trim() }]);
                                            }
                                            setEventType(newId);
                                            setCustomEventType('');
                                        }}
                                        className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors shrink-0"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Event Name */}
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium leading-none">Nome do Evento</label>
                            <Input
                                id="title"
                                placeholder="Ex: Casamento de Carol e André"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors h-11"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium leading-none">Descrição do Evento</label>
                            <Textarea
                                id="description"
                                placeholder="Descreva o seu evento para os convidados..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors resize-none"
                            />
                            <p className="text-xs text-gray-500">Opcional. Essa mensagem aparecerá na página pública do evento.</p>
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <label htmlFor="slug" className="text-sm font-medium leading-none">Link Personalizado (Slug)</label>
                            <div className="flex items-center">
                                <span className="text-sm text-gray-400 mr-2 bg-gray-50 px-3 py-3 rounded-l-md border border-r-0 border-gray-200">listly.com/</span>
                                <Input
                                    id="slug"
                                    placeholder="casamento-carol-andre"
                                    value={slug}
                                    onChange={handleSlugChange}
                                    required
                                    className="rounded-l-none h-11"
                                />
                            </div>
                            <p className="text-xs text-gray-500">Este será o link único para compartilhar sua lista.</p>
                        </div>

                        {/* Event Date */}
                        <div className="space-y-2">
                            <label htmlFor="eventDate" className="text-sm font-medium leading-none">Data do Evento</label>
                            <Input
                                id="eventDate"
                                type="date"
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors h-11"
                            />
                            <p className="text-xs text-gray-500">Opcional. Informe a data do seu evento para exibir aos convidados.</p>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-base shadow-lg shadow-orange-100">
                                {loading ? 'Criando...' : 'Criar Lista Grátis'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
