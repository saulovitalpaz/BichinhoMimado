import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    User,
    Phone,
    Play,
    X,
    Clock,
    CheckCircle
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const Agenda = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // New Appointment Form
    const [searchPet, setSearchPet] = useState('');
    const [petResults, setPetResults] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [selectedPet, setSelectedPet] = useState<any | null>(null);
    const [form, setForm] = useState({
        type: 'Consulta',
        service: 'Consulta Geral',
        veterinarian: 'Dr. Saulo',
        time: '09:00'
    });

    const hours = Array.from({ length: 13 }, (_, i) => `${i + 8}:00`.padStart(5, '0')); // 08:00 to 20:00

    useEffect(() => {
        fetchAppointments();
        fetchServices();
    }, [currentDate]);

    const fetchServices = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/services`);
            if (res.ok) {
                setServices(await res.json());
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            // In a real app, send ?date=YYYY-MM-DD to filter
            const res = await fetch(`${API_BASE_URL}/api/appointments`);
            if (res.ok) {
                const data = await res.json();
                // Filter client-side for now for demo simplicity if backend doesn't filter strictly
                const formattedDate = currentDate.toISOString().split('T')[0];
                const daysAppointments = data.filter((a: any) => a.date.startsWith(formattedDate));
                setAppointments(daysAppointments);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchPet = async (q: string) => {
        setSearchPet(q);
        if (q.length < 2) {
            setPetResults([]);
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/search?q=${q}`);
            if (res.ok) {
                const data = await res.json();
                setPetResults(data.filter((r: any) => r.type === 'pet'));
            }
        } catch (e) { console.error(e); }
    };

    const handleCreateAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPet) return;

        // Combine date and time
        const [hours, minutes] = form.time.split(':');
        const appointmentDate = new Date(currentDate);
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        try {
            const res = await fetch(`${API_BASE_URL}/api/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    petId: selectedPet.id,
                    date: appointmentDate.toISOString(),
                    type: form.type,
                    service: form.service,
                    veterinarianId: 1, // Mock
                    groomer: form.veterinarian, // Using groomer field for vet name in this unified model for now
                    petshopStatus: 'Aguardando', // Default
                    price: 150.00 // Default Mock Price
                })
            });

            if (res.ok) {
                setShowModal(false);
                setSelectedPet(null);
                setSearchPet('');
                fetchAppointments();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    // Calculate Stats
    const confirmed = appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').length;
    const waiting = appointments.filter(a => a.status === 'WAITING').length;
    const nextPatient = appointments
        .filter(a => new Date(a.date) > new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Header Controls */}
            <header className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
                        <div className="px-6 font-black text-slate-700 uppercase tracking-widest text-[11px] flex items-center min-w-[180px] justify-center">
                            <CalendarIcon className="w-4 h-4 mr-2.5 text-indigo-600" />
                            {currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <button onClick={() => changeDate(1)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                    <button onClick={() => setCurrentDate(new Date())} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-2xl uppercase tracking-widest hover:bg-indigo-100 transition-colors">Hoje</button>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4 mr-2 inline" /> Agendar
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Stats Sidebar */}
                <aside className="lg:col-span-3 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Resumo do Dia</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Confirmados', val: confirmed, color: 'emerald' },
                                { label: 'Aguardando', val: waiting, color: 'amber' },
                                { label: 'Total', val: appointments.length, color: 'indigo' }
                            ].map((stat, i) => (
                                <div key={i} className={`p-4 rounded-2xl bg-${stat.color}-50/50 border border-${stat.color}-100 flex justify-between items-center`}>
                                    <span className={`text-[9px] font-black text-${stat.color}-800 uppercase tracking-widest`}>{stat.label}</span>
                                    <span className={`text-xl font-black text-${stat.color}-900 tabular-nums`}>{stat.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {nextPatient ? (
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-slate-800">
                            <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                <Play className="w-20 h-20 text-white fill-current" />
                            </div>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Próximo Paciente</p>
                            <h4 className="text-white font-black text-2xl mt-3 uppercase tracking-tighter">{nextPatient.pet?.name}</h4>
                            <p className="text-slate-400 text-[10px] mt-2 font-bold uppercase tracking-widest">
                                {nextPatient.service} • {new Date(nextPatient.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <button className="mt-8 w-full bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-[0.98]">Chamar Agora</button>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sem próximos atendimentos</p>
                        </div>
                    )}
                </aside>

                {/* Main Calendar View */}
                <main className="lg:col-span-9 bg-white rounded-[3rem] border border-slate-50 shadow-sm overflow-hidden flex flex-col h-[600px]">
                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                        <div className="space-y-2 relative">
                            {hours.map((hour, i) => {
                                const apptsInHour = appointments.filter(a => {
                                    const d = new Date(a.date);
                                    return d.getHours() === parseInt(hour.split(':')[0]);
                                });

                                return (
                                    <div key={i} className="flex space-x-8 group min-h-[100px]">
                                        <div className="w-16 text-right pt-2 border-r border-slate-50 pr-4">
                                            <span className="text-[11px] font-black text-slate-300 uppercase tabular-nums tracking-widest">{hour}</span>
                                        </div>
                                        <div className="flex-1 py-1 relative space-y-2">
                                            {apptsInHour.map(appt => (
                                                <div key={appt.id} className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-5 flex justify-between items-center shadow-sm hover:shadow-md transition-all cursor-pointer group/card hover:bg-white">
                                                    <div className="flex space-x-5 items-center">
                                                        <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-xl font-black text-indigo-500 shadow-sm">
                                                            {appt.pet?.name?.[0]}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center space-x-3">
                                                                <h5 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{appt.pet?.name}</h5>
                                                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-700">{appt.type}</span>
                                                            </div>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 flex items-center tracking-tight">
                                                                <User className="w-3 h-3 mr-2" /> {appt.pet?.tutor?.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-6">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{appt.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {apptsInHour.length === 0 && (
                                                <div className="h-full border-b border-slate-50/50 group-hover:border-slate-100 transition-colors" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal Novo Agendamento */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <header className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Novo Agendamento</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-indigo-400" />
                            </button>
                        </header>

                        <form onSubmit={handleCreateAppointment} className="p-8 space-y-6">
                            {/* Pet Selector */}
                            <div className="space-y-2 relative">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Paciente</label>
                                {selectedPet ? (
                                    <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 p-4 rounded-2xl animate-in fade-in duration-300">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-indigo-100 text-indigo-500 font-black uppercase">
                                                {selectedPet.title?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-black text-indigo-900 uppercase tracking-tight">{selectedPet.title}</p>
                                                <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{selectedPet.subtitle}</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => setSelectedPet(null)} className="p-1 hover:bg-white rounded-lg transition-colors">
                                            <X className="w-4 h-4 text-indigo-400" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="text"
                                            placeholder="Buscar paciente..."
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-200 transition-all shadow-sm"
                                            value={searchPet}
                                            onChange={e => handleSearchPet(e.target.value)}
                                        />
                                        {petResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden py-2 max-h-48 overflow-y-auto custom-scrollbar">
                                                {petResults.map(p => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => { setSelectedPet(p); setPetResults([]); setSearchPet(''); }}
                                                        className="w-full px-6 py-3 flex flex-col items-start hover:bg-indigo-50 transition-colors"
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
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tipo</label>
                                    <select
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                        value={form.type}
                                        onChange={e => setForm({ ...form, type: e.target.value })}
                                    >
                                        <option value="Consulta">Consulta</option>
                                        <option value="Vacina">Vacina</option>
                                        <option value="Retorno">Retorno</option>
                                        <option value="Cirurgia">Cirurgia</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Horário</label>
                                    <input
                                        type="time"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                        value={form.time}
                                        onChange={e => setForm({ ...form, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Serviço / Detalhe</label>
                                <input
                                    list="service-options"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                    value={form.service}
                                    onChange={e => setForm({ ...form, service: e.target.value })}
                                />
                                <datalist id="service-options">
                                    {services.map(s => (
                                        <option key={s.id} value={s.name} />
                                    ))}
                                </datalist>
                            </div>

                            <button
                                type="submit"
                                disabled={!selectedPet}
                                className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${!selectedPet ? 'bg-slate-100 text-slate-300' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/10'
                                    }`}
                            >
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                Confirmar Agendamento
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Agenda;
