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
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Agenda = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // New Appointment Form
    const [searchPet, setSearchPet] = useState('');
    const [petResults, setPetResults] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [professionals, setProfessionals] = useState<any[]>(['Dr. Saulo', 'Anny', 'Gabriel']); // Mock for now, replace with API if User table ready
    const [selectedPet, setSelectedPet] = useState<any | null>(null);
    const [isProvisional, setIsProvisional] = useState(false);
    const [form, setForm] = useState({
        type: 'Petshop',
        serviceId: '',
        service: '',
        veterinarian: '',
        time: '09:00',
        price: 0,
        tempPetName: '',
        tempTutorName: '',
        tempTutorId: ''
    });

    const hours = Array.from({ length: 13 }, (_, i) => `${i + 8}:00`.padStart(5, '0')); // 08:00 to 20:00

    useEffect(() => {
        fetchAppointments();
        fetchServices();
        fetchProfessionals();
    }, [currentDate]);

    const fetchProfessionals = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/professionals`);
            if (res.ok) {
                const data = await res.json();
                setProfessionals(data.filter((p: any) => p.active).map((p: any) => p.name));
            }
        } catch (e) {
            console.error(e);
        }
    };

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
            // Send exact ISO range for the current day in User's Timezone
            const start = new Date(currentDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(currentDate);
            end.setHours(23, 59, 59, 999);

            const res = await fetch(`${API_BASE_URL}/api/appointments?start=${start.toISOString()}&end=${end.toISOString()}`);
            if (res.ok) {
                const data = await res.json();
                setAppointments(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchPet = async (q: string) => {
        setSearchPet(q);
        // Simple debounce could be added here, but the issue might be result handling
        if (!q) {
            setPetResults([]);
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/search?q=${q}`);
            if (res.ok) {
                const data = await res.json();
                // Allow pets and tutors
                setPetResults(data.filter((r: any) => r.type === 'pet' || r.type === 'tutor'));
            }
        } catch (e) { console.error('Search error:', e); }
    };

    const handleSelectResult = (result: any) => {
        if (result.type === 'pet') {
            setSelectedPet(result);
            setIsProvisional(false);
        } else if (result.type === 'tutor') {
            // If selecting a tutor, we switch to provisional mode but pre-fill the tutor name
            setIsProvisional(true);
            setSelectedPet(null);
            setForm({ ...form, tempTutorName: result.title, tempPetName: '', tempTutorId: result.id });
        }
        setPetResults([]);
        setSearchPet('');
    };

    const handleCreateAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Attempting to create appointment...', { selectedPet, isProvisional, form });

        if (!selectedPet && !isProvisional) {
            console.error('Validation failed: No pet selected and not provisional');
            return;
        }
        if (isProvisional && (!form.tempPetName || !form.tempTutorName)) {
            console.error('Validation failed: Missing provisional fields');
            return;
        }

        // Combine date and time
        // Combine date and time cleanly
        const [hourStr, minuteStr] = form.time.split(':');
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const day = currentDate.getDate();

        const appointmentDate = new Date(year, month, day, parseInt(hourStr), parseInt(minuteStr));

        try {
            const body = {
                petId: selectedPet ? parseInt(selectedPet.id) : null,
                date: appointmentDate.toISOString(),
                type: form.type,
                service: form.service,
                veterinarianId: 1, // Keep mock ID for now or fetch from User table
                groomer: form.veterinarian,
                petshopStatus: 'Aguardando',
                status: 'SCHEDULED',
                price: form.price,
                notes: isProvisional ? `PROVISÓRIO: ${form.tempPetName} (Tutor: ${form.tempTutorName})` : '',
                // If provisional, try to find tutorId from selected result if possible or null
                // Note: In handleSelectResult if type is tutor we should save the ID.
                // We need to store selectedTutorId in state
                tutorId: selectedPet ? selectedPet.tutorId : (form.tempTutorId ? parseInt(form.tempTutorId) : null)
            };

            const res = await fetch(`${API_BASE_URL}/api/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                console.log('Appointment created successfully!');
                setShowModal(false);
                setSelectedPet(null);
                setIsProvisional(false);
                setForm({ ...form, tempPetName: '', tempTutorName: '' });
                setSearchPet('');
                fetchAppointments();
            } else {
                const err = await res.json();
                console.error('Server error creating appointment:', err);
            }
        } catch (e) {
            console.error('Network/Logic error creating appointment:', e);
        }
    };

    const handleCallNow = async (appointment: any) => {
        if (!appointment) return;
        try {
            // Update status to likely trigger "In Progress" or "Banho" for the Queue
            // If it's Petshop, move to 'Banho' if it was 'Aguardando'
            const nextStatus = appointment.type === 'Petshop' ? 'Banho' : 'IN_PROGRESS';

            await fetch(`${API_BASE_URL}/api/appointments/${appointment.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'IN_PROGRESS',
                    petshopStatus: appointment.type === 'Petshop' ? 'Banho' : undefined
                })
            });
            fetchAppointments(); // Refresh UI
            alert(`Paciente ${appointment.pet?.name || 'Provisório'} chamado para atendimento!`);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCardClick = (appt: any) => {
        if (appt.status === 'COMPLETED' || appt.status === 'PAID') {
            // Go to Cashier
            navigate('/finance');
        } else if (appt.type === 'Petshop') {
            // Go to Queue/Monitor
            navigate('/petshop/monitor');
        } else {
            // Clinical
            navigate('/clinical');
        }
    };

    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    // Helper to get display name
    const getPetDisplayName = (appt: any) => {
        if (appt.pet?.name) return appt.pet.name;
        // Parse provisional
        if (appt.notes?.includes('PROVISÓRIO:')) {
            const match = appt.notes.match(/PROVISÓRIO: (.*?) \(Tutor: (.*?)\)/);
            if (match) return match[1];
        }
        return 'Provisório';
    };

    const getTutorDisplayName = (appt: any) => {
        if (appt.pet?.tutor?.name) return appt.pet.tutor.name;
        if (appt.tutor?.name) return appt.tutor.name;
        if (appt.notes?.includes('Tutor:')) {
            const match = appt.notes.match(/Tutor: (.*?)\)/);
            if (match) return match[1];
        }
        return '---';
    };

    // Calculate Stats
    const confirmed = appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').length;
    const waiting = appointments.filter(a => a.status === 'WAITING').length;
    const nextPatient = appointments
        .filter(a => new Date(a.date) > new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20 md:pb-0">
            {/* Header Controls */}
            <header className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-50 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-4 sm:gap-6">
                <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 w-full xl:w-auto">
                    <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-full md:w-auto justify-between">
                        <button onClick={() => changeDate(-1)} className="p-2.5 sm:p-3 hover:bg-white rounded-xl text-slate-400 hover:text-fuchsia-600 transition-all shadow-sm active:scale-90"><ChevronLeft className="w-5 h-5" /></button>
                        <div className="px-3 sm:px-6 font-black text-slate-700 uppercase tracking-widest text-[9px] sm:text-[11px] flex items-center min-w-[140px] sm:min-w-[180px] justify-center">
                            <CalendarIcon className="w-3.5 h-3.5 sm:w-4 h-4 mr-2 sm:mr-2.5 text-fuchsia-600" />
                            {currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <button onClick={() => changeDate(1)} className="p-2.5 sm:p-3 hover:bg-white rounded-xl text-slate-400 hover:text-fuchsia-600 transition-all shadow-sm active:scale-90"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                    <button onClick={() => setCurrentDate(new Date())} className="text-[9px] sm:text-[10px] font-black text-fuchsia-600 bg-fuchsia-50 px-6 py-3 rounded-2xl uppercase tracking-widest hover:bg-fuchsia-100 transition-colors w-full md:w-auto">Hoje</button>
                </div>

                <div className="flex items-center gap-4 w-full xl:w-auto">
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full xl:w-auto bg-fuchsia-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-fuchsia-600/20 hover:bg-fuchsia-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Novo Agendamento
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Calendar View (First on Mobile) */}
                <main className="lg:col-span-9 bg-white rounded-3xl border border-slate-50 shadow-sm overflow-hidden flex flex-col h-[600px] order-1 lg:order-2">
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                        <div className="space-y-2 relative">
                            {hours.map((hour, i) => {
                                const apptsInHour = appointments.filter(a => {
                                    const d = new Date(a.date);
                                    return d.getHours() === parseInt(hour.split(':')[0]);
                                });

                                return (
                                    <div key={i} className="flex space-x-4 md:space-x-8 group min-h-[100px]">
                                        <div className="w-12 md:w-16 text-right pt-2 border-r border-slate-50 pr-4 flex-shrink-0">
                                            <span className="text-[11px] font-black text-slate-300 uppercase tabular-nums tracking-widest">{hour}</span>
                                        </div>
                                        <div className="flex-1 py-1 relative space-y-2">
                                            {apptsInHour.map(appt => (
                                                <div
                                                    key={appt.id}
                                                    onClick={() => handleCardClick(appt)}
                                                    className="bg-fuchsia-50/50 border border-fuchsia-100 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm hover:shadow-md transition-all cursor-pointer group/card hover:bg-white gap-3 sm:gap-4"
                                                >
                                                    <div className="flex space-x-3 sm:space-x-5 items-center w-full md:w-auto overflow-hidden">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white border border-fuchsia-100 flex items-center justify-center text-lg sm:text-xl font-black text-fuchsia-500 shadow-sm flex-shrink-0">
                                                            {getPetDisplayName(appt)?.[0] || 'P'}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-y-1">
                                                                <h5 className="text-[12px] sm:text-[13px] font-black text-slate-800 uppercase tracking-tight truncate">{getPetDisplayName(appt)}</h5>
                                                                {appt.notes?.includes('PROVISÓRIO') && (
                                                                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded-lg bg-amber-100 text-amber-700">Provisório</span>
                                                                )}
                                                            </div>
                                                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase mt-1 sm:mt-2 flex items-center tracking-tight truncate">
                                                                <User className="w-3 h-3 mr-1.5 sm:mr-2 flex-shrink-0" /> <span className="truncate">{getTutorDisplayName(appt)}</span>
                                                            </p>
                                                            <p className="text-[10px] font-bold text-fuchsia-400 uppercase mt-1 flex items-center tracking-tight md:hidden">
                                                                {appt.service}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between w-full md:w-auto space-x-6">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:block">{appt.service}</span>
                                                        <div className="flex items-center gap-3">
                                                            {(appt.status === 'SCHEDULED' || appt.status === 'WAITING') && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleCallNow(appt);
                                                                    }}
                                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-600/20"
                                                                >
                                                                    Iniciar
                                                                </button>
                                                            )}
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{appt.status}</span>
                                                        </div>
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

                {/* Stats Sidebar (Last on Mobile) */}
                <aside className="lg:col-span-3 space-y-6 order-2 lg:order-1">
                    <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm">
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
                        <div className="bg-slate-900 p-6 rounded-3xl shadow-2xl relative overflow-hidden group border border-slate-800">
                            <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                <Play className="w-20 h-20 text-white fill-current" />
                            </div>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Próximo Paciente</p>
                            <h4 className="text-white font-black text-2xl mt-3 uppercase tracking-tighter">{nextPatient.pet?.name || 'Provisório'}</h4>
                            <p className="text-slate-400 text-[10px] mt-2 font-bold uppercase tracking-widest">
                                {nextPatient.service} • {new Date(nextPatient.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <button
                                onClick={() => handleCallNow(nextPatient)}
                                className="mt-8 w-full bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                            >
                                Chamar Agora
                            </button>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sem próximos atendimentos</p>
                        </div>
                    )}
                </aside>
            </div>

            {/* Modal Novo Agendamento */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <header className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Novo Agendamento</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-indigo-400" />
                            </button>
                        </header>

                        <form onSubmit={handleCreateAppointment} className="p-8 space-y-6">
                            {/* Pet Selector */}
                            <div className="space-y-2 relative">
                                <div className="flex justify-between items-center ml-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newState = !isProvisional;
                                            setIsProvisional(newState);
                                            if (newState) setSelectedPet(null);
                                        }}
                                        className={`text-[9px] font-black uppercase tracking-widest p-1.5 rounded-lg border transition-all ${isProvisional ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100 hover:text-indigo-600'}`}
                                    >
                                        {isProvisional ? 'Usar Banco de Dados' : 'Agendamento Provisório'}
                                    </button>
                                </div>

                                {isProvisional ? (
                                    <div className="space-y-3 bg-amber-50/30 p-4 rounded-2xl border border-amber-100 animate-in fade-in slide-in-from-top-2">
                                        <input
                                            placeholder="Nome do Animal (Provisório)"
                                            className="w-full px-4 py-3 bg-white border border-amber-100 rounded-xl text-[12px] font-bold focus:outline-none focus:border-amber-400"
                                            value={form.tempPetName}
                                            onChange={e => setForm({ ...form, tempPetName: e.target.value })}
                                        />
                                        <input
                                            placeholder="Nome do Tutor / Telefone"
                                            className="w-full px-4 py-3 bg-white border border-amber-100 rounded-xl text-[12px] font-bold focus:outline-none focus:border-amber-400"
                                            value={form.tempTutorName}
                                            onChange={e => setForm({ ...form, tempTutorName: e.target.value })}
                                        />
                                    </div>
                                ) : selectedPet ? (
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
                                            placeholder="Buscar paciente no banco..."
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-200 transition-all shadow-sm"
                                            value={searchPet}
                                            onChange={e => handleSearchPet(e.target.value)}
                                        />
                                        {petResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden py-2 max-h-64 overflow-y-auto custom-scrollbar">
                                                {petResults.map(p => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => handleSelectResult(p)}
                                                        className="w-full px-6 py-3 flex flex-col items-start hover:bg-indigo-50 transition-colors"
                                                    >
                                                        <span className="text-[12px] font-black text-slate-800 uppercase tracking-tight">{p.title}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {p.type === 'tutor' ? 'Cliente (Novo Pet)' : p.subtitle}
                                                        </span>
                                                    </button>
                                                ))}
                                                <div className="border-t border-slate-50 mt-2 p-2 text-center">
                                                    <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Não encontrou?</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsProvisional(true)}
                                                        className="flex items-center justify-center w-full py-3 bg-amber-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-600 hover:text-white transition-all"
                                                    >
                                                        <Plus className="w-3 h-3 mr-2" /> Usar Cadastro Provisório
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
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

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Serviço</label>
                                <select
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-200 transition-all appearance-none"
                                    value={form.serviceId}
                                    onChange={e => {
                                        const svc = services.find(s => s.id.toString() === e.target.value);
                                        if (svc) {
                                            setForm({
                                                ...form,
                                                serviceId: svc.id.toString(),
                                                service: svc.name,
                                                price: svc.price,
                                                type: svc.category
                                            });
                                        }
                                    }}
                                >
                                    <option value="">Selecione um serviço...</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Profissional</label>
                                <select
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-200 transition-all"
                                    value={form.veterinarian}
                                    onChange={e => setForm({ ...form, veterinarian: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {professionals.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={!selectedPet && (!isProvisional || !form.tempPetName || !form.tempTutorName)}
                                className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${(!selectedPet && (!isProvisional || !form.tempPetName || !form.tempTutorName)) ? 'bg-slate-100 text-slate-300' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/10'
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
