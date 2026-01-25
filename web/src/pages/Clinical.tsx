import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    Calendar,
    Clock,
    FileText,
    Syringe,
    Pill,
    Stethoscope,
    AlertCircle,
    MoreVertical,
    Edit2,
    Printer,
    ChevronRight,
    Upload,
    Download,
    Trash2,
    User,
    Activity,
    X
} from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Pet {
    id: number;
    name: string;
    breed: string;
    weight: number;
    tutor: { name: string };
}

const Clinical = () => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('history');
    const [showWizard, setShowWizard] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state for Auto-save
    const [form, setForm] = useState({
        chiefComplaint: '',
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        diagnosis: '',
        treatment: '',
        prescriptions: [] as any[]
    });

    // Load from LocalStorage on mount or pet selection
    useEffect(() => {
        if (selectedPet && showWizard) {
            const saved = localStorage.getItem(`draft_record_${selectedPet.id}`);
            if (saved) {
                setForm(JSON.parse(saved));
            }
        }
    }, [selectedPet, showWizard]);

    // Auto-save logic (Debounced)
    useEffect(() => {
        if (selectedPet && showWizard) {
            const timeout = setTimeout(() => {
                localStorage.setItem(`draft_record_${selectedPet.id}`, JSON.stringify(form));
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [form, selectedPet, showWizard]);

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/pets`);
                if (res.ok) {
                    const data = await res.json();
                    setPets(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchPets();
    }, []);

    const fetchTimeline = async (petId: number) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/pets/${petId}/timeline`);
            if (res.ok) {
                const data = await res.json();
                setTimeline(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSelectPet = (pet: Pet) => {
        setSelectedPet(pet);
        fetchTimeline(pet.id);
    };

    const handleSubmitRecord = async () => {
        if (!selectedPet) return;
        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/medical-records`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    petId: selectedPet.id,
                    veterinarian: 'Dr. Saulo', // Should come from context
                    chiefComplaint: form.chiefComplaint,
                    soapData: {
                        subjective: form.subjective,
                        objective: form.objective,
                        assessment: form.assessment,
                        plan: form.plan
                    },
                    diagnosis: form.diagnosis,
                    treatment: form.treatment,
                    prescriptions: form.prescriptions
                })
            });

            if (res.ok) {
                localStorage.removeItem(`draft_record_${selectedPet.id}`);
                setShowWizard(false);
                fetchTimeline(selectedPet.id);
                setForm({
                    chiefComplaint: '', subjective: '', objective: '', assessment: '', plan: '',
                    diagnosis: '', treatment: '', prescriptions: []
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredPets = pets.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tutor?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!selectedPet) {
        return (
            <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center space-y-3">
                    <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-600/20">
                        <Stethoscope className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Atendimento Clínico</h2>
                    <p className="text-slate-400 text-sm font-medium">Selecione um paciente para abrir o prontuário digital</p>
                </div>

                <div className="relative group max-w-2xl mx-auto">
                    <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Nome do animal ou tutor..."
                        className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] text-lg font-bold text-slate-700 focus:outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600/30 shadow-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loading ? (
                        <div className="col-span-2 py-12 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">Carregando pacientes...</div>
                    ) : (
                        filteredPets.map(pet => (
                            <button key={pet.id} onClick={() => handleSelectPet(pet)} className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-between group">
                                <div className="flex items-center space-x-5">
                                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl font-black text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        {pet.name[0]}
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{pet.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{pet.tutor?.name}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-600 transition-colors" />
                            </button>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row h-full gap-8 animate-in fade-in duration-500">
            {/* Patient Sidebar */}
            <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
                <button onClick={() => setSelectedPet(null)} className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 mb-2 transition-colors">
                    <ChevronRight className="w-3 h-3 rotate-180 mr-1.5" /> Voltar à busca
                </button>

                <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm p-8 flex flex-col items-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] mb-6 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-200">
                        {selectedPet.name[0]}
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-none">{selectedPet.name}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{selectedPet.breed} • {selectedPet.weight}kg</p>

                    <div className="w-full mt-8 space-y-4">
                        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100/50">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tutor</span>
                            <span className="text-[11px] font-black text-slate-800 uppercase tabular-nums truncate max-w-[140px]">{selectedPet.tutor?.name}</span>
                        </div>
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-3">
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <p className="text-[10px] text-red-800 font-bold leading-relaxed uppercase tracking-tight">Paciente com histórico de alergia à Dipirona.</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Clinical Content */}
            <section className="flex-1 bg-white rounded-[3rem] border border-slate-50 shadow-sm flex flex-col overflow-hidden">
                <header className="px-8 pt-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/20">
                    <nav className="flex space-x-8">
                        {['history', 'vaccines', 'files'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-5 text-[11px] font-black uppercase tracking-widest transition-all border-b-4 ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {tab === 'history' ? 'Prontuários' : tab === 'vaccines' ? 'Vacinas' : 'Arquivos'}
                            </button>
                        ))}
                    </nav>
                    <button onClick={() => setShowWizard(true)} className="mb-4 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center">
                        <Plus className="w-4 h-4 mr-2" /> Novo Atendimento
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    {activeTab === 'history' && (
                        <div className="space-y-8">
                            {timeline.length > 0 ? timeline.map((event, i) => (
                                <div key={i} className="flex gap-6 relative group">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 ${event.type === 'MEDICAL_RECORD' ? 'bg-indigo-500 shadow-indigo-500/20' :
                                            event.type === 'APPOINTMENT' ? 'bg-emerald-500 shadow-emerald-500/20' :
                                                'bg-amber-500 shadow-amber-500/20'
                                            }`}>
                                            {event.type === 'MEDICAL_RECORD' ? <FileText className="w-5 h-5" /> :
                                                event.type === 'APPOINTMENT' ? <Calendar className="w-5 h-5" /> :
                                                    <Pill className="w-5 h-5" />}
                                        </div>
                                        {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 rounded-full my-2"></div>}
                                    </div>
                                    <div className="flex-1 pb-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h4 className="text-lg font-black text-slate-800 tracking-tight uppercase leading-none">{event.title}</h4>
                                                <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <span>{new Date(event.date).toLocaleDateString()}</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                                                    <span>{event.subtitle || event.status}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all text-slate-400 hover:text-indigo-600"><Printer className="w-4 h-4" /></button>
                                                <button className="p-2 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all text-slate-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                                            <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                                {event.subtitle || 'Sem observações adicionais.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">Nenhum registro encontrado</div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {showWizard && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl border border-white my-auto flex flex-col h-[90vh]">
                        <header className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Prontuário Digital (SOAP)</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sessão Ativa • Draft salvo localmente</p>
                            </div>
                            <button onClick={() => setShowWizard(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400"><X className="w-5 h-5" /></button>
                        </header>

                        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anamnese / Queixa</label>
                                    <textarea
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-3xl p-6 text-sm font-medium focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-300 transition-all h-32 outline-none"
                                        placeholder="Descreva o motivo da consulta..."
                                        value={form.chiefComplaint}
                                        onChange={e => setForm({ ...form, chiefComplaint: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observação Objetiva</label>
                                    <textarea
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-3xl p-6 text-sm font-medium focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-300 transition-all h-32 outline-none"
                                        placeholder="Sinais vitais, exame físico..."
                                        value={form.objective}
                                        onChange={e => setForm({ ...form, objective: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Diagnóstico & Plano</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-indigo-600/5 outline-none"
                                        placeholder="Diagnóstico Principal"
                                        value={form.diagnosis}
                                        onChange={e => setForm({ ...form, diagnosis: e.target.value })}
                                    />
                                    <input
                                        className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-indigo-600/5 outline-none"
                                        placeholder="Tratamento / Conduta"
                                        value={form.treatment}
                                        onChange={e => setForm({ ...form, treatment: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <footer className="px-10 py-8 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Sincronizado</span>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setShowWizard(false)} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all">Descartar</button>
                                <button
                                    onClick={handleSubmitRecord}
                                    disabled={isSaving}
                                    className="bg-slate-900 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-900/10 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSaving ? 'Salvando...' : 'Finalizar Atendimento'}
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clinical;
