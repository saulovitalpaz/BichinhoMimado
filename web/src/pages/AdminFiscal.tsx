import React, { useState, useEffect } from 'react';
import { Building2, Save, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AdminFiscal = () => {
    const [company, setCompany] = useState({
        name: '',
        tradeName: '',
        cnpj: '',
        ie: '',
        crt: '1', // 1=Simples Nacional
        zipCode: '',
        address: '',
        number: '',
        neighborhood: '',
        city: '',
        state: ''
    });
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetchCompany();
    }, []);

    const fetchCompany = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/company`);
            if (res.ok) {
                const data = await res.json();
                if (data.id) setCompany(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCompany({ ...company, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/company`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(company)
            });
            if (res.ok) {
                setMsg('Dados fiscais salvos com sucesso!');
                setTimeout(() => setMsg(''), 3000);
            }
        } catch (e) {
            alert('Erro ao salvar');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <header>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Configuração Fiscal (NF-e)</h2>
                <p className="text-slate-500 font-medium mt-2">Dados da sua empresa para emissão de notas.</p>
            </header>

            <form onSubmit={handleSave} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
                {msg && (
                    <div className="absolute top-0 left-0 w-full bg-emerald-500 text-white text-center py-2 text-xs font-black uppercase tracking-widest animate-in slide-in-from-top">
                        {msg}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Razão Social</label>
                        <div className="relative group">
                            <Building2 className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 group-hover:text-indigo-500 transition-colors" />
                            <input
                                name="name"
                                value={company.name}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none font-bold text-slate-700 transition-all"
                                placeholder="Minha Empresa LTDA"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome Fantasia</label>
                        <input
                            name="tradeName"
                            value={company.tradeName || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none font-bold text-slate-700 transition-all"
                            placeholder="Bichinho Mimado"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">CNPJ</label>
                        <input
                            name="cnpj"
                            value={company.cnpj}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none font-bold text-slate-700 transition-all font-mono"
                            placeholder="00.000.000/0000-00"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Inscrição Estadual</label>
                        <input
                            name="ie"
                            value={company.ie || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none font-bold text-slate-700 transition-all font-mono"
                            placeholder="Isento ou Número"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Regime Tributário</label>
                        <select
                            name="crt"
                            value={company.crt || '1'}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none font-bold text-slate-700 transition-all cursor-pointer appearance-none"
                        >
                            <option value="1">1 - Simples Nacional</option>
                            <option value="3">3 - Regime Normal</option>
                        </select>
                    </div>
                </div>

                <div className="border-t border-slate-100 my-8 pt-8 relative">
                    <span className="absolute -top-3 left-0 bg-white pr-4 text-[10px] font-black uppercase tracking-widest text-slate-300">Endereço Fiscal</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">CEP</label>
                        <input
                            name="zipCode"
                            value={company.zipCode || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none font-bold text-slate-700 transition-all"
                            placeholder="00000-000"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cidade</label>
                        <input
                            name="city"
                            value={company.city || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none font-bold text-slate-700 transition-all"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">UF</label>
                        <input
                            name="state"
                            maxLength={2}
                            value={company.state || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none font-bold text-slate-700 transition-all uppercase text-center"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="md:col-span-3">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Endereço (Rua, Av)</label>
                        <input
                            name="address"
                            value={company.address || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none font-bold text-slate-700 transition-all"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Número</label>
                        <input
                            name="number"
                            value={company.number || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none font-bold text-slate-700 transition-all"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Bairro</label>
                        <input
                            name="neighborhood"
                            value={company.neighborhood || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none font-bold text-slate-700 transition-all"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 flex items-center group cursor-pointer"
                    >
                        <Save className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Salvar Configurações
                    </button>
                </div>

            </form>
        </div>
    );
};

export default AdminFiscal;
