import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useParams } from 'react-router-dom';
import { Gift as GiftIcon, Check, Heart, ChevronDown, Mail, Instagram, Lock, Calendar, Users } from 'lucide-react';

interface Gift {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    status: string;
    category?: string;
}

interface GiftList {
    id: string;
    title: string;
    description?: string;
    slug: string;
    eventDate?: string;
    eventType?: string;
    user: {
        name: string | null;
    };
    gifts: Gift[];
}

export default function PublicRegistryPage() {
    const { slug } = useParams<{ slug: string }>();
    const [list, setList] = useState<GiftList | null>(null);
    const [activeCategory, setActiveCategory] = useState('TODOS');
    const [sortBy, setSortBy] = useState('recommended');
    const [showAllGifts, setShowAllGifts] = useState(false);

    const fetchList = async () => {
        try {
            const { data } = await api.get(`/public/lists/${slug}`);
            setList(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (slug) fetchList();
    }, [slug]);

    const markAsPurchased = async (giftId: string) => {
        try {
            await api.patch(`/public/gifts/${giftId}/purchase`);
            fetchList();
        } catch (err) {
            alert('Este presente já foi reservado por outra pessoa.');
        }
    };

    if (!list) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl animate-pulse mb-4">
                    L
                </div>
                <p className="text-gray-400 text-sm">Carregando lista de presentes...</p>
            </div>
        );
    }

    // Extract unique categories from gifts
    const categories = ['TODOS', ...Array.from(new Set(list.gifts.map(g => g.category || 'OUTROS').filter(Boolean)))];

    // Filter gifts by active category
    const filteredGifts = activeCategory === 'TODOS'
        ? list.gifts
        : list.gifts.filter(g => (g.category || 'OUTROS') === activeCategory);

    // Sort gifts
    const sortedGifts = [...filteredGifts].sort((a, b) => {
        if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
        // Default: available first, then by name
        if (a.status === 'AVAILABLE' && b.status !== 'AVAILABLE') return -1;
        if (a.status !== 'AVAILABLE' && b.status === 'AVAILABLE') return 1;
        return 0;
    });

    // Limit visible gifts
    const visibleGifts = showAllGifts ? sortedGifts : sortedGifts.slice(0, 8);

    // Stats
    const totalGifts = list.gifts.length;
    const purchasedGifts = list.gifts.filter(g => g.status !== 'AVAILABLE').length;
    const totalValue = list.gifts.reduce((acc, g) => acc + Number(g.price), 0);
    const raisedValue = list.gifts.reduce((acc, g) => acc + (g.status !== 'AVAILABLE' ? Number(g.price) : 0), 0);

    // Category label map
    const categoryLabels: Record<string, string> = {
        'TODOS': 'Todos os Presentes',
        'VIAGEM': 'Lua de Mel',
        'CASA': 'Casa',
        'EXPERIENCIA': 'Experiência',
        'OUTROS': 'Outros',
    };

    const getCategoryLabel = (cat: string) => categoryLabels[cat] || cat;

    const getCategoryColor = (cat: string) => {
        const colors: Record<string, string> = {
            'VIAGEM': 'bg-blue-500',
            'CASA': 'bg-green-500',
            'EXPERIENCIA': 'bg-purple-500',
            'OUTROS': 'bg-gray-500',
        };
        return colors[cat] || 'bg-orange-500';
    };

    const formatEventDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const eventTypeLabels: Record<string, string> = {
        'CASAMENTO': 'Os Noivos',
        'CHA_CASA_NOVA': 'A Casa Nova',
        'CHA_DE_BEBE': 'O Bebê',
        'ANIVERSARIO': 'Aniversariante',
    };
    const heroNavLabel = list.eventType ? (eventTypeLabels[list.eventType] || 'O Evento') : 'O Evento';

    return (
        <div className="min-h-screen bg-[#fafbfc] font-sans flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                L
                            </div>
                            <span className="font-bold text-gray-800 text-sm tracking-tight">Listly</span>
                            <span className="text-[10px] text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">Alimentado por</span>
                        </div>
                        <nav className="hidden md:flex items-center gap-6 text-sm">
                            <a href="#hero" className="text-gray-500 hover:text-orange-600 transition-colors">{heroNavLabel}</a>
                            <a href="#gifts" className="text-orange-600 font-semibold border-b-2 border-orange-500 pb-0.5">Lista de Presentes</a>
                            <a href="#details" className="text-gray-500 hover:text-orange-600 transition-colors">Detalhes do Evento</a>
                        </nav>
                    </div>
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border border-gray-200">
                        <Lock className="w-3.5 h-3.5" />
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section id="hero" className="bg-white py-16 border-b border-gray-100">
                <div className="max-w-3xl mx-auto text-center px-6">
                    {/* Event Date Badge */}
                    {list.eventDate && (
                        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatEventDate(list.eventDate)}
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                        Lista de Presentes de{' '}
                        <span className="text-orange-500">{list.user.name || 'Anônimo'}</span>
                    </h1>

                    {/* Description */}
                    {list.description && (
                        <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                            {list.description}
                        </p>
                    )}

                    {/* Social proof */}
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-orange-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                                {list.user.name?.charAt(0) || 'L'}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-orange-300 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                                ❤
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                            <Users className="w-3.5 h-3.5 text-orange-500" />
                            <span className="font-medium text-orange-600">+{purchasedGifts}</span>
                            <span>Convidados já contribuíram!</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Controls: Category Tabs + Sort */}
            <section id="gifts" className="max-w-7xl mx-auto w-full px-6 pt-10 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeCategory === cat
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {getCategoryLabel(cat)}
                            </button>
                        ))}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-400 font-medium">Ordenar por:</span>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 font-medium pr-8 cursor-pointer hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
                            >
                                <option value="recommended">Recomendados</option>
                                <option value="price-asc">Menor Preço</option>
                                <option value="price-desc">Maior Preço</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Gift Grid */}
            <section className="max-w-7xl mx-auto w-full px-6 pb-10 flex-1">
                {visibleGifts.length === 0 ? (
                    <div className="text-center py-20">
                        <GiftIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum presente nesta categoria</h3>
                        <p className="text-gray-400 text-sm">Tente selecionar outra categoria acima.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {visibleGifts.map(gift => {
                                const isCompleted = gift.status !== 'AVAILABLE';
                                const raised = isCompleted ? Number(gift.price) : 0;
                                const percent = isCompleted ? 100 : 0;
                                const categoryLabel = getCategoryLabel(gift.category || 'OUTROS');

                                return (
                                    <Card key={gift.id} className="group overflow-hidden border-gray-100 hover:shadow-xl transition-all duration-300 bg-white rounded-2xl flex flex-col">
                                        {/* Image */}
                                        <div className="h-48 bg-gray-100 relative overflow-hidden">
                                            {gift.imageUrl ? (
                                                <img src={gift.imageUrl} alt={gift.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-orange-50/50">
                                                    <GiftIcon className="w-10 h-10 mb-2 opacity-50" />
                                                </div>
                                            )}
                                            {/* Category Badge */}
                                            <div className="absolute top-3 left-3">
                                                <span className={`text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide shadow-sm ${getCategoryColor(gift.category || 'OUTROS')}`}>
                                                    {categoryLabel}
                                                </span>
                                            </div>
                                            {/* Completed Overlay */}
                                            {isCompleted && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <span className="bg-white/95 text-gray-800 text-xs font-bold px-4 py-2 rounded-lg uppercase tracking-wider shadow-lg">
                                                        Completo
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col">
                                            {/* Gift Name & Description */}
                                            <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-1 mb-1">{gift.name}</h3>
                                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4 min-h-[2rem]">
                                                {gift.description || 'Ajude-nos a realizar este sonho! Qualquer contribuição é bem-vinda.'}
                                            </p>

                                            {/* Progress Section */}
                                            <div className="space-y-2 mb-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Arrecadado</span>
                                                    <span className="text-xs font-bold text-orange-500">{percent}%</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-orange-600">
                                                        R$ {raised.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">/R$ {Number(gift.price).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-orange-400'}`}
                                                        style={{ width: `${percent > 5 ? percent : 5}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Price Info Row */}
                                            <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-50 pt-3 mb-4">
                                                <div>
                                                    <span className="block uppercase tracking-wide">Valor do Presente</span>
                                                    <span className="text-xs font-bold text-gray-700">R$ {Number(gift.price).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block uppercase tracking-wide">Quota/falta</span>
                                                    <span className="text-xs font-bold text-gray-700">R$ {(Number(gift.price) - raised).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="mt-auto">
                                                {isCompleted ? (
                                                    <Button
                                                        variant="outline"
                                                        disabled
                                                        className="w-full border-green-200 text-green-600 bg-green-50 cursor-not-allowed"
                                                    >
                                                        <Check className="w-4 h-4 mr-2" />
                                                        Concluído com Sucesso
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-sm shadow-orange-100"
                                                        onClick={() => markAsPurchased(gift.id)}
                                                    >
                                                        <Heart className="w-4 h-4 mr-2" />
                                                        Contribuir
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Show More Button */}
                        {!showAllGifts && sortedGifts.length > 8 && (
                            <div className="text-center mt-10">
                                <Button
                                    variant="outline"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 rounded-full"
                                    onClick={() => setShowAllGifts(true)}
                                >
                                    Ver Mais Opções
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Footer */}
            <footer id="details" className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            L
                        </div>
                        <span className="font-bold text-gray-800 text-sm tracking-tight">Listly</span>
                    </div>

                    <p className="text-sm text-gray-400 mb-6">
                        Feito com muito carinho e alegria para {list.user.name || 'você'}.
                    </p>

                    <div className="flex items-center justify-center gap-4 mb-8">
                        <a href="#" className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-colors">
                            <Instagram className="w-4 h-4" />
                        </a>
                        <a href="#" className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-colors">
                            <Mail className="w-4 h-4" />
                        </a>
                        <a href="#" className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-colors">
                            <Lock className="w-4 h-4" />
                        </a>
                    </div>

                    <p className="text-[10px] text-gray-300 uppercase tracking-widest font-medium">
                        Portal de Presentes alimentado por Listly
                    </p>
                </div>
            </footer>
        </div>
    );
}
