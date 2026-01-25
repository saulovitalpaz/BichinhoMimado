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
    Dog
} from 'lucide-react';

const PetshopDashboard = () => {
    // Mock Data
    const banhoList = [
        { id: 1, pet: 'Mel', service: 'Banho + Hidratação', time: '14:00', status: 'In Progress', professional: 'Ana' },
        { id: 2, pet: 'Thor', service: 'Tosa Higiênica', time: '14:40', status: 'Waiting', professional: 'Carlos' },
        { id: 3, pet: 'Lola', service: 'Banho Simples', time: '15:20', status: 'Waiting', professional: 'Ana' }
    ];

    const salesStats = {
        today: 1250.00,
        count: 14,
        topItem: 'Ração Premier 1KG'
    };

    return (
        <div className="grid grid-cols-12 gap-5 animate-in fade-in duration-500">

            {/* Left Column: Operations */}
            <div className="col-span-12 lg:col-span-8 space-y-5">

                {/* Live Kanban / Queue */}
                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden min-h-[300px]">
                    <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-5 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <Scissors className="w-5 h-5" />
                            <h3 className="font-black uppercase tracking-widest text-sm">Fila de Banho e Tosa</h3>
                        </div>
                        <span className="bg-white/20 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest">3 Pets na Fila</span>
                    </div>

                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {banhoList.map((item, i) => (
                            <div key={item.id} className={`p-4 rounded-3xl border-2 ${i === 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'} relative group`}>
                                {i === 0 && (
                                    <div className="absolute -top-3 left-4 bg-orange-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest shadow-sm">
                                        Em Execução
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-lg font-black text-slate-300 shadow-sm border border-slate-50">
                                        {item.pet[0]}
                                    </div>
                                    <span className="text-xs font-black text-slate-400 tabular-nums">{item.time}</span>
                                </div>
                                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">{item.pet}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.service}</p>
                                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-[10px] font-bold text-slate-500">
                                    <User className="w-3 h-3 mr-1" /> {item.professional}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stock Alert */}
                <div className="flex gap-4">
                    <div className="flex-1 bg-red-50 border border-red-100 rounded-[24px] p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-500">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-red-800 text-xs uppercase tracking-widest">Estoque Baixo</h4>
                                <p className="text-xs text-red-600 font-medium mt-1">Shampoo Branqueador (1 un) • Perfume Baby (2 un)</p>
                            </div>
                        </div>
                        <button className="bg-white text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors">
                            Repor
                        </button>
                    </div>

                    <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-[24px] p-5 flex items-center justify-between">
                        <div>
                            <h4 className="font-black text-emerald-800 text-xs uppercase tracking-widest">Meta do Dia</h4>
                            <p className="text-2xl font-black text-emerald-600 mt-1 tabular-nums">85%</p>
                        </div>
                        <div className="w-16 h-16 relative">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-emerald-200" />
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="175" strokeDashoffset="26" className="text-emerald-500" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>

            </div>

            {/* Right Column: Sales & Quick Actions */}
            <div className="col-span-12 lg:col-span-4 space-y-5">

                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">Faturamento Hoje</h3>
                    <p className="text-4xl font-black text-slate-800 relative z-10 tabular-nums">R$ {salesStats.today.toFixed(2)}</p>

                    <div className="mt-6 space-y-3 relative z-10">
                        <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-2xl border border-slate-50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendas</span>
                            <span className="text-sm font-bold text-slate-700">{salesStats.count}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-2xl border border-slate-50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Item</span>
                            <span className="text-xs font-bold text-slate-700">{salesStats.topItem}</span>
                        </div>
                    </div>

                    <button className="w-full mt-6 bg-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-purple-100 hover:bg-purple-700 active:scale-95 transition-all">
                        <ShoppingBag className="w-4 h-4" /> Novo Pedido
                    </button>
                </div>

                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Próximos Agendamentos</h3>
                    <div className="space-y-4">
                        {[
                            { time: '16:00', pet: 'Belinha', type: 'Tosa Bebê' },
                            { time: '17:30', pet: 'Max', type: 'Banho' }
                        ].map((appt, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="text-right w-12">
                                    <p className="text-xs font-black text-slate-800">{appt.time}</p>
                                </div>
                                <div className="w-1 h-10 bg-slate-100 rounded-full relative">
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-orange-400 rounded-full"></div>
                                </div>
                                <div className="flex-1 bg-slate-50/50 p-2 rounded-xl flex justify-between items-center border border-slate-50">
                                    <span className="text-xs font-bold text-slate-700">{appt.pet}</span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase">{appt.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
};

export default PetshopDashboard;
