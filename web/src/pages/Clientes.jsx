import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Plus,
    MapPin,
    Phone,
    Mail,
    Dog,
    MoreVertical,
    Filter,
    ExternalLink,
    ChevronRight
} from 'lucide-react';
import { fetchTutors } from '../utils/api';

const Clientes = () => {
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchTutors();
            setTutors(data);
            setLoading(false);
        };
        loadData();
    }, []);

    const filteredTutors = tutors.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center text-slate-400 text-sm font-black uppercase tracking-widest">Carregando CRM...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-purple-600" />
                        Gestão de Clientes
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Total de {tutors.length} responsáveis cadastrados</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-purple-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Pesquisar por nome, email ou CPF..."
                            className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="bg-purple-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-purple-100 hover:bg-purple-700 active:scale-95 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Novo Cliente
                    </button>
                </div>
            </div>

            {/* Grid/Table View */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
                <div className="p-4 bg-slate-50/50 border-b border-slate-50 flex justify-between items-center px-8">
                    <div className="flex gap-6">
                        <button className="text-[10px] font-black text-purple-600 border-b-2 border-purple-600 pb-1">Ativos</button>
                        <button className="text-[10px] font-black text-slate-400 hover:text-slate-600 pb-1 uppercase tracking-widest transition-all">Prospects</button>
                    </div>
                    <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-purple-600 transition-all">
                        <Filter className="w-3.5 h-3.5" /> Reordenar
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#FBFCFE] text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                            <tr>
                                <th className="px-8 py-4">Responsável</th>
                                <th className="px-8 py-4">Contato</th>
                                <th className="px-8 py-4">Endereço</th>
                                <th className="px-8 py-4">Animais</th>
                                <th className="px-8 py-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredTutors.map((tutor) => (
                                <tr key={tutor.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-400 font-black shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-all">
                                                {tutor.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-700 uppercase tracking-tight group-hover:text-purple-700 transition-colors">{tutor.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tabular-nums mt-0.5">ID: {tutor.id.toString().padStart(6, '0')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-[10px] font-bold text-slate-700">
                                                <Phone className="w-3 h-3 mr-2 text-slate-300" /> (24) 99823-0000
                                            </div>
                                            <div className="flex items-center text-[10px] font-bold text-slate-400">
                                                <Mail className="w-3 h-3 mr-2 text-slate-200" /> {tutor.email || 'sem@email.com'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-start max-w-[200px]">
                                            <MapPin className="w-3 h-3 mr-2 text-slate-300 mt-0.5 flex-shrink-0" />
                                            <span className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">Rua das Flores, 123 - Centro</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex -space-x-2">
                                            {[1, 2].map((_, i) => (
                                                <div key={i} className="w-7 h-7 rounded-lg bg-white border-2 border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 hover:z-10 hover:border-purple-300 cursor-pointer shadow-sm transition-all" title="Ver Animal">
                                                    <Dog className="w-3.5 h-3.5" />
                                                </div>
                                            ))}
                                            <button className="w-7 h-7 rounded-lg bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400 hover:bg-purple-50 hover:text-purple-600 transition-all shadow-sm">
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button className="p-2 text-slate-300 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all" title="Ver Detalhes">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-slate-300 hover:text-slate-600 rounded-xl transition-all">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredTutors.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-xs font-bold text-slate-300 uppercase tracking-widest italic">
                                        Nenhum cliente atende aos critérios da busca.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default Clientes;
