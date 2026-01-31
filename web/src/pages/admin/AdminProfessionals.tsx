import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, User } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const AdminProfessionals = () => {
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({ name: '', role: 'Veterinarian', active: true });

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
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId
                ? `${API_BASE_URL}/api/professionals/${editingId}`
                : `${API_BASE_URL}/api/professionals`;

            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                setShowModal(false);
                setEditingId(null);
                setForm({ name: '', role: 'Veterinarian', active: true });
                fetchProfessionals();
            }
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar profissional');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Excluir este profissional?')) return;
        try {
            await fetch(`${API_BASE_URL}/api/professionals/${id}`, { method: 'DELETE' });
            fetchProfessionals();
        } catch (e) { console.error(e); }
    };

    const handleEdit = (p: any) => {
        setEditingId(p.id);
        setForm({ name: p.name, role: p.role, active: p.active });
        setShowModal(true);
    };

    const handleNew = () => {
        setEditingId(null);
        setForm({ name: '', role: 'Veterinarian', active: true });
        setShowModal(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Profissionais</h2>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-1">Gestão de equipe técnica (Veterinários, Groomers)</p>
                </div>
                <button
                    onClick={handleNew}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Profissional
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-50 shadow-sm overflow-hidden p-4 sm:p-6">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="py-4">Nome</th>
                            <th className="py-4">Cargo / Função</th>
                            <th className="py-4">Status</th>
                            <th className="py-4 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={4} className="py-8 text-center text-xs text-slate-400">Carregando...</td></tr>
                        ) : professionals.length === 0 ? (
                            <tr><td colSpan={4} className="py-8 text-center text-xs text-slate-400">Nenhum profissional cadastrado.</td></tr>
                        ) : professionals.map(p => (
                            <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <span className="text-[12px] font-bold text-slate-700">{p.name}</span>
                                    </div>
                                </td>
                                <td className="py-4">
                                    <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">{p.role}</span>
                                </td>
                                <td className="py-4">
                                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${p.active ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                        {p.active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(p)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-colors shadow-sm"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-600 transition-colors shadow-sm"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-white w-full max-w-md sm:rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-full sm:h-auto sm:max-h-[90vh]">
                        <header className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-800">{editingId ? 'Editar Profissional' : 'Novo Profissional'}</h3>
                            <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                        </header>

                        <form onSubmit={handleSave} className="p-8 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold outline-none focus:border-indigo-300 transition-all"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cargo / Função</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold outline-none focus:border-indigo-300 transition-all"
                                    value={form.role}
                                    onChange={e => setForm({ ...form, role: e.target.value })}
                                >
                                    <option value="Veterinarian">Veterinário(a)</option>
                                    <option value="Groomer">Tosador(a) / Banhista</option>
                                    <option value="Clerk">Atendente / Vendedor</option>
                                    <option value="Admin">Administrativo</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.active}
                                        onChange={e => setForm({ ...form, active: e.target.checked })}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Ativo</span>
                                </label>
                            </div>

                            <button className="w-full py-4 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex justify-center items-center gap-2">
                                <Save className="w-4 h-4" /> Salvar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProfessionals;
