import { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useParams, Link } from 'react-router-dom';
import { Trash2, Plus, Info, Image as ImageIcon, Upload, X, Gift as GiftIcon, Edit2, Share2, User, Settings, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';

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
    gifts: Gift[];
    isPrivate: boolean;
    eventDate?: string;
    eventType?: string;
    createdAt?: string;
}

interface CategoryOption {
    id: string;
    label: string;
    color: string;
}

const DEFAULT_CATEGORIES: CategoryOption[] = [
    { id: 'VIAGEM', label: 'Viagem', color: 'bg-blue-600' },
    { id: 'CASA', label: 'Casa', color: 'bg-green-600' },
    { id: 'EXPERIENCIA', label: 'Experiência', color: 'bg-purple-600' },
    { id: 'OUTROS', label: 'Outros', color: 'bg-gray-600' },
];

export default function ListDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [list, setList] = useState<GiftList | null>(null);

    // Form State
    const [editingGiftId, setEditingGiftId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState('OUTROS');
    const [customCategoryInput, setCustomCategoryInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Dynamic Categories State
    const [availableCategories, setAvailableCategories] = useState<CategoryOption[]>(DEFAULT_CATEGORIES);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();

    // Sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarTitle, setSidebarTitle] = useState('');
    const [sidebarDescription, setSidebarDescription] = useState('');
    const [sidebarSlug, setSidebarSlug] = useState('');
    const [sidebarEventDate, setSidebarEventDate] = useState('');
    const [sidebarEventType, setSidebarEventType] = useState('');
    const [sidebarPrivate, setSidebarPrivate] = useState(false);
    const [sidebarSaving, setSidebarSaving] = useState(false);

    // Quota state
    const [quotaCount, setQuotaCount] = useState(1);
    const [quotaDetails, setQuotaDetails] = useState({ base: 0, last: 0, showDetails: false });

    const fetchList = async () => {
        try {
            const { data } = await api.get(`/lists/${id}`);
            setList(data);

            // Extract custom categories from existing gifts
            const usedCategories = new Set(data.gifts.map((g: Gift) => g.category).filter(Boolean));
            const newCategories = [...DEFAULT_CATEGORIES];

            usedCategories.forEach((catId: string) => {
                const exists = newCategories.some(c => c.id === catId);
                if (!exists) {
                    // Try to format it nicely if it looks like a custom ID, otherwise just use it
                    newCategories.push({
                        id: catId,
                        label: catId, // You might want to capitalize this
                        color: 'bg-orange-400' // Default color for custom
                    });
                }
            });
            setAvailableCategories(newCategories);

        } catch (err) {
            console.error('Error fetching list:', err);
        }
    };

    useEffect(() => {
        if (id) fetchList();
    }, [id]);

    // Quota Calculation
    useEffect(() => {
        const numericPrice = parseFloat(price) || 0;
        const count = Math.max(1, Math.min(quotaCount, 100)); // Limit quotas to 100 for sanity

        if (numericPrice > 0) {
            // Logic: Base value is floor(total / count * 100) / 100
            // Remainder added to last quota
            const totalCents = Math.round(numericPrice * 100);
            const baseCents = Math.floor(totalCents / count);
            const remainderCents = totalCents - (baseCents * count);

            const baseValue = baseCents / 100;
            const lastValue = (baseCents + remainderCents) / 100;

            setQuotaDetails({
                base: baseValue,
                last: lastValue,
                showDetails: remainderCents !== 0
            });
        } else {
            setQuotaDetails({ base: 0, last: 0, showDetails: false });
        }
    }, [price, quotaCount]);

    const handleSaveGift = async (e: React.FormEvent) => {
        e.preventDefault();

        // Max Value Validation
        const numericPrice = parseFloat(price);
        if (numericPrice > 999999) {
            alert("O valor máximo para um presente é de R$ 999.999,00");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                name,
                description,
                price: numericPrice,
                imageUrl: imageUrl || undefined,
                category,
                // You might want to save quota info in description or a new field if backend supported it
                // For now, quotas are just a display calculation for the "idea" of the gift
            };

            if (editingGiftId) {
                await api.put(`/gifts/${editingGiftId}`, payload);
            } else {
                await api.post(`/lists/${id}/gifts`, payload);
            }
            resetForm();
            fetchList();
        } catch (err) {
            alert('Failed to save gift.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomCategory = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = customCategoryInput.trim();
            if (!val) return;

            // Check duplicate
            const exists = availableCategories.find(c => c.label.toLowerCase() === val.toLowerCase());
            if (exists) {
                setCategory(exists.id);
            } else {
                const newCat = { id: val, label: val, color: 'bg-indigo-500' };
                setAvailableCategories([...availableCategories, newCat]);
                setCategory(val);
            }
            setCustomCategoryInput('');
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setPrice('');
        setImageUrl('');
        setCategory('OUTROS');
        setEditingGiftId(null);
        setQuotaCount(1);
    };

    const deleteGift = async (e: React.MouseEvent, giftId: string) => {
        e.stopPropagation();
        if (!confirm('Tem certeza que deseja remover este presente?')) return;
        try {
            await api.delete(`/gifts/${giftId}`);
            if (editingGiftId === giftId) resetForm();
            fetchList();
        } catch (err) {
            console.error(err);
            alert('Falha ao excluir o presente.');
        }
    };

    const startEditing = (e: React.MouseEvent, gift: Gift) => {
        e.stopPropagation();
        setEditingGiftId(gift.id);
        setName(gift.name);
        setDescription(gift.description || '');
        setPrice(gift.price.toString());
        setImageUrl(gift.imageUrl || '');
        setCategory(gift.category || 'OUTROS');

        // Guess quota count (heuristic: if price > 100, maybe it was split?)
        // Since we don't store quota count, we reset to 1 or calculate a smart default
        const p = Number(gift.price);
        if (p > 0) setQuotaCount(Math.max(1, Math.round(p / 100)));
        else setQuotaCount(1);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const togglePrivacy = async () => {
        if (!list) return;
        try {
            const newPrivacy = !list.isPrivate;
            setList({ ...list, isPrivate: newPrivacy });
            await api.patch(`/lists/${list.id}`, { isPrivate: newPrivacy });
        } catch (err) {
            console.error(err);
            if (list) setList({ ...list, isPrivate: !list.isPrivate });
            alert('Failed to update privacy settings.');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Sidebar handlers
    const openSidebar = () => {
        if (!list) return;
        setSidebarTitle(list.title);
        setSidebarDescription(list.description || '');
        setSidebarSlug(list.slug);
        setSidebarEventDate(list.eventDate ? list.eventDate.substring(0, 10) : '');
        setSidebarEventType(list.eventType || '');
        setSidebarPrivate(list.isPrivate);
        setSidebarOpen(true);
    };

    const handleSidebarSave = async () => {
        if (!list) return;
        setSidebarSaving(true);
        try {
            const payload: any = {
                title: sidebarTitle,
                description: sidebarDescription,
                isPrivate: sidebarPrivate,
                eventDate: sidebarEventDate || undefined,
                eventType: sidebarEventType || undefined,
            };
            await api.patch(`/lists/${list.id}`, payload);
            setList({
                ...list,
                title: sidebarTitle,
                description: sidebarDescription,
                isPrivate: sidebarPrivate,
                eventDate: sidebarEventDate || undefined,
                eventType: sidebarEventType || undefined,
            });
            setSidebarOpen(false);
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar alterações.');
        } finally {
            setSidebarSaving(false);
        }
    };

    if (!list) return <div className="min-h-screen flex items-center justify-center text-orange-600 animate-pulse">Carregando painel...</div>;

    const totalRaised = list.gifts.reduce((acc, gift) => {
        const isReserved = gift.status !== 'AVAILABLE';
        return acc + (isReserved ? Number(gift.price) * 0.3 : 0);
    }, 0);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
            />

            {/* Top Header */}
            <header className="bg-white border-b border-gray-100 px-6 py-3 sticky top-0 z-20 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <Link to="/dashboard">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm cursor-pointer hover:bg-orange-600 transition-colors">
                            L
                        </div>
                    </Link>
                    <span className="font-bold text-gray-800 text-lg tracking-tight">Listly</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-gray-600 border-gray-200 hover:bg-gray-50"
                        onClick={openSidebar}
                    >
                        <Settings className="w-4 h-4" />
                        <span className="hidden sm:inline">Configurações</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50" 
                        asChild
                    >
                        <Link to={`/public/${list.slug}`} target="_blank">
                            <Share2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Compartilhar</span>
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Sub Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-8">
                <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Painel de Controle</h1>
                        <p className="text-gray-500 text-sm">Adicione itens, acompanhe contribuições e personalize sua lista de desejos no Listly.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm">
                        <span className="text-xs font-medium text-gray-500">Privacidade da Lista:</span>
                        <div
                            className="flex items-center gap-2 cursor-pointer select-none"
                            onClick={togglePrivacy}
                        >
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${list.isPrivate ? 'bg-gray-300' : 'bg-orange-500'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${list.isPrivate ? 'left-0.5' : 'right-0.5'}`}></div>
                            </div>
                            <span className={`text-xs font-bold ${list.isPrivate ? 'text-gray-500' : 'text-orange-600'}`}>
                                {list.isPrivate ? 'Privada' : 'Pública'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Sidebar - Add/Edit Gift */}
                <div className="lg:col-span-4 space-y-6">
                    <div className={`bg-white rounded-2xl shadow-sm border p-6 sticky top-24 transition-colors ${editingGiftId ? 'border-orange-200 ring-1 ring-orange-100' : 'border-gray-100'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <div className="bg-orange-100 p-1 rounded-full">
                                    {editingGiftId ? <Edit2 className="w-4 h-4 text-orange-600" /> : <Plus className="w-4 h-4 text-orange-600" />}
                                </div>
                                {editingGiftId ? 'Editar Presente' : 'Adicionar Novo Presente'}
                            </h2>
                            {editingGiftId && (
                                <Button variant="ghost" size="sm" onClick={resetForm} className="text-xs text-red-500 hover:text-red-700 h-6">
                                    Cancelar
                                </Button>
                            )}
                        </div>

                        <form onSubmit={handleSaveGift} className="space-y-5">

                            {/* Image Upload Area */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Enviar Foto</label>
                                <div
                                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-center hover:bg-gray-50 hover:border-orange-300 transition-colors bg-gray-50/30 h-[140px] relative group cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imageUrl ? (
                                        <>
                                            <img src={imageUrl} alt="Preview" className="w-full h-full object-contain rounded opacity-80" />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setImageUrl(''); }}
                                                className="absolute top-2 right-2 bg-white shadow-md text-gray-500 p-1 rounded-full hover:text-red-500 z-10"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center group-hover:bg-orange-100 group-hover:text-orange-500 transition-colors">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-xs">Arraste e solte ou <span className="text-orange-600 underline">procure</span></p>
                                                <p className="text-[10px] text-gray-400 mt-1">JPG, PNG até 5MB</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <Input
                                    placeholder="Ou cole URL aqui"
                                    value={imageUrl}
                                    onChange={e => setImageUrl(e.target.value)}
                                    className="mt-2 text-xs border-none bg-transparent text-center focus:ring-0 text-gray-400 placeholder:text-gray-300"
                                />
                            </div>

                            {/* Inputs */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Nome do Presente</label>
                                <Input
                                    placeholder="ex: Jantar de Lua de Mel"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    className="h-10 bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500/20 transition-all rounded-lg"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Valor Total (R$)</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        required
                                        className={`h-10 bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500/20 transition-all rounded-lg ${parseFloat(price) > 999999 ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                    />
                                    {parseFloat(price) > 999999 && (
                                        <p className="text-[10px] text-red-500 font-bold">O valor máximo permitido é R$ 999.999,00</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Qtde. Cotas</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={quotaCount}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setQuotaCount(val === '' ? '' : parseInt(val));
                                        }}
                                        onBlur={() => {
                                            if (!quotaCount || quotaCount === '' || (typeof quotaCount === 'number' && quotaCount < 1)) setQuotaCount(1);
                                        }}
                                        className={`h-10 bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500/20 transition-all rounded-lg ${(typeof quotaCount === 'number' && quotaCount > 30) ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                    />
                                    {(typeof quotaCount === 'number' && quotaCount > 30) && (
                                        <p className="text-[10px] text-red-500 font-bold">O máximo de cotas é 30</p>
                                    )}
                                </div>
                            </div>

                            {/* Quota System Box */}
                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3">
                                <div className="flex gap-2 items-start">
                                    <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-blue-900 text-xs">Simulação de Parcelas</h4>
                                        <p className="text-[10px] text-blue-700 leading-tight mt-1">
                                            Divisão sugerida para pagamento via PIX.
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg border border-blue-100 p-2 px-4 shadow-sm">
                                    {quotaDetails.showDetails ? (
                                        <div className="text-xs text-gray-700">
                                            <div className="flex justify-between">
                                                <span>{quotaCount - 1}x de:</span>
                                                <span className="font-bold text-orange-600">R$ {quotaDetails.base.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between border-t border-gray-100 mt-1 pt-1">
                                                <span>+ 1x de:</span>
                                                <span className="font-bold text-orange-600">R$ {quotaDetails.last.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 font-medium">Parcela Única:</span>
                                            <span className="text-sm font-bold text-orange-600">
                                                {quotaCount}x R$ {quotaDetails.base.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Category Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Categoria</label>

                                <Input
                                    placeholder="Digite nova categoria e tecle Enter..."
                                    value={customCategoryInput}
                                    onChange={e => setCustomCategoryInput(e.target.value)}
                                    onKeyDown={handleAddCustomCategory}
                                    className="mb-2 h-9 text-xs"
                                />

                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                                    {availableCategories.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategory(cat.id)}
                                            className={`text-xs p-2 rounded-lg border transition-all text-left flex items-center gap-2 ${category === cat.id ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${cat.color || 'bg-gray-400'}`}></div>
                                            <span className="truncate">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Descrição</label>
                                <Textarea
                                    placeholder="Conte aos convidados por que este presente é especial..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="min-h-[100px] bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500/20 transition-all rounded-lg resize-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-11 rounded-lg shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Salvando...' : (
                                    editingGiftId ? <><Edit2 className="w-4 h-4" /> Salvar Alterações</> : <><Plus className="w-4 h-4" /> Adicionar à Lista</>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Right Content - Stats & Grid */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Stats Header */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="bg-orange-50 rounded-xl p-4 min-w-[160px] border border-orange-100">
                                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Arrecadado</p>
                                <p className="text-2xl font-bold text-orange-600">R$ {totalRaised.toFixed(2)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 min-w-[160px] border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Meus Presentes</p>
                                <p className="text-2xl font-bold text-gray-800">{list.gifts.length} Itens</p>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 text-sm text-gray-600 shadow-sm cursor-pointer hover:border-gray-300">
                            <span>Ordenar: Mais Recentes</span>
                        </div>
                    </div>

                    {/* Empty State */}
                    {list.gifts.length === 0 && (
                        <div className="bg-white border border-dashed border-gray-200 rounded-2xl h-[400px] flex flex-col items-center justify-center text-gray-400">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <GiftIcon className="w-8 h-8 opacity-30" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Sua lista está vazia</h3>
                            <p className="max-w-xs text-center text-sm mt-2">Adicione seu primeiro presente usando o painel ao lado para começar a receber contribuições.</p>
                        </div>
                    )}

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {list.gifts.map((gift) => {
                            const isReserved = gift.status !== 'AVAILABLE';
                            const raised = isReserved ? Number(gift.price) * 0.3 : 0; // Simulated raised %
                            const percent = (raised / Number(gift.price)) * 100;

                            // Find category label
                            const defaultCat = availableCategories.find(c => c.id === gift.category);
                            const categoryLabel = defaultCat ? defaultCat.label : (gift.category || 'Outros');

                            return (
                                <Card key={gift.id} className={`group border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white ${editingGiftId === gift.id ? 'ring-2 ring-orange-500' : ''}`}>
                                    <div className="h-48 relative overflow-hidden bg-gray-100">
                                        {gift.imageUrl ? (
                                            <img src={gift.imageUrl} alt={gift.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <ImageIcon className="w-10 h-10" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* Overlay Controls */}
                                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-[-10px] group-hover:translate-y-0 duration-300 z-10">
                                            <button
                                                onClick={(e) => startEditing(e, gift)}
                                                className="bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => deleteGift(e, gift.id)}
                                                className="bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded font-medium">
                                            {categoryLabel}
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-1 flex-1 mr-2">{gift.name}</h3>
                                            <div className="text-right">
                                                <span className="block font-bold text-gray-900">R$ {Number(gift.price).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-500 line-clamp-2 h-8 leading-relaxed mb-4">
                                            {gift.description || "Ajude-nos a realizar este sonho! Qualquer contribuição é bem-vinda."}
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide">
                                                <span className="text-orange-500">Arrecadado: R$ {raised.toLocaleString('pt-BR')}</span>
                                                <span className="text-gray-400">Meta: R$ {Number(gift.price).toLocaleString('pt-BR')}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full transition-all duration-1000"
                                                    style={{ width: `${percent > 10 ? percent : 10}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Settings Sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="right" className="flex flex-col overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Configurações da Lista</SheetTitle>
                        <SheetDescription>Edite as informações do seu evento.</SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 px-6 py-4 space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nome do Evento</label>
                            <Input
                                value={sidebarTitle}
                                onChange={(e) => setSidebarTitle(e.target.value)}
                                placeholder="Ex: Casamento de Carol e André"
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors h-11"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Descrição</label>
                            <Textarea
                                value={sidebarDescription}
                                onChange={(e) => setSidebarDescription(e.target.value)}
                                placeholder="Descreva o seu evento..."
                                rows={3}
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors resize-none"
                            />
                        </div>

                        {/* Slug (read-only) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Link Personalizado</label>
                            <div className="flex items-center">
                                <span className="text-sm text-gray-400 bg-gray-50 px-3 py-2.5 rounded-l-md border border-r-0 border-gray-200">listly.com/</span>
                                <Input
                                    value={sidebarSlug}
                                    disabled
                                    className="rounded-l-none h-11 bg-gray-100 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-gray-400">O link não pode ser alterado após a criação.</p>
                        </div>

                        {/* Event Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Tipo do Evento</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'CASAMENTO', label: 'Casamento' },
                                    { id: 'CHA_CASA_NOVA', label: 'Chá de Casa Nova' },
                                    { id: 'CHA_DE_BEBE', label: 'Chá de Bebê' },
                                    { id: 'ANIVERSARIO', label: 'Aniversário' },
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setSidebarEventType(type.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${sidebarEventType === type.id
                                            ? 'bg-orange-500 text-white border-orange-500'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Event Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-orange-500" />
                                Data do Evento
                            </label>
                            <Input
                                type="date"
                                value={sidebarEventDate}
                                onChange={(e) => setSidebarEventDate(e.target.value)}
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors h-11"
                            />
                        </div>

                        {/* Privacy Toggle */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Privacidade</label>
                            <div
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => setSidebarPrivate(!sidebarPrivate)}
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {sidebarPrivate ? 'Lista Privada' : 'Lista Pública'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {sidebarPrivate ? 'Apenas você pode ver esta lista.' : 'Qualquer pessoa com o link pode acessar.'}
                                    </p>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${sidebarPrivate ? 'bg-gray-300' : 'bg-orange-500'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${sidebarPrivate ? 'left-0.5' : 'right-0.5'}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-gray-100 px-6 py-4 flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setSidebarOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={handleSidebarSave}
                            disabled={sidebarSaving}
                        >
                            {sidebarSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
