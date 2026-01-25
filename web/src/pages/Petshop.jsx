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
import { fetchAppointments } from '../utils/api';

const Petshop = () => {
    const [viewMode, setViewMode] = useState('kanban'); // 'list' or 'kanban'
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Kanban Columns Definition
    const columns = [
        { id: 'Aguardando', label: 'Aguardando', color: 'bg-slate-100 text-slate-500' },
        { id: 'Banho', label: 'Em Banho', color: 'bg-blue-100 text-blue-600' },
        { id: 'Secagem', label: 'Secagem', color: 'bg-orange-100 text-orange-600' },
        { id: 'Tosa', label: 'Tosa', color: 'bg-purple-100 text-purple-600' },
        { id: 'Finalizacao', label: 'Finalização', color: 'bg-emerald-100 text-emerald-600' },
        { id: 'Pronto', label: 'Pronto', color: 'bg-indigo-100 text-indigo-600' }
    ];

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchAppointments();
                // Filter only Petshop appointments if needed, currently API returns all
                const petshopAppts = data.filter(a => a.type === 'Petshop');
                setAppointments(petshopAppts);
                setLoading(false);
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const getNextStatus = (currentStatus) => {
        const idx = columns.findIndex(c => c.id === currentStatus);
        if (idx !== -1 && idx < columns.length - 1) {
            return columns[idx + 1].id;
        }
        return null;
    };

    const advanceStatus = (apptId) => {
        // Optimistic update
        setAppointments(prev => prev.map(a => {
            if (a.id === apptId) {
                const next = getNextStatus(a.petshopStatus || 'Aguardando');
                return next ? { ...a, petshopStatus: next } : a;
            }
            return a;
        }));
        // TODO: Call API to update status backend
    };

    if (loading) return <div className="p-10 text-center text-slate-400">Carregando agenda...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Estética & Bem-estar</h3>
                    <p className="text-sm text-slate-500 font-medium">Gestão de fluxo de trabalho (Kanban)</p>
                </div>
                <div className="flex space-x-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Calendar className="w-4 h-4 mr-2" />
                        Lista
                    </button>
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Grid className="w-4 h-4 mr-2" />
                        Quadro
                    </button>
                </div>
            </div>

            {viewMode === 'kanban' ? (
                <div className="flex space-x-4 overflow-x-auto pb-6">
                    {columns.map(col => {
                        const items = appointments.filter(a => (a.petshopStatus || 'Aguardando') === col.id);

                        return (
                            <div key={col.id} className="min-w-[280px] w-full bg-slate-50/50 rounded-3xl p-4 border border-slate-100 flex flex-col h-[calc(100vh-250px)]">
                                <div className={`p-3 rounded-xl mb-4 font-black text-xs uppercase tracking-widest flex justify-between items-center ${col.color}`}>
                                    {col.label}
                                    <span className="bg-white/50 px-2 py-0.5 rounded text-[10px]">{items.length}</span>
                                </div>

                                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    {items.map(appt => (
                                        <div key={appt.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-xs text-indigo-700">
                                                        {appt.pet?.name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{appt.pet?.name}</p>
                                                        <p className="text-[10px] text-slate-500">{appt.service || 'Banho'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                {appt.taxiDog && (
                                                    <div className="flex items-center text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded">
                                                        <Truck className="w-3 h-3 mr-1" /> TAXI
                                                    </div>
                                                )}
                                                <div className="ml-auto">
                                                    {getNextStatus(col.id) && (
                                                        <button onClick={() => advanceStatus(appt.id)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors" title="Avançar Etapa">
                                                            <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {items.length === 0 && (
                                        <div className="h-20 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-300 text-xs font-bold uppercase">
                                            Vazio
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Simple List View implementation if needed, reusing previous logic but updated */}
                    <div className="p-8 text-center text-slate-400">
                        Visualização em lista simplificada. Mude para "Quadro" para ver o fluxo.
                    </div>
                </div>
            )}
        </div>
    );
};

export default Petshop;
