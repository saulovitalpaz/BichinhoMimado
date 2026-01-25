import React, { useState } from 'react';
import {
    Search,
    MoreHorizontal,
    Clock,
    User,
    Activity,
    AlertCircle,
    BedDouble,
    FileText,
    Syringe,
    CheckCircle2,
    X,
    Plus
} from 'lucide-react';

interface Patient {
    id: number;
    pet: string;
    breed: string;
    weight: number;
    tutor: string;
    box: string;
    status: string;
    predictedDischarge: string;
    color: string;
}

const Internation = () => {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [activeTab, setActiveTab] = useState('map');

    const [patients] = useState<Patient[]>([
        { id: 1, pet: 'Billy', breed: 'Yorkshire', weight: 3.5, tutor: 'Maria', box: '01', status: 'Estável', predictedDischarge: '2 dias', color: 'border-l-4 border-indigo-500' },
        { id: 2, pet: 'Maria Flor', breed: 'Bulldog', weight: 11.2, tutor: 'Joana', box: 'UTI-02', status: 'Crítico', predictedDischarge: '5 dias', color: 'border-l-4 border-red-500' },
        { id: 3, pet: 'Tedy', breed: 'Shih-tzu', weight: 5.9, tutor: 'Carlos', box: '03', status: 'Observação', predictedDischarge: '1 dia', color: 'border-l-4 border-amber-500' }
    ]);

    const PatientCard = ({ patient }: { patient: Patient }) => (
        <div
            onClick={() => setSelectedPatient(patient)}
            className={`bg-white p-5 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative ${patient.color}`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100/50 flex items-center justify-center text-xl font-black text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {patient.pet[0]}
                </div>
                <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    <BedDouble className="w-3 h-3 text-indigo-500" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{patient.box}</span>
                </div>
            </div>

            <h4 className="text-lg font-black text-slate-800 tracking-tight leading-none uppercase">{patient.pet}</h4>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{patient.breed}</p>

            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Status</p>
                    <p className={`text-[10px] font-black uppercase tracking-tight mt-0.5 ${patient.status === 'Crítico' ? 'text-red-500' : 'text-emerald-500'
                        }`}>{patient.status}</p>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Alta</p>
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight mt-0.5">{patient.predictedDischarge}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Monitoramento Hospitalar</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Gestão de leitos, UTI e mapa de medicamentos</p>
                </div>
                <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Admitir Paciente
                </button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {patients.map(p => <PatientCard key={p.id} patient={p} />)}
            </div>

            {selectedPatient && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl h-[80vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white">
                        <header className="p-8 border-b border-slate-50 flex justify-between items-start bg-slate-50/20">
                            <div className="flex items-center space-x-6">
                                <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex items-center justify-center text-3xl font-black text-indigo-500 shadow-inner">
                                    {selectedPatient.pet[0]}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">{selectedPatient.pet}</h3>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">{selectedPatient.breed} • Tutor: {selectedPatient.tutor}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPatient(null)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all">✕</button>
                        </header>

                        <nav className="px-8 flex space-x-8 border-b border-slate-50">
                            {['map', 'history'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-6 text-[11px] font-black uppercase tracking-widest transition-all border-b-4 ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {tab === 'map' ? 'Mapa de Execução' : 'Evolução Clínica'}
                                </button>
                            ))}
                        </nav>

                        <div className="flex-1 overflow-y-auto p-10 bg-[#FBFCFE] custom-scrollbar">
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                                <Activity className="w-12 h-12 text-slate-300" />
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Módulo em Integração</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Internation;
