import React, { useState, useEffect } from 'react';
import {
    Plus,
    Clock,
    MapPin,
    MessageSquare,
    Truck,
    Bath,
    Scissors,
    Calendar,
    Grid,
    CheckCircle2,
    ChevronRight
} from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Appointment {
    id: number;
    pet: { name: string };
    service: string;
    petshopStatus?: string;
    taxiDog?: boolean;
}

const Petshop = () => {
    const [viewMode, setViewMode] = useState('kanban');
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const columns = [
        { id: 'Aguardando', label: 'Aguardando', color: 'bg-slate-100 text-slate-500' },
        { id: 'Banho', label: 'Em Banho', color: 'bg-indigo-50 text-indigo-600' },
        { id: 'Secagem', label: 'Secagem', color: 'bg-amber-50 text-amber-600' },
        { id: 'Tosa', label: 'Tosa', color: 'bg-purple-50 text-purple-600' },
        { id: 'Pronto', label: 'Finalizado', color: 'bg-emerald-50 text-emerald-600' }
    ];

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/appointments`);
                if (res.ok) {
                    const data = await res.json();
                    setAppointments(data.filter((a: any) => a.type === 'Petshop'));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const advanceStatus = (id: number) => {
        setAppointments(prev => prev.map(a => {
            if (a.id === id) {
                const currentStatus = a.petshopStatus || 'Aguardando';
                const idx = columns.findIndex(c => c.id === currentStatus);
                const next = columns[idx + 1]?.id || currentStatus;
                return { ...a, petshopStatus: next };
            }
            return a;
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Estética & Banho</h2>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-1">Fluxo operacional e monitoramento de serviços</p>
                </div>
                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Lista</button>
                    <button onClick={() => setViewMode('kanban')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'kanban' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Quadro</button>
                </div>
            </header>

            <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar">
                {columns.map(col => {
                    const items = appointments.filter(a => (a.petshopStatus || 'Aguardando') === col.id);
                    return (
                        <div key={col.id} className="min-w-[300px] flex flex-col space-y-4">
                            <div className={`p-4 rounded-[1.5rem] ${col.color} border border-transparent shadow-sm flex justify-between items-center`}>
                                <span className="text-[10px] font-black uppercase tracking-[0.15em]">{col.label}</span>
                                <span className="bg-white/50 px-2 py-0.5 rounded-lg text-[9px] font-black">{items.length}</span>
                            </div>

                            <div className="flex-1 space-y-4">
                                {items.map(appt => (
                                    <div key={appt.id} className="bg-white p-5 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all group">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100/50 flex items-center justify-center text-lg font-black text-slate-300">
                                                {appt.pet?.name?.[0]}
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-black text-slate-800 leading-tight uppercase tracking-tight">{appt.pet?.name}</h4>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{appt.service}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50/50">
                                            {appt.taxiDog && (
                                                <div className="flex items-center space-x-1.5 text-orange-500">
                                                    <Truck className="w-3.5 h-3.5" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Taxi Dog</span>
                                                </div>
                                            )}
                                            <button onClick={() => advanceStatus(appt.id)} className="ml-auto p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {items.length === 0 && (
                                    <div className="h-32 rounded-[2rem] border-2 border-dashed border-slate-50 flex items-center justify-center text-slate-200">
                                        <Grid className="w-6 h-6 opacity-20" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Petshop;
