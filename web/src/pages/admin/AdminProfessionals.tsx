import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    Save,
    X,
    Shield
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

// Define Role Types
const ROLES = [
    { id: 'Veterinarian', label: 'Veterinário(a)' },
    { id: 'Groomer', label: 'Esteticista / Banho' },
    { id: 'Assistant', label: 'Auxiliar' },
    { id: 'Receptionist', label: 'Recepcionista' }
];

const AdminProfessionals = () => {
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [form, setForm] = useState({
        id: 0,
        name: '',
        role: 'Groomer',
        active: true
    });

    useEffect(() => {
        fetchProfessionals();
    }, []);

    const fetchProfessionals = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/professionals`);
            if (res.ok) {
                setProfessionals(await res.json());
            }
        } catch (e) {
            console.error('Error fetching professionals:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = isEditing
                ? `${API_BASE_URL}/api/professionals/${form.id}`
                : `${API_BASE_URL}/api/professionals`;

            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    role: form.role,
                    active: form.active
                })
            });

            if (res.ok) {
                fetchProfessionals();
                setShowModal(false);
                resetForm();
            }
        } catch (e) {
            console.error('Error saving:', e);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja remover este profissional?')) return;

        try {
            await fetch(`${API_BASE_URL}/api/professionals/${id}`, { method: 'DELETE' });
            fetchProfessionals();
        } catch (e) {
            console.error('Error deleting:', e);
        }
    };

    const openEdit = (pro: any) => {
        setForm({
            id: pro.id,
            name: pro.name,
            role: pro.role,
            active: pro.active
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setForm({ id: 0, name: '', role: 'Groomer', active: true });
        setIsEditing(false);
    };

    const filtered = professionals.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Shield className="w-6 h-6 text-fuchsia-600" />
                        Profissionais
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-1">
                        Gerencie a equipe de atendimento (Vets, Esteticistas)
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    <Plus className="w-4 h-4 text-fuchsia-400" />
                    Novo Profissional
                </button>
            </header>

            {/* Content */}
            <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden min-h-[400px]">
                {/* Search Bar */}
                <div className="p-6 border-b border-slate-50">
                    <div className="relative max-w-md">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Buscar por nome..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-bold outline-none focus:border-fuchsia-200 transition-all"
                            autoComplete="off"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-xs text-slate-400 uppercase tracking-widest font-black">Carregando...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-6">Nome</th>
                                    <th className="px-8 py-6">Cargo / Função</th>
                                    <th className="px-8 py-6 text-center">Status</th>
                                    <th className="px-8 py-6 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(pro => (
                                    <tr key={pro.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black uppercase">
                                                    {pro.name[0]}
                                                </div>
                                                <span className="text-[13px] font-black text-slate-700 uppercase tracking-tight">{pro.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                {ROLES.find(r => r.id === pro.role)?.label || pro.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            {pro.active ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-widest">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black bg-slate-100 text-slate-400 uppercase tracking-widest">
                                                    <XCircle className="w-3 h-3 mr-1" /> Inativo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(pro)}
                                                    className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(pro.id)}
                                                    className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-10 text-center text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                                            Nenhum profissional encontrado
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <header className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">
                                {isEditing ? 'Editar Profissional' : 'Novo Profissional'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-fuchsia-400" />
                            </button>
                        </header>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome Completo</label>
                                <input
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-fuchsia-200 transition-all"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Função / Cargo</label>
                                <select
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:border-fuchsia-200 transition-all"
                                    value={form.role}
                                    onChange={e => setForm({ ...form, role: e.target.value })}
                                >
                                    {ROLES.map(r => (
                                        <option key={r.id} value={r.id}>{r.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-3 ml-2">
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, active: !form.active })}
                                    className={`w-12 h-7 rounded-full transition-colors relative ${form.active ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-sm ${form.active ? 'left-6' : 'left-1'}`} />
                                </button>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                    {form.active ? 'Profissional Ativo' : 'Profissional Inativo'}
                                </span>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex justify-center items-center gap-2"
                            >
                                <Save className="w-4 h-4 text-fuchsia-400" />
                                Salvar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProfessionals;
