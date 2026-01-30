import React, { useState, useEffect } from 'react';
import {
    Plus,
    Clock,
    Truck,
    Bath,
    Scissors,
    Grid,
    ChevronRight,
    Search,
    User,
    Save,
    X,
    Dog,
    CreditCard,
    Edit3,
    MoreHorizontal,
    CheckCircle2
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';

const Petshop = () => {
    const [viewMode, setViewMode] = useState('kanban');
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAppt, setEditingAppt] = useState<any | null>(null);

    // Form States
    const [petSearch, setPetSearch] = useState('');
    const [pets, setPets] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [selectedPet, setSelectedPet] = useState<any | null>(null);
    const [service, setService] = useState('');
    const [price, setPrice] = useState('50.00');
    const [groomer, setGroomer] = useState('');
    const [status, setStatus] = useState('Aguardando');

    const columns = [
        { id: 'Aguardando', label: 'Aguardando', color: 'bg-slate-100 text-slate-500', progress: 0 },
        { id: 'Banho', label: 'Em Banho', color: 'bg-indigo-50 text-indigo-600', progress: 25 },
        { id: 'Secagem', label: 'Secagem', color: 'bg-amber-50 text-amber-600', progress: 50 },
        { id: 'Tosa', label: 'Tosa', color: 'bg-purple-50 text-purple-600', progress: 75 },
        { id: 'Pronto', label: 'Pronto/Retirada', color: 'bg-emerald-50 text-emerald-600', progress: 100 }
    ];

    const fetchAppointments = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/appointments`);
            if (res.ok) {
                const data = await res.json();
                // Filter only Petshop services that are not already completed (billed)
                setAppointments(data.filter((a: any) => a.type === 'Petshop' && a.status !== 'COMPLETED'));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/services`);
            if (res.ok) {
                setServices(await res.json());
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchAppointments();
        fetchServices();
    }, []);

    const advanceStatus = async (appointment: any) => {
        const currentStatus = appointment.petshopStatus || 'Aguardando';
        const idx = columns.findIndex(c => c.id === currentStatus);
        const next = columns[idx + 1]?.id;

        if (!next) return;
        updateAppointmentStatus(appointment.id, next);
    };

    const updateAppointmentStatus = async (id: number, newStatus: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ petshopStatus: newStatus })
            });

            if (res.ok) fetchAppointments();
        } catch (e) {
            console.error('Error updating status:', e);
        }
    };

    const searchPets = async (q: string) => {
        setPetSearch(q);
        if (q.length < 2) {
            setPets([]);
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/search?q=${q}`);
            if (res.ok) {
                const data = await res.json();
                setPets(data.filter((r: any) => r.type === 'pet'));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreateService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPet) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    petId: selectedPet.id,
                    type: 'Petshop',
                    service,
                    groomer,
                    price: parseFloat(price),
                    petshopStatus: 'Aguardando',
                    date: new Date().toISOString()
                })
            });

            if (res.ok) {
                setShowCreateModal(false);
                resetForm();
                fetchAppointments();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdateService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAppt) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/appointments/${editingAppt.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service,
                    groomer,
                    price: parseFloat(price),
                    petshopStatus: status
                })
            });

            if (res.ok) {
                setShowEditModal(false);
                setEditingAppt(null);
                resetForm();
                fetchAppointments();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const openEditModal = (appt: any) => {
        setEditingAppt(appt);
        setService(appt.service || '');
        setPrice(appt.price?.toString() || '0.00');
        setGroomer(appt.groomer || '');
        setStatus(appt.petshopStatus || 'Aguardando');
        setShowEditModal(true);
    };

    const resetForm = () => {
        setSelectedPet(null);
        setService('Banho');
        setPrice('50.00');
        setGroomer('');
        setStatus('Aguardando');
        setPetSearch('');
        setPets([]);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Estética & Banho</h2>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-1">Fluxo operacional e monitoramento de serviços</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                        <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Lista</button>
                        <button onClick={() => setViewMode('kanban')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Quadro</button>
                    </div>
                    <Link to="/petshop/monitor" className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95">
                        <Clock className="w-4 h-4" /> Monitor
                    </Link>
                    <button
                        onClick={() => { resetForm(); setShowCreateModal(true); }}
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Plus className="w-4 h-4 text-pink-400" />
                        Nova O.S
                    </button>
                </div>
            </header>

            <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar min-h-[600px]">
                {columns.map(col => {
                    const items = appointments.filter(a => (a.petshopStatus || 'Aguardando') === col.id);
                    return (
                        <div key={col.id} className="min-w-[320px] max-w-[320px] flex flex-col space-y-4">
                            <div className={`p-5 rounded-[1.5rem] ${col.color} border border-transparent shadow-sm flex justify-between items-center`}>
                                <span className="text-[10px] font-black uppercase tracking-[0.15em]">{col.label}</span>
                                <span className="bg-white/50 px-2.5 py-1 rounded-lg text-[9px] font-black">{items.length}</span>
                            </div>

                            <div className="flex-1 space-y-4">
                                {items.map(appt => (
                                    <div key={appt.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all group animate-in zoom-in-95 duration-300 relative">
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditModal(appt)} className="p-2 hover:bg-slate-50 text-slate-300 hover:text-indigo-600 rounded-xl transition-colors">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg font-black text-slate-300">
                                                {appt.pet?.name?.[0]}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-6">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="text-[14px] font-black text-slate-800 leading-none uppercase tracking-tight truncate flex-1">{appt.pet?.name}</h4>
                                                </div>
                                                <div className="flex justify-between items-center mt-1.5">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{appt.service}</p>
                                                    <span className="text-[10px] font-black text-slate-900 tabular-nums">R$ {appt.price?.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden mb-4">
                                            <div
                                                className={`h-full transition-all duration-1000 ease-out ${col.color.replace('text', 'bg').replace('50', '400')}`}
                                                style={{ width: `${col.progress}%` }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">Profissional</span>
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight mt-1 truncate max-w-[100px]">{appt.groomer || 'Pendente'}</span>
                                            </div>
                                            {col.id !== 'Pronto' ? (
                                                <button
                                                    onClick={() => advanceStatus(appt)}
                                                    className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95 group/btn"
                                                >
                                                    <ChevronRight className="w-4 h-4 group-active/btn:translate-x-0.5 transition-transform" />
                                                </button>
                                            ) : (
                                                <Link
                                                    to="/vendas"
                                                    state={{ appointmentId: appt.id }}
                                                    className="flex items-center space-x-2 px-3 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all text-[9px] font-black uppercase tracking-widest active:scale-95 shadow-lg shadow-emerald-200"
                                                >
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                    <span>Cobrar</span>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {items.length === 0 && (
                                    <div className="h-40 rounded-[2.5rem] border-2 border-dashed border-slate-50 flex flex-col items-center justify-center text-slate-200 space-y-2">
                                        <Grid className="w-6 h-6 opacity-20" />
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Vazio</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal Novo Serviço */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <header className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <Scissors className="w-5 h-5 text-pink-400" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Entrada de Animal (O.S)</h3>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-pink-400" />
                            </button>
                        </header>

                        <form onSubmit={handleCreateService} className="p-8 space-y-6">
                            <div className="space-y-4">
                                {/* Pet Selector */}
                                <div className="space-y-2 relative">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Paciente (Pet)</label>
                                    {selectedPet ? (
                                        <div className="flex items-center justify-between bg-pink-50 border border-pink-100 p-4 rounded-2xl animate-in fade-in duration-300">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-pink-100">
                                                    <Dog className="w-5 h-5 text-pink-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[12px] font-black text-pink-900 uppercase tracking-tight">{selectedPet.title}</p>
                                                    <p className="text-[9px] font-bold text-pink-400 uppercase tracking-widest">{selectedPet.subtitle}</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => setSelectedPet(null)} className="p-1 hover:bg-white rounded-lg transition-colors">
                                                <X className="w-4 h-4 text-pink-400" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <input
                                                type="text"
                                                placeholder="Buscar paciente para banho/tosa..."
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-pink-200 transition-all shadow-sm font-medium"
                                                value={petSearch}
                                                onChange={e => searchPets(e.target.value)}
                                            />
                                            {pets.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden py-2">
                                                    {pets.map(p => (
                                                        <button
                                                            key={p.id}
                                                            type="button"
                                                            onClick={() => { setSelectedPet(p); setPets([]); setPetSearch(''); }}
                                                            className="w-full px-6 py-3 flex flex-col items-start hover:bg-pink-50 transition-colors"
                                                        >
                                                            <span className="text-[12px] font-black text-slate-800 uppercase tracking-tight">{p.title}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.subtitle}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Serviço</label>
                                        <select
                                            className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-pink-200 transition-all shadow-sm"
                                            value={service}
                                            onChange={e => {
                                                const selected = services.find(s => s.name === e.target.value);
                                                setService(e.target.value);
                                                if (selected) setPrice(selected.price.toFixed(2));
                                            }}
                                        >
                                            <option value="">Selecione...</option>
                                            {services.map(s => (
                                                <option key={s.id} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Valor (R$)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-pink-200 transition-all shadow-sm"
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Groomer / Responsável</label>
                                    <input
                                        placeholder="Nome do esteticista..."
                                        className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-pink-200 transition-all shadow-sm"
                                        value={groomer}
                                        onChange={e => setGroomer(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!selectedPet}
                                className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${!selectedPet ? 'bg-slate-100 text-slate-300' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/10'
                                    }`}
                            >
                                <Save className="w-4 h-4 text-pink-400" />
                                Abrir Ordem de Serviço
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar Serviço */}
            {showEditModal && editingAppt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <header className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <Edit3 className="w-5 h-5 text-indigo-400" />
                                <div>
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Editar O.S.</h3>
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">{editingAppt.pet?.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-indigo-400" />
                            </button>
                        </header>

                        <form onSubmit={handleUpdateService} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Serviço</label>
                                        <select
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-200 transition-all shadow-sm"
                                            value={service}
                                            onChange={e => {
                                                const selected = services.find(s => s.name === e.target.value);
                                                setService(e.target.value);
                                                if (selected) setPrice(selected.price.toFixed(2));
                                            }}
                                        >
                                            {services.map(s => (
                                                <option key={s.id} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Valor (R$)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-200 transition-all shadow-sm"
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Groomer / Responsável</label>
                                    <input
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-200 transition-all shadow-sm"
                                        value={groomer}
                                        onChange={e => setGroomer(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Status Atual</label>
                                    <select
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-200 transition-all shadow-sm"
                                        value={status}
                                        onChange={e => setStatus(e.target.value)}
                                    >
                                        {columns.map(c => (
                                            <option key={c.id} value={c.id}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <CheckCircle2 className="w-4 h-4 text-indigo-300" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Salvar Alterações</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Petshop;
