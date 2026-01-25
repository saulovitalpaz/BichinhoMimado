import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Filter, MoreHorizontal, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';

interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    patients: any[];
}

import { API_BASE_URL } from '../config';

const Clientes = () => {
    const [tutors, setTutors] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTutors = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/tutors`);
                if (res.ok) {
                    const data = await res.json();
                    setTutors(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchTutors();
    }, []);

    const filteredTutors = tutors.filter((t: any) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Clientes & Tutores</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Gestão de proprietários e seus respectivos pets</p>
                </div>
                <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Cliente
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative group flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, email ou telefone..."
                            className="w-full pl-12 pr-6 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-[11px] font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all text-slate-400">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                <th className="px-8 py-5">Nome do Tutor</th>
                                <th className="px-8 py-5">Contato</th>
                                <th className="px-8 py-5 text-center">Pets</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-8 py-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">Buscando clientes...</td></tr>
                            ) : filteredTutors.length === 0 ? (
                                <tr><td colSpan={5} className="px-8 py-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">Nenhum cliente encontrado</td></tr>
                            ) : filteredTutors.map((tutor: any) => (
                                <tr key={tutor.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center">
                                            <div className="w-9 h-9 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs mr-4">
                                                {tutor.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-black text-slate-700 leading-tight">{tutor.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">ID: CM-{tutor.id.toString().padStart(4, '0')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 space-y-1">
                                        <div className="flex items-center text-slate-500">
                                            <Phone className="w-3 h-3 mr-2 opacity-50" />
                                            <span className="text-[11px] font-medium">{tutor.phone || '(11) 99999-9999'}</span>
                                        </div>
                                        <div className="flex items-center text-slate-400">
                                            <Mail className="w-3 h-3 mr-2 opacity-50" />
                                            <span className="text-[10px] font-medium">{tutor.email || 'n/a'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <div className="flex justify-center -space-x-2">
                                            {tutor.patients?.slice(0, 3).map((p: any, i: number) => (
                                                <div key={i} className="w-7 h-7 rounded-lg border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-400 shadow-sm" title={p.name}>
                                                    {p.name[0]}
                                                </div>
                                            ))}
                                            {tutor.patients?.length > 3 && (
                                                <div className="w-7 h-7 rounded-lg border-2 border-white bg-slate-800 flex items-center justify-center text-[8px] font-black text-white shadow-sm">
                                                    +{tutor.patients.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">Ativo</span>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-white rounded-xl shadow-sm border border-slate-100/50 text-slate-400 hover:text-indigo-600 transition-all">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-white rounded-xl shadow-sm border border-slate-100/50 text-slate-400 hover:text-indigo-600 transition-all">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Clientes;
