import React, { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Calendar as CalendarIcon,
    Clock,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    User,
    Dog,
    Phone,
    Play
} from 'lucide-react';

const Agenda = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const appointments = [
        { id: 1, time: '09:00', pet: 'Billy', tutor: 'Maria', type: 'Consulta', status: 'Confirmado', color: 'indigo' },
        { id: 2, time: '10:30', pet: 'Maria Flor', tutor: 'Joana', type: 'Vacina', status: 'Aguardando', color: 'red' },
        { id: 3, time: '11:00', pet: 'Tedy', tutor: 'Carlos', type: 'Estética', status: 'Em andamento', color: 'purple' },
        { id: 4, time: '14:00', pet: 'Saymon', tutor: 'Ana', type: 'Retorno', status: 'Confirmado', color: 'emerald' },
        { id: 5, time: '15:30', pet: 'Meg', tutor: 'Roberto', type: 'Cirurgia', status: 'Confirmado', color: 'orange' },
    ];

    const hours = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Header Controls */}
            <header className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
                        <div className="px-6 font-black text-slate-700 uppercase tracking-widest text-[11px] flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2.5 text-indigo-600" />
                            24 de Janeiro, 2026
                        </div>
                        <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                    <button className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-2xl uppercase tracking-widest hover:bg-indigo-100 transition-colors">Hoje</button>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                        <input type="text" placeholder="Buscar agendamento..." className="bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-3 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600/30 transition-all w-64 shadow-sm" />
                    </div>
                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all">
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
                                { label: 'Confirmados', val: 18, color: 'emerald' },
                                { label: 'Aguardando', val: 4, color: 'amber' },
                                { label: 'Cancelados', val: 1, color: 'red' }
                            ].map((stat, i) => (
                                <div key={i} className={`p-4 rounded-2xl bg-${stat.color}-50/50 border border-${stat.color}-100 flex justify-between items-center`}>
                                    <span className={`text-[9px] font-black text-${stat.color}-800 uppercase tracking-widest`}>{stat.label}</span>
                                    <span className={`text-xl font-black text-${stat.color}-900 tabular-nums`}>{stat.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-slate-800">
                        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                            <Play className="w-20 h-20 text-white fill-current" />
                        </div>
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Próximo Paciente</p>
                        <h4 className="text-white font-black text-2xl mt-3 uppercase tracking-tighter">Maria Flor</h4>
                        <p className="text-slate-400 text-[10px] mt-2 font-bold uppercase tracking-widest">Protocolo Vacinal • 10:30</p>
                        <button className="mt-8 w-full bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-[0.98]">Chamar Agora</button>
                    </div>
                </aside>

                {/* Main Calendar View */}
                <main className="lg:col-span-9 bg-white rounded-[3rem] border border-slate-50 shadow-sm overflow-hidden flex flex-col">
                    <header className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                        <nav className="flex space-x-6">
                            {['Dia', 'Semana', 'Mês'].map(m => (
                                <button key={m} className={`text-[10px] font-black uppercase tracking-widest transition-all ${m === 'Dia' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                    {m}
                                </button>
                            ))}
                        </nav>
                        <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 flex items-center">
                            <Filter className="w-3.5 h-3.5 mr-2" /> Filtros
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                        <div className="space-y-2 relative">
                            {hours.map((hour, i) => (
                                <div key={i} className="flex space-x-8 group min-h-[80px]">
                                    <div className="w-16 text-right pt-2 border-r border-slate-50 pr-4">
                                        <span className="text-[11px] font-black text-slate-300 uppercase tabular-nums tracking-widest">{hour}</span>
                                    </div>
                                    <div className="flex-1 py-1 relative">
                                        {appointments.filter(a => a.time === hour).map(appt => (
                                            <div key={appt.id} className={`bg-${appt.color}-50/50 border border-${appt.color}-100 rounded-3xl p-5 flex justify-between items-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group/card group-hover:bg-white`}>
                                                <div className="flex space-x-5 items-center">
                                                    <div className={`w-12 h-12 rounded-2xl bg-white border border-${appt.color}-100 flex items-center justify-center text-xl font-black text-${appt.color}-500 shadow-sm group-hover/card:bg-${appt.color}-600 group-hover/card:text-white transition-all`}>
                                                        {appt.pet[0]}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-3">
                                                            <h5 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{appt.pet}</h5>
                                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-${appt.color}-100 text-${appt.color}-700`}>{appt.type}</span>
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 flex items-center tracking-tight">
                                                            <User className="w-3 h-3 mr-2" /> {appt.tutor} • <Phone className="w-3 h-3 ml-4 mr-2" /> (24) 99823-1244
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-6">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{appt.status}</span>
                                                    <button className="p-3 hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-slate-600 transition-all active:scale-90">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {appointments.filter(a => a.time === hour).length === 0 && (
                                            <div className="h-full border-b border-slate-50/50 group-hover:border-slate-100 transition-colors" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Agenda;
