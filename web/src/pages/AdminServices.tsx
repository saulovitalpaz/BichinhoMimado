import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Edit3,
    Trash2,
    DollarSign,
    Clock,
    Tag,
    X,
    CheckCircle,
    LayoutGrid,
    Check,
    AlertCircle
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const AdminServices = () => {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<any | null>(null);

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        duration: 30,
        category: 'Petshop',
        active: true
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/services`);
            if (res.ok) {
                setServices(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (service: any) => {
        setEditingService(service);
        setForm({
            name: service.name,
            description: service.description || '',
            price: service.price.toString(),
            duration: service.duration,
            category: service.category,
            active: service.active
        });
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingService(null);
        setForm({
            name: '',
            description: '',
            price: '',
            duration: 30,
            category: 'Petshop',
            active: true
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingService
                ? `${API_BASE_URL}/api/services/${editingService.id}`
                : `${API_BASE_URL}/api/services`;

            const method = editingService ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    price: parseFloat(form.price),
                    duration: parseInt(form.duration.toString())
                })
            });

            if (res.ok) {
                setShowModal(false);
                fetchServices();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const toggleStatus = async (service: any) => {
        // Optimistic update
        const updatedServices = services.map(s =>
            s.id === service.id ? { ...s, active: !s.active } : s
        );
        setServices(updatedServices);

        try {
            await fetch(`${API_BASE_URL}/api/services/${service.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !service.active })
            });
        } catch (e) {
            console.error(e);
            fetchServices(); // Revert on error
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Gestão de Serviços</h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Configuração de Preços e Categorias</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Novo Serviço
                </button>
            </header>

            {/* Filters */}
            <div className="bg-white p-2 rounded-[2rem] border border-slate-50 shadow-sm flex items-center gap-2">
                <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Buscar serviço..."
                        className="w-full pl-14 pr-6 py-4 bg-transparent text-[13px] font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredServices.map(service => (
                    <div
                        key={service.id}
                        className={`bg-white rounded-[2.5rem] p-6 border transition-all hover:shadow-lg group relative ${service.active ? 'border-slate-50 shadow-sm' : 'border-slate-100 opacity-60 bg-slate-50'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${service.category === 'Clinical' ? 'bg-emerald-50 text-emerald-600' : 'bg-pink-50 text-pink-500'
                                }`}>
                                {service.category}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(service)}
                                    className="p-2 hover:bg-indigo-50 text-slate-300 hover:text-indigo-600 rounded-full transition-colors"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">{service.name}</h3>
                        <p className="text-slate-400 text-[11px] font-medium leading-relaxed mb-6 line-clamp-2 h-8">
                            {service.description || 'Sem descrição definida.'}
                        </p>

                        <div className="space-y-3 border-t border-slate-50 pt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> Duração
                                </span>
                                <span className="text-[11px] font-black text-slate-700">{service.duration} min</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <DollarSign className="w-3 h-3" /> Preço
                                </span>
                                <span className="text-lg font-black text-indigo-600">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${service.active ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {service.active ? 'Ativo' : 'Inativo'}
                            </span>
                            <button
                                onClick={() => toggleStatus(service)}
                                className={`w-10 h-6 rounded-full transition-colors relative flex items-center ${service.active ? 'bg-emerald-400' : 'bg-slate-200'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute transition-all ${service.active ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Create Card (Empty State) */}
                <button
                    onClick={handleCreate}
                    className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-slate-300 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/10 transition-all group min-h-[300px]"
                >
                    <div className="w-16 h-16 rounded-full bg-slate-50 group-hover:bg-indigo-100 flex items-center justify-center mb-4 transition-colors">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest">Adicionar Serviço</span>
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <header className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h3>
                                <p className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-widest">Preencha os dados abaixo</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-indigo-400" />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Nome do Serviço</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                        placeholder="Ex: Banho Completo"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Categoria</label>
                                        <select
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                            value={form.category}
                                            onChange={e => setForm({ ...form, category: e.target.value })}
                                        >
                                            <option value="Petshop">Petshop</option>
                                            <option value="Clinical">Clínica</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Duração (min)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                            value={form.duration}
                                            onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Preço (R$)</label>
                                    <div className="relative">
                                        <DollarSign className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                            placeholder="0.00"
                                            value={form.price}
                                            onChange={e => setForm({ ...form, price: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Descrição</label>
                                    <textarea
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-200 transition-all resize-none h-24"
                                        placeholder="Detalhes sobre o serviço..."
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <CheckCircle className="w-4 h-4 text-white/50" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{editingService ? 'Salvar Alterações' : 'Criar Serviço'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServices;
