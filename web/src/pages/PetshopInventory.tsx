import React, { useState, useEffect } from 'react';
import {
    Package,
    Plus,
    Search,
    Filter,
    AlertTriangle,
    Edit3,
    Trash2,
    ChevronDown,
    Save,
    X,
    TrendingUp,
    DollarSign,
    Activity,
    ClipboardList,
    History
} from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Product {
    id: number;
    name: string;
    description: string | null;
    sku: string | null;
    category: string | null;
    stock: number;
    minStock: number;
    costPrice: number | null;
    salePrice: number;
    expiry: string | null;
    imageUrl: string | null;
}

interface StockMovement {
    id: number;
    type: string;
    quantity: number;
    reason: string | null;
    createdAt: string;
    user: { name: string } | null;
}

const PetshopInventory = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todos');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyData, setHistoryData] = useState<StockMovement[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        sku: '',
        category: 'Geral',
        stock: 0,
        minStock: 5,
        costPrice: 0,
        salePrice: 0,
        expiry: '',
        imageUrl: ''
    });

    const categories = ['Todos', 'Alimento', 'Higiene', 'Farma', 'Acessório', 'Brinquedo', 'Geral'];

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/products`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (e) {
            console.error('Error fetching products:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingProduct
            ? `${API_BASE_URL}/api/products/${editingProduct.id}`
            : `${API_BASE_URL}/api/products`;
        const method = editingProduct ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowModal(false);
                setEditingProduct(null);
                resetForm();
                fetchProducts();
            }
        } catch (e) {
            console.error('Error saving product:', e);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            sku: '',
            category: 'Geral',
            stock: 0,
            minStock: 5,
            costPrice: 0,
            salePrice: 0,
            expiry: '',
            imageUrl: ''
        });
    };

    const openEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            sku: product.sku || '',
            category: product.category || 'Geral',
            stock: product.stock,
            minStock: product.minStock,
            costPrice: product.costPrice || 0,
            salePrice: product.salePrice,
            expiry: product.expiry?.split('T')[0] || '',
            imageUrl: product.imageUrl || ''
        });
        setShowModal(true);
    };

    const filteredProducts = products.filter(p => {
        // Special filter for low stock dashboard click
        if (searchTerm === 'alert:lowstock') {
            return p.stock <= p.minStock;
        }

        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = categoryFilter === 'Todos' || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleViewHistory = async (product: Product) => {
        setSelectedProduct(product);
        try {
            const res = await fetch(`${API_BASE_URL}/api/products/${product.id}/history`);
            if (res.ok) {
                const data = await res.json();
                setHistoryData(data);
                setShowHistoryModal(true);
            }
        } catch (e) {
            console.error('Error fetching history:', e);
            alert('Erro ao carregar histórico');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchProducts();
            } else {
                alert('Erro ao excluir produto');
            }
        } catch (e) {
            console.error('Error deleting product:', e);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Estoque & Inventário</h2>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-1">Gestão de produtos e controle de ruptura</p>
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                    <button
                        onClick={() => { setSearchTerm(''); setCategoryFilter('Todos'); }}
                        className="bg-white text-slate-500 px-4 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] border border-slate-100 hover:bg-slate-50 transition-all shadow-sm w-full md:w-auto"
                    >
                        Limpar Filtros
                    </button>
                    <button
                        onClick={() => { resetForm(); setEditingProduct(null); setShowModal(true); }}
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95 w-full md:w-auto"
                    >
                        <Plus className="w-4 h-4 text-emerald-400" />
                        Novo Produto
                    </button>
                </div>
            </header>

            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm flex flex-col justify-between group hover:border-indigo-100 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <Package className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Total Itens</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 mt-4 tracking-tight">{products.length}</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Produtos Cadastrados</p>
                    </div>
                </div>

                <div
                    onClick={() => { setCategoryFilter('Todos'); setSearchTerm('alert:lowstock'); }}
                    className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm flex flex-col justify-between group hover:border-red-100 transition-colors cursor-pointer relative overflow-hidden"
                >
                    <div className="absolute right-0 top-0 p-6 opacity-5">
                        <AlertTriangle className="w-24 h-24 text-red-500" />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                        <div className="p-3 bg-red-50 text-red-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-red-300">Reposição</span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black text-slate-800 mt-4 tracking-tight">
                            {products.filter(p => p.stock <= p.minStock).length}
                        </h3>
                        <p className="text-[10px] font-bold text-red-400 mt-1 uppercase tracking-wider flex items-center gap-1">
                            Abaixo do Mínimo <ChevronDown className="w-3 h-3" />
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm flex flex-col justify-between group hover:border-emerald-100 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Valor em Estoque</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 mt-4 tracking-tight">
                            {(products.reduce((acc, p) => acc + (p.stock * p.salePrice), 0) / 1000).toFixed(1)}k
                        </h3>
                        <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-wider">
                            R$ {products.reduce((acc, p) => acc + (p.stock * p.salePrice), 0).toFixed(2)}
                        </p>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl shadow-slate-900/10 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent" />
                    <div className="flex justify-between items-start relative z-10">
                        <div className="p-3 bg-white/10 text-white rounded-2xl">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Saúde do Estoque</span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black text-white mt-4 tracking-tight">
                            {products.length > 0 ? Math.round(((products.length - products.filter(p => p.stock <= p.minStock).length) / products.length) * 100) : 0}%
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Produtos Saudáveis</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 relative">
                    <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou SKU..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] text-[13px] font-bold text-slate-700 focus:outline-none focus:ring-8 focus:ring-slate-900/5 focus:border-slate-900/20 shadow-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <select
                        className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] text-[12px] font-black uppercase tracking-widest text-slate-500 appearance-none focus:outline-none shadow-sm cursor-pointer"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 overflow-hidden relative">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="w-5 h-5" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{product.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 tracking-widest">SKU: {product.sku || 'N/A'}</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-slate-100/50 text-[9px] font-black text-slate-500 rounded-lg uppercase tracking-widest">
                                {product.category || 'Geral'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-50">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Estoque</span>
                                <div className="flex items-center space-x-2">
                                    <span className={`text-lg font-black tabular-nums ${product.stock <= product.minStock ? 'text-red-500' : 'text-slate-600'}`}>
                                        {product.stock}
                                    </span>
                                    {product.stock <= product.minStock && (
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                    )}
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-50">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Preço</span>
                                <span className="text-lg font-black text-slate-800 tabular-nums">
                                    R$ {product.salePrice.toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleViewHistory(product)}
                                className="flex-1 py-3 text-slate-400 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all flex items-center justify-center font-bold text-[10px] uppercase tracking-wider"
                            >
                                <History className="w-4 h-4 mr-2" /> Histórico
                            </button>
                            <button
                                onClick={() => openEdit(product)}
                                className="flex-1 py-3 text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all flex items-center justify-center font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-slate-900/10"
                            >
                                <Edit3 className="w-4 h-4 mr-2" /> Editar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-50">
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estoque</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço Venda</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-6 text-left">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 overflow-hidden relative">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{product.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 tracking-widest">SKU: {product.sku || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-left">
                                        <span className="px-3 py-1 bg-slate-100/50 text-[9px] font-black text-slate-500 rounded-lg uppercase tracking-widest">
                                            {product.category || 'Geral'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-left">
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-[12px] font-black tabular-nums ${product.stock <= product.minStock ? 'text-red-500' : 'text-slate-600'}`}>
                                                {product.stock}
                                            </span>
                                            {product.stock <= product.minStock && (
                                                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-left">
                                        <p className="text-[12px] font-black text-slate-800 tabular-nums">
                                            R$ {product.salePrice.toFixed(2).replace('.', ',')}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleViewHistory(product)}
                                                className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                title="Histórico de Movimentação"
                                            >
                                                <History className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openEdit(product)}
                                                className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                title="Editar"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center text-slate-300">
                                        <Package className="w-8 h-8 mx-auto mb-4 opacity-20" />
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em]">Nenhum produto encontrado</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <header className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em]">
                                {editingProduct ? 'Editar Produto' : 'Cadastrar Produto'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-indigo-400" />
                            </button>
                        </header>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome do Produto</label>
                                    <input
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-600/30 transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex justify-between">
                                        SKU / Código
                                        <span className="text-indigo-400 text-[8px]">Automático se vazio</span>
                                    </label>
                                    <input
                                        placeholder="Ex: PRD-001"
                                        className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-600/30 transition-all font-mono"
                                        value={formData.sku}
                                        onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Categoria</label>
                                    <select
                                        className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-600/30 transition-all"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Estoque</label>
                                        <input
                                            type="number"
                                            className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-600/30 transition-all tabular-nums"
                                            value={formData.stock}
                                            onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Estoque Mín</label>
                                        <input
                                            type="number"
                                            className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-600/30 transition-all tabular-nums"
                                            value={formData.minStock}
                                            onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Preço de Custo</label>
                                    <input
                                        type="number" step="0.01"
                                        className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-600/30 transition-all tabular-nums"
                                        value={formData.costPrice}
                                        onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 text-indigo-600">Preço de Venda</label>
                                    <input
                                        type="number" step="0.01"
                                        className="w-full px-6 py-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl text-[13px] font-black text-indigo-700 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all tabular-nums"
                                        value={formData.salePrice}
                                        onChange={e => setFormData({ ...formData, salePrice: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="border-t border-slate-100 relative my-6">
                                <span className="absolute -top-3 left-0 bg-white pr-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                    Módulo Fiscal (NF-e)
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">NCM</label>
                                    <input
                                        placeholder="Ex: 9603.90.00"
                                        className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-600/30 transition-all tabular-nums"
                                        value={(formData as any).ncm || ''}
                                        onChange={e => setFormData({ ...formData, ncm: e.target.value } as any)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">CFOP</label>
                                    <input
                                        placeholder="Ex: 5102"
                                        className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-600/30 transition-all tabular-nums"
                                        value={(formData as any).cfop || ''}
                                        onChange={e => setFormData({ ...formData, cfop: e.target.value } as any)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Imposto Aprox.</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-4 text-slate-400 font-bold text-xs">%</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full pl-10 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-600/30 transition-all tabular-nums"
                                            value={(formData as any).taxRate || ''}
                                            onChange={e => setFormData({ ...formData, taxRate: parseFloat(e.target.value) } as any)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Validade</label>
                                <input
                                    type="date"
                                    className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-600/30 transition-all cursor-pointer"
                                    value={formData.expiry ? new Date(formData.expiry).toISOString().split('T')[0] : ''}
                                    onChange={e => setFormData({ ...formData, expiry: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Imagem do Produto</label>

                                {/* URL Input */}
                                <input
                                    placeholder="Cole a URL da imagem..."
                                    className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-600/30 transition-all"
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                />

                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">OU</span>
                                    <div className="flex-1 relative group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const formData = new FormData();
                                                    formData.append('image', file);
                                                    try {
                                                        // Visual feedback
                                                        const btn = document.getElementById('upload-btn-text');
                                                        if (btn) btn.innerText = 'Enviando...';

                                                        const res = await fetch(`${API_BASE_URL}/api/upload`, {
                                                            method: 'POST',
                                                            body: formData
                                                        });
                                                        if (res.ok) {
                                                            const data = await res.json();
                                                            setFormData(prev => ({ ...prev, imageUrl: data.url }));
                                                        } else {
                                                            alert('Erro ao enviar imagem');
                                                        }
                                                    } catch (error) {
                                                        console.error('Upload Error:', error);
                                                        alert('Erro ao enviar imagem');
                                                    } finally {
                                                        const btn = document.getElementById('upload-btn-text');
                                                        if (btn) btn.innerText = 'Carregar do Dispositivo / Câmera';
                                                    }
                                                }
                                            }}
                                        />
                                        <div className="w-full px-6 py-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-2xl flex items-center justify-center gap-3 transition-colors cursor-pointer">
                                            <div className="p-2 bg-indigo-200 text-indigo-700 rounded-full">
                                                <Edit3 className="w-4 h-4" />
                                            </div>
                                            <span id="upload-btn-text" className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Carregar do Dispositivo / Câmera</span>
                                        </div>
                                    </div>
                                </div>

                                {formData.imageUrl && (
                                    <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                                        <img src={formData.imageUrl} alt="Preview" className="w-16 h-16 rounded-xl object-cover bg-white shadow-sm" />
                                        <div>
                                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Imagem Definida</p>
                                            <p className="text-[9px] font-bold text-slate-400 mt-1 truncate max-w-[200px]">{formData.imageUrl}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                            className="ml-auto p-2 bg-white text-red-500 rounded-xl shadow-sm hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>


                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] text-white bg-slate-900 shadow-xl shadow-slate-900/10 hover:bg-slate-800 flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <Save className="w-4 h-4 text-emerald-400" />
                                    {editingProduct ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {
                showHistoryModal && selectedProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)} />
                        <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                            <header className="p-8 bg-slate-900 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em]">Histórico de Movimentação</h3>
                                    <p className="text-xs text-slate-400 mt-1">{selectedProduct.name}</p>
                                </div>
                                <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-indigo-400" />
                                </button>
                            </header>
                            <div className="p-8 max-h-[60vh] overflow-y-auto">
                                {historyData.length === 0 ? (
                                    <p className="text-center text-slate-400 font-bold">Nenhum registro encontrado.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {historyData.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'ENTRY' ? 'bg-emerald-100 text-emerald-600' :
                                                        item.type === 'EXIT' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                                        }`}>
                                                        {item.type === 'ENTRY' ? <Plus className="w-5 h-5" /> : <TrendingUp className="w-5 h-5 rotate-180" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-wider text-slate-700">
                                                            {item.type === 'ENTRY' ? 'Entrada' : item.type === 'EXIT' ? 'Saída' : 'Ajuste'}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-400">
                                                            {new Date(item.createdAt).toLocaleDateString()} às {new Date(item.createdAt).toLocaleTimeString()}
                                                        </p>
                                                        {item.user && <p className="text-[9px] text-indigo-400 font-bold mt-0.5">Por: {item.user.name}</p>}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-lg font-black tabular-nums ${item.type === 'ENTRY' ? 'text-emerald-600' : 'text-red-600'
                                                        }`}>
                                                        {item.type === 'ENTRY' ? '+' : '-'}{item.quantity}
                                                    </p>
                                                    {item.reason && <p className="text-[10px] text-slate-400">{item.reason}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default PetshopInventory;
