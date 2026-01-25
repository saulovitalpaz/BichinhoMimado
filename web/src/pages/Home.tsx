import React, { useState, useEffect } from 'react';
import {
    Activity,
    TrendingUp,
    Users,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        patients: 124,
        appointments: 12,
        unpaid: 4,
        occupancy: '85%'
    });

    const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
        <div className="bg-white p-5 rounded-3xl border border-slate-50 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-2xl ${color} bg-opacity-10 text-opacity-90`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className="flex items-center space-x-1 text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{trend}%</span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">{title}</p>
                <p className="text-2xl font-black text-slate-800 tracking-tighter mt-1">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
            {/* Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        Olá, <span className="text-purple-600">{user?.name}</span>! 👋
                    </h1>
                    <p className="text-slate-400 text-[12px] font-medium mt-1">Hoje é {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Buscar prontuário..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-2xl text-[11px] font-medium focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500/50 transition-all w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Pacientes Ativos" value={stats.patients} icon={Activity} color="bg-emerald-500 text-emerald-600" trend={5} />
                <StatCard title="Agendados Hoje" value={stats.appointments} icon={Calendar} color="bg-blue-500 text-blue-600" />
                <StatCard title="Pendências" value={stats.unpaid} icon={AlertCircle} color="bg-amber-500 text-amber-600" />
                <StatCard title="Ocupação" value={stats.occupancy} icon={Clock} color="bg-purple-500 text-purple-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Appointments */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Próximos Atendimentos</h3>
                        <button className="text-[10px] font-black text-purple-600 hover:text-purple-700 uppercase tracking-widest">Ver Agenda Completa</button>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-50 shadow-sm overflow-hidden">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className={`p-5 flex items-center justify-between hover:bg-slate-50/50 transition-all border-b border-slate-50 last:border-none group cursor-pointer`}>
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-500">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-black text-slate-800 leading-none">Rex (Golden Retriever)</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Tutor: Maria Silva</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <p className="text-[11px] font-black text-slate-800">10:30</p>
                                        <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-0.5">Consulta</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* News / Notifications */}
                <div className="space-y-4">
                    <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Avisos do Sistema</h3>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Activity className="w-24 h-24" />
                        </div>
                        <div className="relative z-10">
                            <div className="bg-white/10 w-fit p-2 rounded-xl backdrop-blur-md mb-4">
                                <AlertCircle className="w-5 h-5 text-amber-400" />
                            </div>
                            <h4 className="text-sm font-black tracking-tight mb-2 uppercase">Lembrete de Estoque</h4>
                            <p className="text-[11px] text-slate-300 leading-relaxed">Existem 3 itens abaixo do estoque mínimo. Verifique a aba de compras.</p>
                            <button className="mt-6 w-full py-2.5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-lg">
                                Corrigir Agora
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
