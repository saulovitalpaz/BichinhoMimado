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
    const [appointments, setAppointments] = useState<any[]>([]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        // Fetch Appointments for today
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        try {
            const [apptRes, statsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/appointments?start=${start.toISOString()}&end=${end.toISOString()}`),
                // Assuming we might have a stats endpoint, but for now we'll simulate or reuse
                // If no stats endpoint, we can calc from appointments or leave mocked for now if out of scope
                // User asked to "Update Dashboard List", not necessarily the stats cards, but let's try to be consistent
                Promise.resolve({ ok: true, json: () => ({ patients: 124, appointments: 12, unpaid: 4, occupancy: '85%' }) })
            ]);

            if (apptRes.ok) {
                const data = await apptRes.json();
                // Filter for upcoming (Time > now)
                const now = new Date();
                const upcoming = data
                    .filter((a: any) => new Date(a.date) > now && a.status !== 'COMPLETED' && a.status !== 'CANCELED')
                    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 5);
                setAppointments(upcoming);

                // Update appointment count stat
                setStats(prev => ({ ...prev, appointments: data.length }));
            }
        } catch (e) {
            console.error(e);
        }
    };

    /* ... (StatCard component remains same) ... */

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
            {/* ... (Header remains same) ... */}

            {/* ... (StatCards remain same) ... */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Appointments */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Próximos Atendimentos</h3>
                        <Link to="/agenda" className="text-[10px] font-black text-purple-600 hover:text-purple-700 uppercase tracking-widest">Ver Agenda Completa</Link>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-50 shadow-sm overflow-hidden">
                        {appointments.length === 0 ? (
                            <div className="p-8 text-center text-slate-300 text-xs font-black uppercase tracking-widest">
                                Sem atendimentos futuros hoje
                            </div>
                        ) : (
                            appointments.map((appt, i) => (
                                <div key={appt.id} className={`p-5 flex items-center justify-between hover:bg-slate-50/50 transition-all border-b border-slate-50 last:border-none group cursor-pointer`}>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-500">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-black text-slate-800 leading-none">
                                                {appt.pet?.name || (appt.notes?.includes('PROVISÓRIO') ? appt.notes.split(':')[1]?.split('(')[0]?.trim() : 'Pet Provisório')}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                                                Tutor: {appt.pet?.tutor?.name || (appt.notes?.includes('Tutor:') ? appt.notes.split('Tutor:')[1]?.replace(')', '')?.trim() : '---')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="text-[11px] font-black text-slate-800">
                                                {new Date(appt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-0.5">{appt.service}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
                                    </div>
                                </div>
                            ))
                        )}
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
