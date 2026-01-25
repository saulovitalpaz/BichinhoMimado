import React, { useState } from 'react';
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
    ArrowUpRight
} from 'lucide-react';

const PetshopDashboard = () => {
    const banhoList = [
        { id: 1, pet: 'Mel', service: 'Banho + Hidratação', time: '14:00', status: 'Em Execução', professional: 'Ana' },
        { id: 2, pet: 'Thor', service: 'Tosa Higiênica', time: '14:40', status: 'Aguardando', professional: 'Carlos' },
        { id: 3, pet: 'Lola', service: 'Banho Simples', time: '15:20', status: 'Aguardando', professional: 'Ana' }
    ];

    const stats = {
        faturamento: 1250.00,
        vendas: 14,
        topItem: 'Ração Premier 1KG'
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <header>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard Petshop</h2>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-1">Visão geral de vendas e fluxo de estética</p>
            </header>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Ops */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* Active Queue */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
                        <header className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <Scissors className="w-5 h-5 text-indigo-400" />
                                <span className="font-black text-[11px] uppercase tracking-[0.2em]">Fila de Estética</span>
                            </div>
                            <span className="bg-white/10 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none">3 em fila</span>
                        </header>

                        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {banhoList.map((item, i) => (
                                <div key={item.id} className={`p-6 rounded-[2rem] border transition-all ${i === 0 ? 'bg-indigo-50 border-indigo-100 shadow-xl shadow-indigo-100/20' : 'bg-white border-slate-50 shadow-sm hover:shadow-lg'
                                    }`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black ${i === 0 ? 'bg-white text-indigo-600 shadow-sm' : 'bg-slate-50 text-slate-300'
                                            }`}>
                                            {item.pet[0]}
                                        </div>
                                        <span className={`text-[10px] font-black tabular-nums ${i === 0 ? 'text-indigo-600' : 'text-slate-400'}`}>{item.time}</span>
                                    </div>
                                    <h4 className="font-black text-slate-800 text-[13px] uppercase tracking-tight leading-none">{item.pet}</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.service}</p>
                                    <div className="mt-4 pt-4 border-t border-slate-100/50 flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.professional}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Meta/Alerts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 flex items-center justify-between group overflow-hidden relative">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                                <AlertCircle className="w-32 h-32 text-red-900" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-[10px] font-black text-red-800 uppercase tracking-widest">Alerta de Estoque</h4>
                                <p className="text-sm font-bold text-red-900 mt-2 leading-tight">Shampoo Neutro (2 un)<br />Condicionador Baby (1 un)</p>
                            </div>
                            <button className="relative z-10 bg-white text-red-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-red-600 hover:text-white transition-all">Repor</button>
                        </div>

                        <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 flex items-center justify-between group overflow-hidden relative">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                                <TrendingUp className="w-32 h-32 text-emerald-900" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Meta de Vendas</h4>
                                <p className="text-3xl font-black text-emerald-900 mt-2 tabular-nums">92%</p>
                            </div>
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-2 shadow-sm">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-100" strokeWidth="3" />
                                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-500" strokeWidth="3" strokeDasharray="100" strokeDashoffset="8" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Vendas Hoje</h3>
                        <p className="text-4xl font-black text-slate-800 mt-2 tabular-nums relative z-10 tracking-tighter">R$ {stats.faturamento.toFixed(2).replace('.', ',')}</p>

                        <div className="mt-8 space-y-4 relative z-10">
                            <div className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transações</span>
                                <span className="text-sm font-black text-slate-700">{stats.vendas}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destaque</span>
                                <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{stats.topItem}</span>
                            </div>
                        </div>

                        <button className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]">
                            <ShoppingBag className="w-4 h-4 text-indigo-400" />
                            <span>Abrir PDV</span>
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
                        <header className="flex justify-between items-center mb-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próximos Horários</h3>
                            <Calendar className="w-4 h-4 text-slate-300" />
                        </header>
                        <div className="space-y-4">
                            {[
                                { time: '16:00', pet: 'Belinha', type: 'Tosa Bebê' },
                                { time: '17:30', pet: 'Max', type: 'Banho' }
                            ].map((appt, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <span className="text-[11px] font-black text-slate-800 tabular-nums w-12">{appt.time}</span>
                                    <div className="flex-1 p-3 bg-slate-50/50 rounded-2xl border border-slate-50 flex justify-between items-center px-4 hover:border-indigo-100 transition-colors">
                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{appt.pet}</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{appt.type}</span>
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

export default PetshopDashboard;
