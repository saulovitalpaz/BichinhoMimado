import React, { useEffect, useState } from 'react';
import {
    Users,
    Dog,
    Activity,
    TrendingUp,
    Clock,
    AlertTriangle,
    Github,
    User,
    MoreVertical,
    Calendar,
    Play,
    CheckCircle2,
    Stethoscope,
    Scissors,
    BedDouble,
    Pill
} from 'lucide-react';
import { fetchTutors, fetchPets, fetchAppointments } from '../utils/api';

const Home = () => {
    const [data, setData] = useState({
        tutors: [],
        pets: [],
        appointments: [],
        inProgressAppointments: [],
        completedAppointments: [],
        loading: true
    });

    const [internationAlerts, setInternationAlerts] = useState([
        { pet: 'Billy', medication: 'Dipirona 3ml', time: '14:00', urgent: true }
    ]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [tutors, pets, appointments] = await Promise.all([
                    fetchTutors(),
                    fetchPets(),
                    fetchAppointments()
                ]);

                const inProgress = appointments.filter(a => a.status !== 'Completed' && a.status !== 'Canceled');
                const completed = appointments.filter(a => a.status === 'Completed').sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

                setData({
                    tutors,
                    pets: pets.slice(0, 50),
                    appointments,
                    inProgressAppointments: inProgress,
                    completedAppointments: completed,
                    loading: false
                });
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                setData(prev => ({ ...prev, loading: false }));
            }
        };
        loadData();
    }, []);

    if (data.loading) return <div className="p-10 text-center text-slate-400 text-sm">Carregando painel...</div>;

    return (
        <div className="grid grid-cols-12 gap-4 animate-in fade-in duration-500">

            {/* Left Main Column */}
            <div className="col-span-12 lg:col-span-9 space-y-4">

                {/* Top: Atendimentos em Andamento */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[250px]">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2.5 text-white font-bold flex justify-between items-center text-[11px] uppercase tracking-wider">
                        <div className="flex items-center">
                            <Play className="w-3.5 h-3.5 mr-2 fill-current" />
                            Atendimentos em Andamento
                        </div>
                        <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">{data.inProgressAppointments.length} Ativos</span>
                    </div>

                    <div className="flex-1 overflow-x-auto p-1">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Hora</th>
                                    <th className="px-3 py-2 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                                    <th className="px-3 py-2 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Serviço</th>
                                    <th className="px-3 py-2 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-3 py-2 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data.inProgressAppointments.length > 0 ? data.inProgressAppointments.map((appt) => (
                                    <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-3 py-1.5 whitespace-nowrap text-xs text-slate-500 font-bold">
                                            {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-3 py-1.5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600 mr-2 shadow-sm">
                                                    {appt.pet?.name?.[0]}
                                                </div>
                                                <div className="text-xs font-bold text-slate-700">{appt.pet?.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-1.5 whitespace-nowrap">
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                                {appt.type === 'Clinical' ? <Stethoscope className="w-3 h-3 mr-1" /> : <Scissors className="w-3 h-3 mr-1" />}
                                                {appt.service || appt.type}
                                            </span>
                                        </td>
                                        <td className="px-3 py-1.5 whitespace-nowrap">
                                            <span className="text-[10px] font-black text-orange-500 uppercase">{appt.petshopStatus || appt.status}</span>
                                        </td>
                                        <td className="px-3 py-1.5 whitespace-nowrap text-right">
                                            <button className="text-indigo-600 hover:text-indigo-800 text-[10px] font-black uppercase tracking-tighter hover:bg-indigo-50 px-2 py-1 rounded transition-all">Abrir</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-xs text-slate-400 italic">
                                            Nenhum atendimento ativo.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Aviso de Sistema */}
                <div className="bg-orange-50/50 border border-orange-100 p-3 rounded-xl flex items-center justify-between h-fit w-full shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="font-black text-orange-800 text-[10px] uppercase tracking-wider">Avisos do Sistema</h4>
                            <p className="text-[11px] text-orange-700">Estoque crítico: Vacina V10 (3 un). Backup realizado às 03:00.</p>
                        </div>
                    </div>
                    <button className="text-[10px] font-black text-orange-600 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-all uppercase tracking-tighter">Ver Todos</button>
                </div>

            </div>

            {/* Right Column: Stats & History */}
            <div className="col-span-12 lg:col-span-3 space-y-4">

                {/* Internados V2 - Smart Notification Widget */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-purple-600 p-2.5 flex justify-between items-center text-white">
                        <div className="flex items-center text-[11px] font-bold uppercase tracking-wider">
                            <BedDouble className="w-3.5 h-3.5 mr-2" />
                            Internação
                        </div>
                        <span className="bg-white/20 px-2 py-0.5 rounded text-[9px] font-bold">5 Pacientes</span>
                    </div>

                    {/* Alert Section */}
                    {internationAlerts.length > 0 && (
                        <div className="bg-red-50 p-2.5 border-b border-red-100 animate-in slide-in-from-top duration-300">
                            <div className="flex items-start text-red-700">
                                <Pill className="w-3.5 h-3.5 mr-2 mt-0.5 flex-shrink-0 animate-bounce" />
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-tighter">Medicamento Pendente</p>
                                    <p className="text-xs font-bold leading-none mt-1">{internationAlerts[0].pet} • {internationAlerts[0].medication}</p>
                                    <p className="text-[9px] font-bold opacity-70 mt-1 uppercase italic">{internationAlerts[0].time}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Compact List */}
                    <div className="p-1 space-y-0.5">
                        {['Billy', 'Maria Flor', 'Tedy', 'Saymon', 'Meg'].map((pet, idx) => (
                            <div key={idx} className="flex justify-between items-center p-1.5 hover:bg-slate-50 rounded-lg transition-all text-xs border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                                    <span className="font-bold text-slate-700">{pet}</span>
                                </div>
                                <span className="text-[9px] font-black text-slate-400 tabular-nums">LEITO {(idx + 1).toString().padStart(2, '0')}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Histórico Recente */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[280px]">
                    <div className="bg-slate-50 p-2.5 border-b border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Histórico Recente</span>
                        <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-1 custom-scrollbar space-y-0.5">
                        {data.completedAppointments.length > 0 ? data.completedAppointments.map((appt, idx) => (
                            <div key={idx} className="p-2 border border-transparent hover:border-slate-100 rounded-lg hover:bg-slate-50 flex items-start gap-2.5 transition-all">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-xs font-bold text-slate-700 truncate">{appt.pet?.name}</span>
                                        <span className="text-[9px] font-bold text-slate-400 tabular-nums">{new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter truncate">{appt.service || appt.type}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="p-6 text-center text-xs text-slate-400 italic">Sem histórico.</div>
                        )}
                    </div>
                </div>

                {/* Agenda do Dia */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center">
                        <Calendar className="w-3 h-3 mr-1.5" />
                        Agenda do Dia
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50/50 p-1.5 rounded-lg border border-blue-100">
                            <p className="text-[14px] font-black text-blue-600 leading-none">4</p>
                            <p className="text-[8px] font-bold text-blue-500 uppercase mt-1">Consultas</p>
                        </div>
                        <div className="bg-pink-50/50 p-1.5 rounded-lg border border-pink-100">
                            <p className="text-[14px] font-black text-pink-600 leading-none">12</p>
                            <p className="text-[8px] font-bold text-pink-500 uppercase mt-1">Estética</p>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Home;
