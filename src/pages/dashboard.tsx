import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { Plus, Gift, Bell, Settings, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface GiftList {
    id: string;
    title: string;
    description?: string;
    slug: string;
    createdAt: string;
    eventDate?: string;
    isPrivate: boolean;
    gifts: {
        id: string;
        price: number;
        status: string;
        imageUrl?: string;
    }[];
    _count: {
        gifts: number;
    }
}

export default function DashboardPage() {
    const [lists, setLists] = useState<GiftList[]>([]);
    const [activeTab, setActiveTab] = useState<'ativos' | 'encerrados' | 'rascunhos'>('ativos');
    const { } = useAuth();
    const [loading, setLoading] = useState(true);

    const fetchLists = async () => {
        try {
            const { data } = await api.get('/lists');
            setLists(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLists();
    }, []);

    const filteredLists = lists.filter(list => {
        if (activeTab === 'ativos') return !list.isPrivate; // Public lists as "Active"
        if (activeTab === 'rascunhos') return list.isPrivate; // Private lists as "Drafts"
        if (activeTab === 'encerrados') return false; // No logic for closed yet
        return true;
    });

    const calculateProgress = (gifts: GiftList['gifts'] = []) => {
        if (!gifts) return { total: 0, raised: 0, percent: 0 };
        const total = gifts.reduce((acc, gift) => acc + Number(gift.price), 0);
        const raised = gifts.reduce((acc, gift) => {
            return acc + (gift.status !== 'AVAILABLE' ? Number(gift.price) : 0);
        }, 0);
        return {
            total,
            raised,
            percent: total > 0 ? (raised / total) * 100 : 0
        };
    };



    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                L
                            </div>
                            <span className="font-bold text-gray-900 text-lg tracking-tight">Listly</span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            <a href="#" className="text-sm font-medium text-orange-600">Início</a>
                            <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Explorar</a>
                            <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Minhas Listas</a>
                            <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Ajuda</a>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="text-gray-400 hover:text-gray-600">
                            <Bell className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
                {/* Breadcrumbs & Title */}
                <div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 font-medium">
                        <span>Dashboard</span>
                        <span>›</span>
                        <span className="text-gray-900">Meus Eventos</span>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Meus Eventos</h1>
                            <p className="text-gray-500 text-sm mt-1">Gerencie suas listas de presentes e acompanhe seus eventos.</p>
                        </div>
                        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 font-bold rounded-lg px-6 h-10 transition-all hover:scale-105 active:scale-95">
                            <Link to="/create-list">
                                <Plus className="mr-2 h-4 w-4" /> Criar Nova Lista
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('ativos')}
                            className={`pb-3 text-sm font-medium transition-all relative ${activeTab === 'ativos' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Ativos
                            <span className="ml-2 bg-orange-100 text-orange-700 py-0.5 px-2 rounded-full text-[10px]">
                                {lists.filter(l => !l.isPrivate).length}
                            </span>
                            {activeTab === 'ativos' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-t-full"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('encerrados')}
                            className={`pb-3 text-sm font-medium transition-all relative ${activeTab === 'encerrados' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Encerrados
                            {activeTab === 'encerrados' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-t-full"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('rascunhos')}
                            className={`pb-3 text-sm font-medium transition-all relative ${activeTab === 'rascunhos' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Rascunhos
                            <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-[10px]">
                                {lists.filter(l => l.isPrivate).length}
                            </span>
                            {activeTab === 'rascunhos' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-t-full"></div>}
                        </button>
                    </div>
                </div>



                {/* Lists Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[320px] bg-gray-100 rounded-2xl"></div>
                        ))}
                    </div>
                ) : filteredLists.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Gift className="w-8 h-8 text-orange-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Nenhum evento encontrado</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">Não encontramos nenhuma lista nesta categoria. Que tal criar um novo evento agora?</p>
                        <Button asChild variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                            <Link to="/create-list">Criar Nova Lista</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLists.map(list => {
                            const listGifts = list.gifts || [];
                            const stats = calculateProgress(listGifts);
                            const coverImage = listGifts.find(g => g.imageUrl)?.imageUrl;

                            return (
                                <Card key={list.id} className="group overflow-hidden border-gray-100 hover:shadow-xl transition-all duration-300 bg-white rounded-2xl flex flex-col">
                                    {/* Card Image Header */}
                                    <div className="h-40 bg-gray-100 relative overflow-hidden">
                                        {coverImage ? (
                                            <img src={coverImage} alt={list.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-orange-50/50">
                                                <Calendar className="w-8 h-8 mb-2 opacity-50" />
                                                <span className="text-xs font-medium opacity-50">Sem capa</span>
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-white/90 backdrop-blur-sm text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border border-orange-100 shadow-sm">
                                                {list.isPrivate ? 'Privado/Rascunho' : 'Evento Público'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="mb-4">
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-1 group-hover:text-orange-600 transition-colors">
                                                {list.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                                <Calendar className="w-3 h-3" />
                                                <span>{list.eventDate
                                                    ? new Date(list.eventDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
                                                    : new Date(list.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs text-gray-500 font-medium">Progresso da arrecadação</span>
                                                <span className="text-xs font-bold text-orange-600">{Math.round(stats.percent)}%</span>
                                            </div>
                                            <Progress value={stats.percent} className="h-1.5" />
                                            <div className="flex justify-between items-center pt-1">
                                                <span className="text-sm font-bold text-gray-900">R$ {stats.raised.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Meta: R$ {stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <Button asChild variant="secondary" className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 font-medium border border-gray-200">
                                                <Link to={`/lists/${list.id}`}>
                                                    <Settings className="w-3 h-3 mr-2 text-gray-500" />
                                                    Gerenciar Lista
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}


            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12 mt-12">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-xs">L</div>
                            <span className="font-bold text-gray-900 tracking-tight">Listly</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                            Sua plataforma completa para listas de presentes digitais com recebimento via PIX. Simples, rápido e seguro.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-4">Produto</h4>
                        <ul className="space-y-2 text-xs text-gray-500">
                            <li><a href="#" className="hover:text-orange-600">Como Funciona</a></li>
                            <li><a href="#" className="hover:text-orange-600">Taxas e Prazos</a></li>
                            <li><a href="#" className="hover:text-orange-600">Explorar Listas</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-4">Suporte</h4>
                        <ul className="space-y-2 text-xs text-gray-500">
                            <li><a href="#" className="hover:text-orange-600">Central de Ajuda</a></li>
                            <li><a href="#" className="hover:text-orange-600">Contato</a></li>
                            <li><a href="#" className="hover:text-orange-600">Status do Sistema</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-4">Legal</h4>
                        <ul className="space-y-2 text-xs text-gray-500">
                            <li><a href="#" className="hover:text-orange-600">Termos de Uso</a></li>
                            <li><a href="#" className="hover:text-orange-600">Privacidade</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] text-gray-400">© 2024 Listly Tecnologia Ltda. Todos os direitos reservados.</p>
                    <div className="flex gap-4">
                        {/* Social Icons Placeholders */}
                        <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                        <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                        <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                    </div>
                </div>
            </footer>
        </div>
    );
}


