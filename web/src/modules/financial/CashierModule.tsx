import React, { useState, useEffect } from 'react';
import { Wallet, User, Dog, CheckCircle, Search, Filter, Shield, ShieldOff, MoreHorizontal, ArrowUpRight, ArrowDownLeft, DollarSign } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const CashierModule = () => {
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [privacyMode, setPrivacyMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/bills`);
                if (res.ok) {
                    const data = await res.json();
                    setBills(data);
                }
            } catch (e) {
                console.error('Error fetching bills:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchBills();
    }, []);

    const filteredBills = bills.filter(bill =>
        bill.tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingTotal = bills.filter(b => b.status === 'PENDING').reduce((acc, b) => acc + b.amount, 0);
    const paidTotal = bills.filter(b => b.status === 'PAID').reduce((acc, b) => acc + b.amount, 0);

    const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
        <div className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${color} bg-opacity-10 text-opacity-90`}>
                    <Icon className="w-4 h-4" />
                </div>
                {trend && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{title}</p>
                <p className={`text-xl font-black text-slate-800 tracking-tight mt-0.5 ${privacyMode ? 'blur-md select-none' : ''}`}>
                    R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Módulo Financeiro</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Controle de entradas, saídas e faturamento diário</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setPrivacyMode(!privacyMode)}
                        className={`p-2 rounded-xl border transition-all flex items-center space-x-2 ${privacyMode ? 'bg-slate-800 text-white border-slate-800 shadow-lg ring-2 ring-slate-800/20' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                            }`}
                        title={privacyMode ? "Desativar Modo Privacidade" : "Ativar Modo Privacidade"}
                    >
                        {privacyMode ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        <span className="text-[10px] font-bold uppercase tracking-widest px-1">Privacidade</span>
                    </button>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all active:scale-95">
                        Nova Transação
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Receita (Pago)" value={paidTotal} icon={ArrowDownLeft} color="bg-emerald-500 text-emerald-600" trend={12} />
                <StatCard title="A Receber" value={pendingTotal} icon={Wallet} color="bg-blue-500 text-blue-600" />
                <StatCard title="Despesas (Mês)" value={1450.00} icon={ArrowUpRight} color="bg-red-500 text-red-600" trend={-5} />
                <StatCard title="Ticket Médio" value={185.50} icon={DollarSign} color="bg-purple-500 text-purple-600" />
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
                    <div className="flex items-center space-x-4">
                        <div className="relative group">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar cliente ou serviço..."
                                className="pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-100 rounded-xl text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all w-full md:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="p-2 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all">
                            <Filter className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <button className="px-3 py-1.5 rounded-lg bg-slate-50 text-purple-600 border border-purple-50">Todos</button>
                        <button className="px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all">Pendentes</button>
                        <button className="px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all">Pagos</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/30 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                <th className="px-6 py-4">Fatura</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Descrição</th>
                                <th className="px-6 py-4">Valor</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-300 text-[10px] font-bold uppercase tracking-widest">Carregando dados financeiros...</td>
                                </tr>
                            ) : filteredBills.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-300 text-[10px] font-bold uppercase tracking-widest">Nenhuma transação encontrada</td>
                                </tr>
                            ) : filteredBills.map((bill) => (
                                <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-3.5">
                                        <span className="text-[11px] font-black text-slate-800">#{bill.id.toString().padStart(4, '0')}</span>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center">
                                            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-500 mr-2.5">
                                                {bill.tutor.name[0]}
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-700">{bill.tutor.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5 text-[11px] text-slate-500 font-medium">{bill.description}</td>
                                    <td className={`px-6 py-3.5 text-[11px] font-black text-slate-800 ${privacyMode ? 'blur-sm select-none' : ''}`}>
                                        R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${bill.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {bill.status === 'PAID' ? 'Liquidado' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-[10px] text-slate-400 font-bold whitespace-nowrap">
                                        {new Date(bill.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-3.5 text-center">
                                        <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {bill.status === 'PENDING' && (
                                                <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Baixar Pagamento">
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-all">
                                                <MoreHorizontal className="w-4 h-4" />
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

export default CashierModule;
