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
    Phone
} from 'lucide-react';

const Agenda = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const appointments = [
        { id: 1, time: '09:00', pet: 'Billy', tutor: 'Maria', type: 'Consulta', status: 'Confirmado', color: 'blue' },
        { id: 2, time: '10:30', pet: 'Maria Flor', tutor: 'Joana', type: 'Vacina', status: 'Aguardando', color: 'red' },
        { id: 3, time: '11:00', pet: 'Tedy', tutor: 'Carlos', type: 'Estética', status: 'Em andamento', color: 'pink' },
        { id: 4, time: '14:00', pet: 'Saymon', tutor: 'Ana', type: 'Retorno', status: 'Confirmado', color: 'emerald' },
        { id: 5, time: '15:30', pet: 'Meg', tutor: 'Roberto', type: 'Cirurgia', status: 'Confirmado', color: 'orange' },
    ];

    const hours = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header Controls */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-purple-600 transition-all shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
                        <div className="px-6 font-black text-slate-700 uppercase tracking-widest text-sm flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-purple-600" />
                            24 de Janeiro, 2026
                        </div>
                        <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-purple-600 transition-all shadow-sm"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                    <button className="text-xs font-black text-purple-600 bg-purple-50 px-4 py-2 rounded-2xl uppercase tracking-widest hover:bg-purple-100">Hoje</button>
                </div>

                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input type="text" placeholder="Buscar na agenda..." className="bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-2 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all w-64" />
                    </div>
                    <button className="bg-purple-600 text-white px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-200 hover:bg-purple-700 active:scale-95 transition-all">
                        <Plus className="w-4 h-4 mr-2 inline" /> Agendar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Mini Calendar / Stats Sidebar */}
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Resumo do Dia</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Confirmados', val: 18, color: 'emerald' },
                                { label: 'Aguardando', val: 4, color: 'amber' },
                                { label: 'Cancelados', val: 1, color: 'red' }
                            ].map((stat, i) => (
                                <div key={i} className={`p-3 rounded-2xl bg-${stat.color}-50 border border-${stat.color}-100 flex justify-between items-center`}>
                                    <span className={`text-[10px] font-black text-${stat.color}-700 uppercase tracking-widest`}>{stat.label}</span>
                                    <span className={`text-lg font-black text-${stat.color}-700`}>{stat.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                            <Play className="w-16 h-16 text-white fill-current" />
                        </div>
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Próximo na Fila</p>
                        <h4 className="text-white font-black text-xl mt-2">Maria Flor</h4>
                        <p className="text-indigo-100 text-xs mt-1 font-bold">Protocolo Vacinal • 10:30</p>
                        <button className="mt-4 w-full bg-white text-indigo-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-xl transition-all">Iniciar Atendimento</button>
                    </div>
                </div>

                {/* Main Schedule View */}
                <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex gap-4">
                            <button className="text-xs font-black text-purple-600 border-b-2 border-purple-600 pb-0.5">Dia</button>
                            <button className="text-xs font-black text-slate-400 hover:text-slate-600 pb-0.5 transition-colors">Semana</button>
                            <button className="text-xs font-black text-slate-400 hover:text-slate-600 pb-0.5 transition-colors">Mês</button>
                        </div>
                        <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-purple-600"><Filter className="w-3 h-3 inline mr-1" /> Filtros</button>
                    </div>

                    <div className="p-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                        <div className="space-y-1 relative">
                            {/* Current Time Indicator Overlay (Decorative) */}
                            <div className="absolute left-16 right-0 top-[120px] h-0.5 bg-red-400/30 z-10 flex items-center">
                                <div className="w-2 h-2 rounded-full bg-red-400 -ml-1 shadow-sm"></div>
                            </div>

                            {hours.map((hour, i) => (
                                <div key={i} className="flex gap-4 group min-h-[60px]">
                                    <div className="w-12 text-right">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tabular-nums">{hour}</span>
                                    </div>
                                    <div className="flex-1 border-t border-slate-50 group-hover:border-slate-100 transition-colors py-3 relative">
                                        {appointments.filter(a => a.time === hour).map(appt => (
                                            <div key={appt.id} className={`bg-${appt.color}-50 border border-${appt.color}-100 rounded-2xl p-3 flex justify-between items-center shadow-sm hover:shadow-md transition-all cursor-pointer group/card`}>
                                                <div className="flex gap-4 items-center">
                                                    <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center text-${appt.color}-600 font-black shadow-sm group-hover/card:scale-110 transition-transform`}>
                                                        {appt.pet[0]}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-tight">{appt.pet}</h5>
                                                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-${appt.color}-200/30 text-${appt.color}-700`}>{appt.type}</span>
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 flex items-center">
                                                            <User className="w-2.5 h-2.5 mr-1" /> {appt.tutor} • <Phone className="w-2.5 h-2.5 ml-2 mr-1" /> (24) 998...
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{appt.status}</span>
                                                    </div>
                                                    <button className="p-2 hover:bg-white rounded-xl text-slate-300 hover:text-slate-600 transition-all">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

// Help icons
const Play = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="5 3 19 12 5 21 5 3" /></svg>
);

export default Agenda;
