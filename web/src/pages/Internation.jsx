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

const Internation = () => {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [activeTab, setActiveTab] = useState('map'); // 'map' or 'history'

    const [internations, setInternations] = useState([
        {
            id: 25987,
            pet: 'Billy',
            breed: 'Yorkshire Terrier',
            weight: 3.5,
            tutor: 'Maria',
            startDate: new Date(),
            status: 'Stable',
            box: '01',
            predictedDischarge: '11 Dias 1 Hora',
            color: 'border-l-4 border-l-blue-500',
            prescriptions: [
                { name: 'Dipirona 500mg/ml', dose: '0.5ml', freq: '8/8h', nextTime: '14:00', status: 'Pending' },
                { name: 'Tramadol', dose: '10mg', freq: '12/12h', nextTime: '20:00', status: 'Pending' }
            ]
        },
        {
            id: 13656,
            pet: 'Maria Flor',
            breed: 'Bulldog Francês',
            weight: 11.2,
            tutor: 'Joana',
            startDate: new Date(),
            status: 'Critical',
            box: 'UTI-02',
            predictedDischarge: '11 Dias 5 Horas',
            color: 'border-l-4 border-l-red-500', // Red for critical/attention
            prescriptions: [
                { name: 'Oximetria', dose: 'Monitorar', freq: '1/1h', nextTime: '13:00', status: 'Pending' }
            ]
        },
        {
            id: 32654,
            pet: 'Tedy',
            breed: 'Shih-tzu',
            weight: 5.95,
            tutor: 'Carlos',
            startDate: new Date(),
            status: 'Stable',
            box: '03',
            predictedDischarge: '7 Dias 2 Horas',
            color: 'border-l-4 border-l-orange-500',
            prescriptions: []
        }
    ]);

    const handleBoxChange = (petId, newBox) => {
        setInternations(prev => prev.map(p => p.id === petId ? { ...p, box: newBox } : p));
    };

    const PatientModal = ({ patient, onClose }) => {
        if (!patient) return null;

        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-50 p-6 border-b border-gray-200 flex justify-between items-start">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-xl font-black text-gray-400">
                                {patient.pet[0]}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-black text-gray-800">{patient.pet}</h2>
                                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded border border-blue-200">{patient.breed}</span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">{patient.tutor} • {patient.weight}kg</p>

                                {/* Box Editor */}
                                <div className="flex items-center gap-2 mt-2">
                                    <BedDouble className="w-4 h-4 text-purple-600" />
                                    <span className="text-xs font-bold text-gray-500 uppercase">Leito Atual:</span>
                                    <input
                                        type="text"
                                        defaultValue={patient.box}
                                        onBlur={(e) => handleBoxChange(patient.id, e.target.value)}
                                        className="w-20 bg-white border border-gray-300 rounded px-2 py-0.5 text-sm font-bold text-purple-700 focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 px-6">
                        <button
                            onClick={() => setActiveTab('map')}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'map' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            <Syringe className="w-4 h-4 mr-2" />
                            Mapa de Execução
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'history' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            <Clock className="w-4 h-4 mr-2" />
                            Histórico Clínico
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto bg-[#F8F9FA] p-6">
                        {activeTab === 'map' ? (
                            <div className="space-y-6">
                                {/* Header Actions */}
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-700">Prescrições Ativas</h3>
                                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-700 flex items-center shadow-lg shadow-purple-200">
                                        <Plus className="w-3 h-3 mr-1" /> Nova Prescrição
                                    </button>
                                </div>

                                {/* Prescription Cards / Timeline */}
                                <div className="space-y-4">
                                    {patient.prescriptions && patient.prescriptions.length > 0 ? patient.prescriptions.map((presc, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                                                    <Syringe className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{presc.name}</p>
                                                    <p className="text-xs text-gray-500 font-medium">Dose: <span className="text-gray-700">{presc.dose}</span> • Freq: <span className="text-gray-700">{presc.freq}</span></p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Próxima Dose</p>
                                                    <p className="text-lg font-black text-gray-800">{presc.nextTime}</p>
                                                </div>
                                                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center">
                                                    <CheckCircle2 className="w-4 h-4 mr-1" /> Executar
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
                                            <p className="text-gray-400 font-medium">Nenhuma prescrição ativa.</p>
                                            <p className="text-xs text-gray-300">Cadastre a medicação para iniciar o mapa.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Mock History */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                        <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                                    </div>
                                    <div className="pb-8">
                                        <p className="text-xs font-bold text-gray-400">Hoje, 09:00</p>
                                        <div className="bg-white p-3 rounded border border-gray-200 mt-1 shadow-sm">
                                            <p className="text-sm font-bold text-gray-700">Avaliação Veterinária</p>
                                            <p className="text-xs text-gray-500 mt-1">Paciente estável, alimentou-se bem.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                        <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                                    </div>
                                    <div className="pb-8">
                                        <p className="text-xs font-bold text-purple-500">Ontem, 20:00</p>
                                        <div className="bg-white p-3 rounded border border-gray-200 mt-1 shadow-sm">
                                            <p className="text-sm font-bold text-gray-700">Medicação Administrada</p>
                                            <p className="text-xs text-gray-500 mt-1">Tramadol 10mg - Realizado por Ana (Enf).</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-normal text-gray-600">Animais internados</h2>
                <div className="flex gap-2">
                    <span className="text-xs text-gray-400 self-center mr-2">Novidades</span>
                    <div className="flex items-center gap-1 bg-white px-3 py-1 rounded border border-gray-200 shadow-sm text-[10px] font-bold text-gray-600">
                        <User className="w-3 h-3 text-blue-500" />
                        Saulo | BICHINHO MIMADO
                    </div>
                    <button className="bg-white border border-gray-200 px-3 py-1 rounded text-xs font-bold text-purple-600 shadow-sm">Ajuda</button>
                </div>
            </div>

            {/* Removed the fake internal sidebar as requested */}

            <div className="bg-white p-8 rounded shadow-sm border border-gray-100 min-h-[600px] w-full">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                    <h3 className="text-lg font-normal text-gray-500">Internados</h3>
                    <div className="flex gap-3">
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-700 flex items-center shadow-lg shadow-purple-200">
                            <Plus className="w-3 h-3 mr-2" /> Nova Internação
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {internations.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedPatient(item)}
                            className={`bg-gray-50 rounded-xl shadow-sm p-5 relative ${item.color} hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group border border-gray-100`}
                        >
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </div>

                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm overflow-hidden flex items-center justify-center border border-gray-100">
                                    <span className="text-lg font-black text-gray-300">{item.pet[0]}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm uppercase tracking-tight">{item.pet}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{item.breed}</p>

                                    <div className="flex items-center gap-1 mt-1 bg-white px-2 py-0.5 rounded border border-gray-200 w-fit">
                                        <BedDouble className="w-3 h-3 text-purple-500" />
                                        <span className="text-[10px] font-bold text-gray-600">Box {item.box || '--'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-gray-200/50">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Alta Prevista</span>
                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{item.predictedDischarge}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Patient Modal */}
            {selectedPatient && (
                <PatientModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
            )}

        </div>
    );
};

export default Internation;
