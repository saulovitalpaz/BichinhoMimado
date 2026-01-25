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
    Activity
} from 'lucide-react';

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

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/pets');
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

    const handleSelectPet = (pet: Pet) => {
        setSelectedPet(pet);
        // Mock timeline for UI demo
        setTimeline([
            { id: 1, date: new Date(), type: 'Consulta', title: 'Check-up Mensal', doctor: 'Dr. Saulo', notes: 'Animal em ótimas condições.' },
            { id: 2, date: new Date(Date.now() - 86400000 * 30), type: 'Vacina', title: 'Vacina V10', doctor: 'Dr. Saulo', notes: 'Dose 1/3 aplicada.' }
        ]);
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
                            {timeline.map((event, i) => (
                                <div key={i} className="flex gap-6 relative">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${event.type === 'Consulta' ? 'bg-blue-500 shadow-blue-500/20' : 'bg-red-500 shadow-red-500/20'
                                            }`}>
                                            {event.type === 'Consulta' ? <Stethoscope className="w-5 h-5" /> : <Syringe className="w-5 h-5" />}
                                        </div>
                                        {i < timeline.length - 1 && <div className="w-1 flex-1 bg-slate-50 rounded-full my-2"></div>}
                                    </div>
                                    <div className="flex-1 pb-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h4 className="text-lg font-black text-slate-800 tracking-tight uppercase leading-none">{event.title}</h4>
                                                <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <span>{event.date.toLocaleDateString()}</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                                                    <span>{event.doctor}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="p-2 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all text-slate-400 hover:text-indigo-600"><Printer className="w-4 h-4" /></button>
                                                <button className="p-2 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all text-slate-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6">
                                            <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{event.notes}"</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {showWizard && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-white">
                        <div className="p-10 text-center">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-6">
                                <Activity className="w-10 h-10 animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Iniciar Novo Relato</h3>
                            <p className="text-slate-400 font-medium mt-4 leading-relaxed">Você está prestes a abrir um novo registro clínico. Todos os dados financeiros e de estoque serão processados automaticamente ao finalizar.</p>
                            <div className="mt-10 flex gap-4">
                                <button onClick={() => setShowWizard(false)} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancelar</button>
                                <button className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-900/10 transition-all active:scale-95 leading-none">Abrir Prontuário</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clinical;
