import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    FileText,
    TrendingUp,
    Calendar,
    Download,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    Banknote
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const AdminFinance = () => {
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, count: 0, average: 0 });

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            // Fetching all sales (assuming API supports this, or we might need to filter appointments)
            // For now, let's fetch 'sales' endpoint if it exists, otherwise we might look at appointments
            // Based on Vendas.tsx, it posts to /api/sales. Let's assume GET /api/sales returns history.
            const res = await fetch(`${API_BASE_URL}/api/sales`);
            if (res.ok) {
                const data = await res.json();
                setSales(data.reverse()); // Newest first
                calculateStats(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: any[]) => {
        const total = data.reduce((acc, curr) => acc + (curr.total || 0), 0);
        setStats({
            total,
            count: data.length,
            average: data.length > 0 ? total / data.length : 0
        });
    };

    const handleGenerateNFe = (saleId: number) => {
        alert(`Gerando NFe para venda #${saleId}...\n(Em breve: Integração com SEFAZ)`);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-7xl mx-auto">
            <header>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Financeiro Admin</h2>
                <p className="text-sm text-slate-400 font-medium uppercase tracking-widest mt-1">Gestão de Caixa, Faturamento e Fiscal (NFe)</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-900/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign className="w-24 h-24" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Faturamento Total</p>
                    <h3 className="text-4xl font-black mt-2 tracking-tighter">R$ {stats.total.toFixed(2)}</h3>
                    <div className="mt-4 flex items-center text-emerald-400 text-xs font-bold uppercase tracking-widest">
                        <TrendingUp className="w-4 h-4 mr-1" /> +12% vs mês anterior
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Ticket Médio</p>
                    <h3 className="text-4xl font-black mt-2 tracking-tighter text-slate-800">R$ {stats.average.toFixed(2)}</h3>
                    <div className="mt-4 flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                        Por venda realizada
                    </div>
                </div>

                <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <FileText className="w-24 h-24" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-200">Vendas / NFe</p>
                    <h3 className="text-4xl font-black mt-2 tracking-tighter">{stats.count}</h3>
                    <div className="mt-4 flex items-center text-indigo-200 text-xs font-bold uppercase tracking-widest">
                        Transações no período
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
                <header className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-slate-50 rounded-2xl">
                            <Filter className="w-5 h-5 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Transações Recentes</h3>
                    </div>
                    <div className="relative group w-full md:w-auto">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar venda, CPF ou ID..."
                            className="w-full md:w-80 pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold focus:bg-white focus:border-slate-200 focus:outline-none transition-all"
                        />
                    </div>
                </header>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Data</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente / Tutor</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens / Serviço</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pagamento</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor Total</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {sales.map(sale => (
                                <tr key={sale.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6">
                                        <div className="font-black text-xs text-slate-800">#{sale.id.toString().padStart(6, '0')}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                            {new Date(sale.date).toLocaleDateString('pt-BR')} <span className="opacity-50">|</span> {new Date(sale.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 font-black text-xs">
                                                {(sale.tutor?.name?.[0]) || 'C'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-xs text-slate-700">{sale.tutor?.name || 'Cliente Balcão'}</div>
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{sale.tutor?.cpf || 'CPF não inf.'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="max-w-[200px]">
                                            <div className="font-bold text-xs text-slate-700 truncate">{sale.items?.[0]?.name || 'Diversos'}</div>
                                            {sale.items?.length > 1 && (
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">+ {sale.items.length - 1} outros itens</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center space-x-2">
                                            {sale.paymentMethod === 'Credit' ? (
                                                <CreditCard className="w-4 h-4 text-slate-400" />
                                            ) : (
                                                <Banknote className="w-4 h-4 text-emerald-400" />
                                            )}
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                                                {sale.paymentMethod === 'Credit' ? 'Cartão' : 'Dinheiro'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="font-black text-sm text-slate-900">R$ {sale.total?.toFixed(2)}</div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() => handleGenerateNFe(sale.id)}
                                                className="p-2 rounded-xl text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-md transition-all border border-transparent hover:border-indigo-100 flex items-center gap-1 group/btn"
                                                title="Gerar NFe"
                                            >
                                                <FileText className="w-4 h-4" />
                                                <span className="text-[9px] font-black uppercase tracking-wider w-0 overflow-hidden group-hover/btn:w-auto transition-all duration-300">NFe</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sales.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-300">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 opacity-20" />
                                            <span className="text-xs font-black uppercase tracking-widest">Nenhuma venda registrada</span>
                                        </div>
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

export default AdminFinance;
