import React, { useState, useEffect } from 'react';
import {
    Scissors,
    ShoppingBag,
    Package,
    Clock,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Calendar,
    User,
    Dog,
    ArrowUpRight,
    Search
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';

const PetshopDashboard = () => {
    const [stats, setStats] = useState({
        revenueToday: 0,
        salesCount: 0,
        lowStock: [] as any[]
    });
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, apptRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/petshop/stats`),
                    fetch(`${API_BASE_URL}/api/appointments`)
                ]);

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                if (apptRes.ok) {
                    const apptData = await apptRes.json();
                    setAppointments(apptData.filter((a: any) => a.type === 'Petshop').slice(0, 5));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const activeQueue = appointments.filter(a => a.petshopStatus !== 'Pronto' && a.petshopStatus !== 'Finalizado').slice(0, 3);

    const handleCheckIn = async (appointmentId: number) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'CHECKED_IN',
                    petshopStatus: 'Aguardando'
                })
            });

            if (res.ok) {
                // Refresh data
                const [statsRes, apptRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/petshop/stats`),
                    fetch(`${API_BASE_URL}/api/appointments`)
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (apptRes.ok) {
                    const apptData = await apptRes.json();
                    setAppointments(apptData.filter((a: any) => a.type === 'Petshop').slice(0, 5));
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard Petshop</h2>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-1">Centro de Controle Operacional</p>
                </div>
                <div className="flex gap-4">
                    <Link to="/agenda" className="bg-indigo-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center active:scale-95">
                        <Calendar className="w-4 h-4 mr-2" />
                        Novo Agendamento
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Ops */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* Active Queue */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden min-h-[300px]">
                        <header className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <Scissors className="w-5 h-5 text-indigo-400" />
                                <span className="font-black text-[11px] uppercase tracking-[0.2em]">Fila de Estética (Andamento)</span>
                            </div>
                            <span className="bg-white/10 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none">
                                {activeQueue.length} em execução
                            </span>
                        </header>

                        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeQueue.map((item, i) => (
                                <div key={item.id} className={`p-6 rounded-[2rem] border transition-all ${i === 0 ? 'bg-indigo-50 border-indigo-100 shadow-xl shadow-indigo-100/20' : 'bg-white border-slate-50 shadow-sm hover:shadow-lg'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black ${i === 0 ? 'bg-white text-indigo-600 shadow-sm' : 'bg-slate-50 text-slate-300'}`}>
                                            {item.pet?.name?.[0]}
                                        </div>
                                        <span className={`text-[10px] font-black tabular-nums ${i === 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                                            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h4 className="font-black text-slate-800 text-[13px] uppercase tracking-tight leading-none">{item.pet?.name}</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.service}</p>
                                    <div className="mt-4 pt-4 border-t border-slate-100/50 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.petshopStatus || 'Aguardando'}</span>
                                        </div>
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{item.groomer || 'Pendente'}</span>
                                    </div>
                                </div>
                            ))}
                            {activeQueue.length === 0 && (
                                <div className="col-span-full h-full flex flex-col items-center justify-center text-slate-200 py-12">
                                    <Scissors className="w-12 h-12 mb-4 opacity-20" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Fila vazia no momento</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Meta/Alerts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={`p-8 rounded-[2.5rem] border flex items-center justify-between group overflow-hidden relative ${stats.lowStock.length > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                                <AlertCircle className={`w-32 h-32 ${stats.lowStock.length > 0 ? 'text-red-900' : 'text-slate-900'}`} />
                            </div>
                            <div className="relative z-10">
                                <h4 className={`text-[10px] font-black uppercase tracking-widest ${stats.lowStock.length > 0 ? 'text-red-800' : 'text-slate-400'}`}>Alertas de Estoque</h4>
                                <p className={`text-sm font-bold mt-2 leading-tight ${stats.lowStock.length > 0 ? 'text-red-900' : 'text-slate-600'}`}>
                                    {stats.lowStock.length > 0
                                        ? stats.lowStock.map(p => `${p.name} (${p.stock} un)`).slice(0, 2).join('\n')
                                        : 'Tudo em conformidade'}
                                </p>
                            </div>
                            <Link to="/estoque" className={`relative z-10 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm transition-all ${stats.lowStock.length > 0 ? 'bg-white text-red-600 hover:bg-red-600 hover:text-white' : 'bg-white text-slate-600 hover:bg-slate-900 hover:text-white'
                                }`}>
                                Ver Tudo
                            </Link>
                        </div>

                        <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 flex items-center justify-between group overflow-hidden relative">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                                <TrendingUp className="w-32 h-32 text-emerald-900" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Meta de Vendas</h4>
                                <p className="text-3xl font-black text-emerald-900 mt-2 tabular-nums">98%</p>
                            </div>
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-2 shadow-sm">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-100" strokeWidth="3" />
                                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-500" strokeWidth="3" strokeDasharray="100" strokeDashoffset="2" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    {/* Next Up / Check-in */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm relative overflow-hidden">
                        <header className="flex justify-between items-center mb-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agenda: Próximos</h3>
                            <button onClick={() => window.location.reload()} className="text-slate-300 hover:text-indigo-500 transition-colors"><Clock className="w-4 h-4" /></button>
                        </header>

                        <div className="space-y-3">
                            {appointments.filter(a => a.status === 'SCHEDULED').slice(0, 4).map((appt, i) => (
                                <div key={i} className="flex items-center gap-3 group">
                                    <div className="flex-1 p-4 bg-slate-50/50 rounded-2xl border border-slate-50 flex justify-between items-center group-hover:border-indigo-100 transition-all">
                                        <div>
                                            <span className="text-[10px] font-black text-slate-800 block uppercase tracking-tight">{appt.pet?.name}</span>
                                            <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-widest mt-0.5">{new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {appt.service}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleCheckIn(appt.id)}
                                        className="h-full px-4 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest flex flex-col items-center justify-center gap-1 shadow-sm opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                                        title="Iniciar Atendimento / Check-in"
                                    >
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {appointments.filter(a => a.status === 'SCHEDULED').length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Sem próximos agendamentos</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Vendas Hoje</h3>
                        <p className="text-4xl font-black text-slate-800 mt-2 tabular-nums relative z-10 tracking-tighter">R$ {stats.revenueToday.toFixed(2).replace('.', ',')}</p>

                        <div className="mt-8 space-y-4 relative z-10">
                            <div className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transações</span>
                                <span className="text-sm font-black text-slate-700">{stats.salesCount}</span>
                            </div>
                        </div>

                        <Link to="/finance" className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]">
                            <ShoppingBag className="w-4 h-4 text-orange-400" />
                            <span>Abrir PDV</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PetshopDashboard;
