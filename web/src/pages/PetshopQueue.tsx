import React, { useState, useEffect } from 'react';
import {
    Clock,
    Scissors,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    User,
    ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const PetshopQueue = () => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/appointments`);
            if (res.ok) {
                const data = await res.json();
                setAppointments(data.filter((a: any) =>
                    a.type === 'Petshop' &&
                    a.status !== 'COMPLETED' &&
                    a.petshopStatus !== 'Pronto'
                ));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
        const interval = setInterval(fetchAppointments, 5000);
        return () => clearInterval(interval);
    }, []);

    const getStatusInfo = (status: string) => {
        const map: any = {
            'Aguardando': { color: 'bg-slate-100 text-slate-500', label: 'Aguardando', progress: 0 },
            'Banho': { color: 'bg-indigo-50 text-indigo-600', label: 'Em Banho', progress: 25 },
            'Secagem': { color: 'bg-amber-50 text-amber-600', label: 'Secagem', progress: 50 },
            'Tosa': { color: 'bg-purple-50 text-purple-600', label: 'Tosa', progress: 75 },
            'Finalizacao': { color: 'bg-pink-50 text-pink-600', label: 'Finalização', progress: 90 }
        };
        return map[status] || map['Aguardando'];
    };

    // Modals & Professionals
    const [showStartModal, setShowStartModal] = useState(false);
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [pendingAction, setPendingAction] = useState<{ id: number, nextStatus: string } | null>(null);
    const [selectedProId, setSelectedProId] = useState('');

    const fetchProfessionals = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/professionals`);
            if (res.ok) {
                const data = await res.json();
                setProfessionals(data.filter((p: any) => p.active));
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchProfessionals();
    }, []);

    const advanceStatus = async (appointment: any) => {
        const flow = ['Aguardando', 'Banho', 'Secagem', 'Tosa', 'Finalizacao', 'Pronto'];
        const currentStatus = appointment.petshopStatus || 'Aguardando';
        const idx = flow.indexOf(currentStatus);
        const next = flow[idx + 1];

        if (!next) return;

        // If starting service, ask for professional
        if (currentStatus === 'Aguardando' && next === 'Banho') {
            setPendingAction({ id: appointment.id, nextStatus: next });
            setShowStartModal(true);
            return;
        }

        updateStatus(appointment.id, next);
    };

    const confirmStartService = async () => {
        if (!pendingAction || !selectedProId) return;
        const proName = professionals.find(p => p.id.toString() === selectedProId)?.name;

        updateStatus(pendingAction.id, pendingAction.nextStatus, proName);
        setShowStartModal(false);
        setPendingAction(null);
        setSelectedProId('');
    };

    const updateStatus = async (id: number, nextStatus: string, proName?: string) => {
        try {
            await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    petshopStatus: nextStatus,
                    ...(proName && { groomer: proName, status: 'IN_PROGRESS' })
                })
            });
            fetchAppointments();
        } catch (e) {
            console.error(e);
        }
    };

    const getElapsedTime = (dateString: string) => {
        const start = new Date(dateString);
        const diff = Math.floor((currentTime.getTime() - start.getTime()) / 60000);
        return `${diff} min`;
    };

    const getPetDisplayName = (appt: any) => {
        if (appt.pet?.name) return appt.pet.name;
        return appt.notes?.match(/PROVISÓRIO:\s*(.*?)\s*\(Tutor:/)?.[1] || 'Pet Provisório';
    };

    const getTutorDisplayName = (appt: any) => {
        if (appt.pet?.tutor?.name) return appt.pet.tutor.name;
        return appt.notes?.match(/\(Tutor:\s*(.*?)\)/)?.[1] || '---';
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-5xl mx-auto">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Monitoramento em Tempo Real</h2>
                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-1">Linha de Produção & Status Operacional</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-2xl">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Ao Vivo</span>
                </div>
            </header>

            <div className="space-y-4">
                {appointments.map(appt => {
                    const status = getStatusInfo(appt.petshopStatus || 'Aguardando');
                    const petName = getPetDisplayName(appt);
                    const tutorName = getTutorDisplayName(appt);
                    return (
                        <div key={appt.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row items-center gap-6 group">
                            {/* Time & Avatar */}
                            <div className="flex items-center gap-4 min-w-[200px]">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-black text-slate-300">
                                    {petName[0]}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{petName}</h4>
                                    <div className="flex items-center gap-1 mt-1 text-slate-400">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{getElapsedTime(appt.createdAt)}</span>
                                        <span className="ml-2 text-[10px] text-slate-300">({tutorName})</span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Visual */}
                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-end mb-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${status.color}`}>
                                        {status.label}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{status.progress}%</span>
                                </div>
                                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden relative">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out relative overflow-hidden ${status.color.replace('text', 'bg').replace('50', '400')}`}
                                        style={{ width: `${status.progress}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"
                                            style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Início</span>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Conclusão</span>
                                </div>
                            </div>

                            {/* Service & Action */}
                            <div className="flex items-center gap-6 min-w-[250px] justify-end border-t md:border-t-0 border-slate-50 pt-4 md:pt-0 w-full md:w-auto">
                                <div className="text-right">
                                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{appt.service}</p>
                                    <div className="flex items-center justify-end gap-1 mt-0.5 text-slate-400">
                                        <Scissors className="w-3 h-3" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">{appt.groomer || '---'}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => advanceStatus(appt)}
                                    className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-900/10 group/btn"
                                >
                                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {appointments.length === 0 && (
                    <div className="h-64 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 space-y-4">
                        <AlertCircle className="w-10 h-10 opacity-20" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-50">Nenhum serviço em andamento</span>
                    </div>
                )}
            </div>

            {/* Modal Select Professional */}
            {showStartModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowStartModal(false)} />
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <header className="p-6 bg-slate-900 text-white text-center">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Iniciar Atendimento</h3>
                            <p className="text-[10px] text-slate-400 mt-1">Quem irá realizar o serviço?</p>
                        </header>

                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Profissional</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-bold outline-none focus:border-indigo-500 transition-all"
                                    value={selectedProId}
                                    onChange={e => setSelectedProId(e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    {professionals.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={confirmStartService}
                                disabled={!selectedProId}
                                className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all ${selectedProId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-300 cursor-not-allowed'
                                    }`}
                            >
                                Confirmar Início
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PetshopQueue;
