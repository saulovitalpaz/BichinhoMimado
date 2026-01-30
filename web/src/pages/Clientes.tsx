import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Filter, MoreHorizontal, Mail, Phone, MapPin, ChevronRight, Edit2, X, Save, Dog, History, ShoppingBag } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Clientes = () => {
    const [tutors, setTutors] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTutor, setEditingTutor] = useState<any | null>(null);

    // History Stats
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [viewingHistoryTutor, setViewingHistoryTutor] = useState<any | null>(null);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Form Stats
    const [step, setStep] = useState(1); // 1: Tutor, 2: Pet
    const [tutorForm, setTutorForm] = useState({ name: '', cpf: '', phone: '', email: '', address: '' });
    const [petForm, setPetForm] = useState({ name: '', species: 'Canino', breed: '', age: '', weight: '', gender: 'Macho' });

    useEffect(() => {
        fetchTutors();
    }, []);

    const fetchTutors = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/tutors`);
            if (res.ok) {
                const data = await res.json();
                setTutors(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (tutor: any) => {
        setViewingHistoryTutor(tutor);
        setShowHistoryModal(true);
        setHistoryLoading(true);
        setHistoryData([]);

        try {
            // Mocking history fetch by getting all appointments/sales and filtering client-side
            // In production, should have /api/tutors/:id/history
            const [resAppts, resSales] = await Promise.all([
                fetch(`${API_BASE_URL}/api/appointments`),
                fetch(`${API_BASE_URL}/api/sales`)
            ]);

            let timeline: any[] = [];

            if (resAppts.ok) {
                const appts = await resAppts.json();
                // Filter appointments for this tutor's pets
                const tutorPetIds = tutor.pets?.map((p: any) => p.id) || [];
                const tutorAppts = appts.filter((a: any) => tutorPetIds.includes(a.petId)).map((a: any) => ({
                    type: 'appointment',
                    date: a.date || a.createdAt,
                    data: a
                }));
                timeline = [...timeline, ...tutorAppts];
            }

            if (resSales.ok) {
                const sales = await resSales.json();
                // Filter sales for this tutor
                const tutorSales = sales.filter((s: any) => s.tutorId === tutor.id).map((s: any) => ({
                    type: 'sale',
                    date: s.date || s.createdAt,
                    data: s
                }));
                timeline = [...timeline, ...tutorSales];
            }

            // Sort chronological descending
            timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setHistoryData(timeline);

        } catch (e) {
            console.error(e);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleOpenModal = (tutor?: any) => {
        if (tutor) {
            setEditingTutor(tutor);
            setTutorForm({
                name: tutor.name,
                cpf: tutor.cpf || '',
                phone: tutor.phone || '',
                email: tutor.email || '',
                address: tutor.address || ''
            });
            setStep(1); // Edit mode usually focuses on Tutor details first
        } else {
            setEditingTutor(null);
            setTutorForm({ name: '', cpf: '', phone: '', email: '', address: '' });
            setPetForm({ name: '', species: 'Canino', breed: '', age: '', weight: '', gender: 'Macho' });
            setStep(1);
        }
        setShowModal(true);
    };

    const handleSaveTutor = async () => {
        try {
            const url = editingTutor
                ? `${API_BASE_URL}/api/tutors/${editingTutor.id}`
                : `${API_BASE_URL}/api/tutors`;

            const method = editingTutor ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tutorForm)
            });

            if (res.ok) {
                const savedTutor = await res.json();
                if (!editingTutor) {
                    // If creating new, move to Pet step passing the new Tutor ID
                    setEditingTutor(savedTutor);
                    setStep(2);
                } else {
                    setShowModal(false);
                    fetchTutors();
                }
            }
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar tutor');
        }
    };

    const handleSavePet = async () => {
        if (!editingTutor) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/pets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...petForm,
                    tutorId: editingTutor.id
                })
            });

            if (res.ok) {
                setShowModal(false);
                fetchTutors(); // Refresh list to show new pet count
            }
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar pet');
        }
    };

    const filteredTutors = tutors.filter((t: any) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Clientes & Tutores</h2>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-1">Gestão de proprietários e seus respectivos pets</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Cliente
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative group flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, email ou telefone..."
                            className="w-full pl-12 pr-6 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-[11px] font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                <th className="px-8 py-5">Nome do Tutor</th>
                                <th className="px-8 py-5">Contato</th>
                                <th className="px-8 py-5 text-center">Pets</th>
                                <th className="px-8 py-5 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-8 py-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">Buscando clientes...</td></tr>
                            ) : filteredTutors.length === 0 ? (
                                <tr><td colSpan={5} className="px-8 py-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">Nenhum cliente encontrado</td></tr>
                            ) : filteredTutors.map((tutor: any) => (
                                <tr key={tutor.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs mr-4 uppercase">
                                                {tutor.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-black text-slate-700 leading-tight">{tutor.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">{tutor.cpf || 'CPF N/I'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 space-y-1">
                                        <div className="flex items-center text-slate-500">
                                            <Phone className="w-3 h-3 mr-2 opacity-50" />
                                            <span className="text-[11px] font-medium">{tutor.phone || '-'}</span>
                                        </div>
                                        <div className="flex items-center text-slate-400">
                                            <Mail className="w-3 h-3 mr-2 opacity-50" />
                                            <span className="text-[10px] font-medium">{tutor.email || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <div className="flex justify-center -space-x-2">
                                            {tutor.pets?.length > 0 ? tutor.pets.slice(0, 3).map((p: any, i: number) => (
                                                <div key={i} className="w-8 h-8 rounded-xl border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-indigo-400 shadow-sm" title={p.name}>
                                                    {p.name[0]}
                                                </div>
                                            )) : <span className="text-[9px] text-slate-300">-</span>}
                                            {tutor.pets?.length > 3 && (
                                                <div className="w-8 h-8 rounded-xl border-2 border-white bg-slate-800 flex items-center justify-center text-[9px] font-black text-white shadow-sm">
                                                    +{tutor.pets.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => fetchHistory(tutor)}
                                                className="p-2 hover:bg-white rounded-xl shadow-sm border border-slate-100/50 text-slate-400 hover:text-pink-500 transition-all mr-2"
                                                title="Ver Histórico"
                                            >
                                                <History className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(tutor)}
                                                className="p-2 hover:bg-white rounded-xl shadow-sm border border-slate-100/50 text-slate-400 hover:text-indigo-600 transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Wizard */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <header className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">
                                    {editingTutor && step === 1 ? 'Editar Cliente' : step === 1 ? 'Novo Cliente' : 'Adicionar Pet'}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    Passo {step} de {editingTutor ? 1 : 2}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-red-500">
                                <X className="w-5 h-5" />
                            </button>
                        </header>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            {/* ... existing form content ... */}
                            {step === 1 ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome Completo</label>
                                        <input
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                            placeholder="Ex: Ana Maria Silva"
                                            value={tutorForm.name}
                                            onChange={e => setTutorForm({ ...tutorForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">CPF</label>
                                            <input
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                                placeholder="000.000.000-00"
                                                value={tutorForm.cpf}
                                                onChange={e => setTutorForm({ ...tutorForm, cpf: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Telefone</label>
                                            <input
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                                placeholder="(00) 00000-0000"
                                                value={tutorForm.phone}
                                                onChange={e => setTutorForm({ ...tutorForm, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email</label>
                                        <input
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                            placeholder="email@exemplo.com"
                                            value={tutorForm.email}
                                            onChange={e => setTutorForm({ ...tutorForm, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Endereço</label>
                                        <input
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                            placeholder="Rua, Número, Bairro"
                                            value={tutorForm.address}
                                            onChange={e => setTutorForm({ ...tutorForm, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                                    <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mb-6">
                                        <p className="text-[11px] font-bold text-indigo-800 text-center">
                                            Adicionando pet para: <span className="font-black uppercase">{tutorForm.name}</span>
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome do Pet</label>
                                        <input
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                            placeholder="Ex: Rex"
                                            value={petForm.name}
                                            onChange={e => setPetForm({ ...petForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Espécie</label>
                                            <select
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                                value={petForm.species}
                                                onChange={e => setPetForm({ ...petForm, species: e.target.value })}
                                            >
                                                <option value="Canino">Canino</option>
                                                <option value="Felino">Felino</option>
                                                <option value="Outro">Outro</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Raça</label>
                                            <input
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                                placeholder="Ex: Poodle"
                                                value={petForm.breed}
                                                onChange={e => setPetForm({ ...petForm, breed: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Gênero</label>
                                            <select
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                                value={petForm.gender}
                                                onChange={e => setPetForm({ ...petForm, gender: e.target.value })}
                                            >
                                                <option value="Macho">Macho</option>
                                                <option value="Fêmea">Fêmea</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Idade</label>
                                            <input
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                                placeholder="Anos"
                                                value={petForm.age}
                                                onChange={e => setPetForm({ ...petForm, age: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Peso (kg)</label>
                                            <input
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                                placeholder="0.0"
                                                value={petForm.weight}
                                                onChange={e => setPetForm({ ...petForm, weight: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <footer className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            {step === 2 && (
                                <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600">
                                    Voltar
                                </button>
                            )}
                            <div className="flex gap-4 ml-auto">
                                <button
                                    onClick={step === 1 ? handleSaveTutor : handleSavePet}
                                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center"
                                >
                                    {step === 1 ? (editingTutor ? 'Salvar Alterações' : 'Próximo: Adicionar Pet') : 'Finalizar Cadastro'}
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {showHistoryModal && viewingHistoryTutor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)} />
                    <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[85vh]">
                        <header className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                    <History className="w-5 h-5 text-indigo-500" />
                                    Histórico do Cliente
                                </h3>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    Evolução cronológica de {viewingHistoryTutor.name}
                                </p>
                            </div>
                            <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-red-500">
                                <X className="w-5 h-5" />
                            </button>
                        </header>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
                                {historyLoading ? (
                                    <div className="pl-8 py-4 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Carregando histórico...</div>
                                ) : historyData.length === 0 ? (
                                    <div className="pl-8 py-4 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Nenhuma atividade registrada</div>
                                ) : historyData.map((item, idx) => (
                                    <div key={idx} className="relative pl-8 group">
                                        {/* Dot */}
                                        <div className={`absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125 ${item.type === 'appointment' ? 'bg-pink-500' : 'bg-emerald-500'}`} />

                                        {/* Content */}
                                        <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${item.type === 'appointment' ? 'bg-pink-100 text-pink-600' : 'bg-emerald-100 text-emerald-600'
                                                    }`}>
                                                    {item.type === 'appointment' ? 'Serviço' : 'Compra'}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                                                    {new Date(item.date).toLocaleDateString('pt-BR')} • {new Date(item.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            {item.type === 'appointment' ? (
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-pink-400 shadow-sm border border-slate-50">
                                                        <Dog className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-700 text-sm">{item.data.service || 'Serviço Geral'}</h4>
                                                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Pet: {item.data.pet?.name} | Profissional: {item.data.groomer || '-'}</p>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase">{item.data.petshopStatus || item.data.status}</span>
                                                            <span className="text-[11px] font-black text-slate-800">R$ {item.data.price?.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-emerald-400 shadow-sm border border-slate-50">
                                                        <ShoppingBag className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-black text-slate-700 text-sm">Venda #{item.data.id}</h4>
                                                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                                            Itens: {item.data.items?.map((i: any) => i.name).join(', ') || 'Diversos'}
                                                        </p>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase">{item.data.paymentMethod || 'Dinheiro'}</span>
                                                            <span className="text-[11px] font-black text-slate-800">R$ {item.data.total?.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clientes;
