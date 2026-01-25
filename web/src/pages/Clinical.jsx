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
    Dog
} from 'lucide-react';
import { fetchPets, fetchMedicalRecords, createMedicalRecord } from '../utils/api';

const Clinical = () => {
    const [pets, setPets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPet, setSelectedPet] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [activeTab, setActiveTab] = useState('history'); // 'history', 'vaccines', 'files'
    const [showWizard, setShowWizard] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPets = async () => {
            const data = await fetchPets();
            setPets(data);
            setLoading(false);
        };
        loadPets();
    }, []);

    const handleSelectPet = async (pet) => {
        setSelectedPet(pet);
        const records = await fetchMedicalRecords(pet.id);

        // Transform records into timeline events
        const events = records.map(r => ({
            id: r.id,
            date: new Date(r.date),
            type: 'Consulta',
            title: r.diagnosis || 'Atendimento Clínico',
            doctor: r.veterinarian || 'Dr. Saulo',
            details: r
        }));

        // Standard mock events for demo
        events.push({
            id: 'vac-1',
            date: new Date(new Date().setDate(new Date().getDate() - 20)),
            type: 'Vacina',
            title: 'Vacina V10 (Dose 1/3)',
            doctor: 'Dr. Saulo',
            details: { notes: 'Paciente saudável.' }
        });

        setTimeline(events.sort((a, b) => b.date - a.date));
    };

    const filteredPets = pets.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tutor?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!selectedPet) {
        return (
            <div className="max-w-4xl mx-auto mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-200">
                        <Stethoscope className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Atendimento Clínico</h2>
                    <p className="text-slate-500 mt-2 font-medium">Busque por um paciente para iniciar o prontuário</p>
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-500">
                        <Search className="w-6 h-6 text-slate-300" />
                    </div>
                    <input
                        type="text"
                        placeholder="Digite o nome do animal ou tutor..."
                        className="w-full pl-16 pr-6 py-5 bg-white border-2 border-slate-100 rounded-3xl text-lg font-bold text-slate-700 placeholder-slate-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none shadow-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchTerm && filteredPets.length > 0 ? filteredPets.map(pet => (
                        <button
                            key={pet.id}
                            onClick={() => handleSelectPet(pet)}
                            className="bg-white p-5 rounded-3xl border-2 border-slate-50 hover:border-purple-200 hover:shadow-xl hover:-translate-y-1 text-left flex items-center gap-5 transition-all group"
                        >
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-xl font-black text-slate-300 group-hover:bg-purple-50 group-hover:text-purple-400 transition-colors">
                                {pet.name[0]}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-slate-800 text-lg leading-tight uppercase tracking-tight">{pet.name}</h3>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter mt-1">{pet.tutor?.name || '---'}</p>
                            </div>
                            <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-purple-300" />
                        </button>
                    )) : searchTerm && (
                        <div className="col-span-2 text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Nenhum paciente encontrado</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Header helpers
    const getTypeColor = (type) => {
        switch (type) {
            case 'Vacina': return 'bg-red-500';
            case 'Consulta': return 'bg-blue-500';
            case 'Exame': return 'bg-purple-500';
            default: return 'bg-slate-400';
        }
    };

    return (
        <div className="flex h-[calc(100vh-120px)] gap-6 animate-in fade-in duration-500">

            {/* Left Column: Patient Profile */}
            <div className="w-72 flex-shrink-0 space-y-4">
                <button
                    onClick={() => setSelectedPet(null)}
                    className="w-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-purple-600 mb-2 transition-colors"
                >
                    <ChevronRight className="w-3 h-3 rotate-180 mr-1" /> Alternar Paciente
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl mb-4 flex items-center justify-center text-4xl font-black text-white shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        {selectedPet.name[0]}
                    </div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">{selectedPet.name}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{selectedPet.breed || 'SRD'} • {selectedPet.weight || '--'} KG</p>

                    <div className="w-full mt-6 space-y-2">
                        <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tutor</span>
                            <span className="text-xs font-black text-purple-600 uppercase tabular-nums truncate max-w-[120px]">{selectedPet.tutor?.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tags</span>
                            <div className="flex gap-1">
                                <span className="bg-red-100 text-red-600 text-[8px] px-1.5 py-0.5 rounded font-black uppercase border border-red-200">Alergia</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-3xl">
                    <h3 className="text-[10px] font-black text-blue-800 mb-2 uppercase tracking-widest flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1.5" /> Alerta Ativo
                    </h3>
                    <p className="text-[10px] text-blue-700 font-bold leading-relaxed">
                        Paciente em tratamento dermatológico prolongado.
                    </p>
                </div>
            </div>

            {/* Right Column: Tabbed Content */}
            <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                {/* Header Tabs */}
                <div className="px-6 pt-4 border-b border-slate-100 flex justify-between items-end bg-slate-50/30">
                    <div className="flex gap-6">
                        {[
                            { key: 'history', label: 'Histórico', icon: Clock },
                            { key: 'vaccines', label: 'Protocolo Vacinal', icon: Syringe },
                            { key: 'files', label: 'Arquivo Digital', icon: FileText }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`pb-4 px-1 text-[11px] font-black uppercase tracking-widest flex items-center transition-all border-b-2 ${activeTab === tab.key
                                        ? 'border-purple-600 text-purple-600'
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <tab.icon className="w-3.5 h-3.5 mr-2" /> {tab.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowWizard(true)} className="mb-4 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center shadow-lg shadow-purple-200 transition-all active:scale-95">
                        <Plus className="w-4 h-4 mr-2" /> Nova Consulta
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">

                    {/* Tab: History */}
                    {activeTab === 'history' && (
                        <div className="relative pl-12 pr-4 space-y-10">
                            <div className="absolute left-[20px] top-2 bottom-8 w-1 bg-gradient-to-b from-slate-200 to-transparent rounded-full font-bold"></div>

                            {timeline.map((event, idx) => (
                                <div key={idx} className="relative group animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-[44px] top-1.5 w-7 h-7 rounded-2xl border-4 border-white shadow-md z-10 ${getTypeColor(event.type)} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                        {event.type === 'Vacina' ? <Syringe className="w-3 h-3 text-white" /> : <Stethoscope className="w-3 h-3 text-white" />}
                                    </div>

                                    {/* Date Label */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest tabular-nums">{event.date.toLocaleDateString()}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter tabular-nums">{event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>

                                    {/* Card */}
                                    <div className="bg-[#FBFCFE] border-2 border-slate-50/50 rounded-3xl p-5 hover:border-purple-100 hover:shadow-lg transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-lg font-black text-slate-800 tracking-tight leading-none uppercase">{event.title}</h4>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center">
                                                    <User className="w-3 h-3 mr-1" /> {event.doctor}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-purple-600 transition-all border border-transparent hover:border-slate-100"><Printer className="w-4 h-4" /></button>
                                                <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-500 transition-all border border-transparent hover:border-slate-100"><Edit2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="bg-white/50 border border-slate-50 rounded-2xl p-4 italic text-sm text-slate-600 font-medium">
                                            "{event.details.chiefComplaint || event.details.notes || '---'}"
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tab: Protocolo Vacinal */}
                    {activeTab === 'vaccines' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { name: 'V10 / V8 (Polivalente)', doses: 3, done: 1, last: '24/01/2026', next: '24/02/2026', color: 'red' },
                                    { name: 'Raiva (Anual)', doses: 1, done: 0, last: '---', next: 'Imediato', color: 'orange' },
                                    { name: 'Gripe / Tosse Canina', doses: 2, done: 0, last: '---', next: 'Pendente', color: 'blue' },
                                    { name: 'Giárdia', doses: 2, done: 0, last: '---', next: 'Pendente', color: 'emerald' }
                                ].map((vac, i) => (
                                    <div key={i} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`w-10 h-10 rounded-2xl bg-${vac.color}-50 flex items-center justify-center text-${vac.color}-600 group-hover:bg-${vac.color}-600 group-hover:text-white transition-all`}>
                                                <Syringe className="w-5 h-5" />
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-${vac.color}-50 text-${vac.color}-600 border border-${vac.color}-100`}>
                                                    {vac.done === vac.doses ? 'Completo' : 'Em curso'}
                                                </span>
                                            </div>
                                        </div>
                                        <h4 className="font-black text-slate-800 text-sm mb-4 uppercase tracking-tight">{vac.name}</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Última Dose</p>
                                                <p className="text-xs font-bold text-slate-700 mt-0.5">{vac.last}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Próxima Dose</p>
                                                <p className={`text-xs font-black mt-0.5 ${vac.next === 'Imediato' ? 'text-red-600' : 'text-slate-700'}`}>{vac.next}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-1">
                                            {Array.from({ length: vac.doses }).map((_, j) => (
                                                <div key={j} className={`h-1.5 flex-1 rounded-full ${j < vac.done ? `bg-${vac.color}-500` : 'bg-slate-100'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tab: Digital Archive */}
                    {activeTab === 'files' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Arquivos Anexados</h3>
                                <button className="flex items-center gap-2 text-xs font-black text-purple-600 bg-purple-50 px-4 py-2 rounded-2xl hover:bg-purple-100 transition-all uppercase tracking-widest">
                                    <Upload className="w-4 h-4" /> Enviar Arquivo
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { name: 'Hemograma_Completo.pdf', date: '24/01', size: '1.2MB', type: 'Exame' },
                                    { name: 'Ultrassom_Abdominal.jpg', date: '22/01', size: '2.4MB', type: 'Imagem' },
                                    { name: 'Termo_Consentimento.pdf', date: '20/01', size: '0.8MB', type: 'Legal' }
                                ].map((file, i) => (
                                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-purple-500 transition-colors">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-slate-700 truncate">{file.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">{file.type} • {file.date} • {file.size}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button className="p-2 text-slate-300 hover:text-blue-500"><Download className="w-4 h-4" /></button>
                                            <button className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {showWizard && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[600px] border border-white">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-black text-xl text-slate-800 uppercase tracking-tighter">Realizar Atendimento</h3>
                            <button onClick={() => setShowWizard(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all">✕</button>
                        </div>
                        <div className="flex-1 p-10 flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-6">
                                <Stethoscope className="w-12 h-12" />
                            </div>
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">Pronto para começar?</h4>
                            <p className="text-slate-500 font-medium max-w-sm mt-4">Certifique-se de que os dados de triagem foram preenchidos pela enfermagem antes de iniciar o relato clínico.</p>
                            <button className="mt-8 bg-purple-600 text-white px-10 py-4 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-purple-200 hover:bg-purple-700 transition-all scale-110 active:scale-100">Iniciar Prontuário</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Clinical;
