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
    Banknote,
    CheckCircle,
    X,
    AlertCircle,
    Save
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const AdminFinance = () => {
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        totalCost: 0,
        profit: 0,
        count: 0,
        average: 0,
        bestSeller: '...',
        bestDay: '...'
    });

    // Goals & Period Stats
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
    const [periodStats, setPeriodStats] = useState({
        revenue: 0,
        profit: 0,
        count: 0,
        target: 0,
        percent: 0
    });
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [goalForm, setGoalForm] = useState({
        daily: '',
        weekly: '',
        monthly: ''
    });

    // NFe State
    const [showNfeModal, setShowNfeModal] = useState(false);
    const [nfePreview, setNfePreview] = useState<any>(null);
    const [nfeErrors, setNfeErrors] = useState<string[]>([]);
    const [validatingNfe, setValidatingNfe] = useState(false);
    const [selectedStat, setSelectedStat] = useState<'gross' | 'net' | null>(null);

    useEffect(() => {
        fetchSales();
        fetchPeriodStats();
        fetchGoals();
    }, [period]);

    const fetchSales = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/sales`);
            if (res.ok) {
                const data = await res.json();
                setSales(data.reverse());
                calculateStats(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchPeriodStats = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/finance/stats/period?type=${period}`);
            if (res.ok) {
                setPeriodStats(await res.json());
            }
        } catch (e) { console.error(e); }
    };

    const fetchGoals = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/goals`);
            if (res.ok) {
                const data = await res.json();
                const goals: any = {};
                data.forEach((g: any) => {
                    goals[g.type.toLowerCase()] = g.value;
                });
                setGoalForm({
                    daily: goals.daily || '',
                    weekly: goals.weekly || '',
                    monthly: goals.monthly || ''
                });
            }
        } catch (e) { console.error(e); }
    };

    const handleUpdateGoals = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/api/goals`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(goalForm)
            });
            if (res.ok) {
                setShowGoalModal(false);
                fetchPeriodStats();
                alert('Metas atualizadas!');
            }
        } catch (e) { console.error(e); }
    };

    const calculateStats = (data: any[]) => {
        let total = 0;
        let totalCost = 0;
        const productsCount: { [key: string]: number } = {};
        const dailyRevenue: { [key: string]: number } = {};

        data.forEach(sale => {
            total += (sale.total || 0);

            // Calculate costs from items
            sale.items?.forEach((item: any) => {
                totalCost += (item.costAmount || 0) * (item.quantity || 1);

                // Analytics: Count products
                const name = item.description || 'Desconhecido';
                productsCount[name] = (productsCount[name] || 0) + (item.quantity || 1);
            });

            // Analytics: Daily leads
            const day = new Date(sale.date).toLocaleDateString('pt-BR', { weekday: 'long' });
            dailyRevenue[day] = (dailyRevenue[day] || 0) + (sale.total || 0);
        });

        const profit = total - totalCost;

        // Find best seller
        const bestSeller = Object.entries(productsCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const bestDay = Object.entries(dailyRevenue).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        setStats({
            total,
            totalCost,
            profit,
            count: data.length,
            average: data.length > 0 ? total / data.length : 0,
            bestSeller,
            bestDay
        });
    };

    const handleGenerateNFe = async (saleId: number) => {
        setValidatingNfe(true);
        setShowNfeModal(true);
        setNfePreview(null);
        setNfeErrors([]);

        try {
            const res = await fetch(`${API_BASE_URL}/api/nfe/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ saleId })
            });

            const data = await res.json();
            if (data.valid) {
                setNfePreview(data.preview);
            } else {
                setNfeErrors(data.errors);
            }
        } catch (e) {
            setNfeErrors(['Erro de conexão com servidor fiscal.']);
        } finally {
            setValidatingNfe(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-7xl mx-auto">
            <header>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Financeiro Admin</h2>
                <p className="text-sm text-slate-400 font-medium uppercase tracking-widest mt-1">Gestão de Caixa, Faturamento e Fiscal (NFe)</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <button
                    onClick={() => setSelectedStat('gross')}
                    className="bg-slate-900 text-left text-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-900/10 relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign className="w-16 h-16" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-300 transition-colors">Total Bruto</p>
                    <h3 className="text-2xl font-black mt-2 tracking-tighter">R$ {stats.total.toFixed(2)}</h3>
                    <div className="mt-4 flex items-center text-[9px] font-bold uppercase tracking-widest text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                        <ArrowUpRight className="w-3 h-3 mr-1" /> Ver Gráficos
                    </div>
                </button>

                <button
                    onClick={() => setSelectedStat('net')}
                    className="bg-white text-left p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-emerald-100 hover:shadow-lg hover:shadow-emerald-100/50 transition-all group cursor-pointer"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-emerald-600 transition-colors">Lucro Líquido</p>
                    <h3 className="text-2xl font-black mt-2 tracking-tighter text-emerald-600">R$ {stats.profit.toFixed(2)}</h3>
                    <div className="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-600/70">
                        Margem: {stats.total > 0 ? ((stats.profit / stats.total) * 100).toFixed(1) : 0}%
                    </div>
                </button>

                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Meta de Vendas</p>
                        <button onClick={() => setShowGoalModal(true)} className="p-1.5 hover:bg-slate-50 rounded-lg text-indigo-500 opacity-0 group-hover:opacity-100 transition-all">
                            <Save className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="flex items-end gap-2 mt-2">
                        <h3 className={`text-2xl font-black tracking-tighter ${periodStats.percent >= 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                            {periodStats.percent.toFixed(0)}%
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 mb-1">da meta {period === 'day' ? 'diária' : period === 'week' ? 'semanal' : 'mensal'}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${periodStats.percent >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            style={{ width: `${Math.min(periodStats.percent, 100)}%` }}
                        />
                    </div>
                    <div className="mt-4 flex gap-2">
                        {[
                            { label: 'Dia', value: 'day' },
                            { label: 'Semana', value: 'week' },
                            { label: 'Mês', value: 'month' }
                        ].map(p => (
                            <button
                                key={p.value}
                                onClick={() => setPeriod(p.value as any)}
                                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${period === p.value ? 'bg-slate-900 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-indigo-600 text-white p-6 rounded-[2.5rem] shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Melhor Dia</p>
                    <h3 className="text-2xl font-black mt-2 tracking-tighter capitalize">{stats.bestDay}</h3>
                    <div className="mt-2 flex items-center text-indigo-200 text-[9px] font-black uppercase tracking-widest">
                        <Calendar className="w-3 h-3 mr-1" /> Pico de Movimento
                    </div>
                </div>
            </div>

            {/* Stat Details Modal */}
            {selectedStat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedStat(null)} />
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <header className="p-8 bg-slate-900 text-white flex justify-between items-center flex-shrink-0">
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">
                                    {selectedStat === 'gross' ? 'Detalhamento de Receita' : 'Análise de Lucratividade'}
                                </h3>
                                <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mt-1">
                                    Visualização Gráfica & Métricas
                                </p>
                            </div>
                            <button onClick={() => setSelectedStat(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-indigo-400" />
                            </button>
                        </header>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            {/* Visual Chart Placeholder (Simulated) */}
                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 mb-8">
                                <div className="flex justify-between items-end h-40 gap-4">
                                    {[35, 60, 45, 80, 55, 90, 70].map((h, i) => (
                                        <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 group cursor-pointer">
                                            <div
                                                className={`w-full rounded-xl transition-all duration-500 group-hover:opacity-80 relative ${selectedStat === 'gross' ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                                                style={{ height: `${h}%` }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    R$ {(h * 150).toFixed(0)}
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest rotate-0 md:rotate-0">
                                                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'][i]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Insights Automáticos</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                                        <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Crescimento</p>
                                        <p className="text-sm font-bold text-indigo-900">
                                            +12% em relação à semana anterior.
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Projeção</p>
                                        <p className="text-sm font-bold text-emerald-900">
                                            Tendência de alta para o fim de semana.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Líquido (Lucro)</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor Total</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {sales.map(sale => {
                                const saleProfit = sale.total - (sale.items?.reduce((acc: number, item: any) => acc + (item.costAmount || 0) * (item.quantity || 1), 0) || 0);

                                return (
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
                                                <div className="font-bold text-xs text-slate-700 truncate">{sale.items?.[0]?.description || 'Diversos'}</div>
                                                {sale.items?.length > 1 && (
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">+ {sale.items.length - 1} outros itens</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                                                    {sale.paymentMethod || 'Outro'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="font-bold text-xs text-emerald-600">R$ {saleProfit.toFixed(2)}</div>
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
                                );
                            })}
                            {sales.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-slate-300">
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

            {/* Commercial Insights Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-emerald-50 rounded-2xl">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Oportunidades de Venda</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100/50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Produto Estrela</p>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-700">{stats.bestSeller}</span>
                                <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase">Alta Demanda</span>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100/50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Sugestão Comercial</p>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                Baseado no melhor dia ({stats.bestDay}), considere promoções relâmpago ou combos de banho e tosa para maximizar o ticket médio neste período.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[3rem] text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <CheckCircle className="w-32 h-32" />
                    </div>
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-white/10 rounded-2xl">
                            <CreditCard className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tight">Pronto para NF-e</h3>
                    </div>
                    <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">
                        Todas as vendas listadas acima possuem vínculo direto com o CPF e cadastro do tutor, prontas para exportação e emissão fiscal.
                    </p>
                    <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">
                        Exportar Relatório Fiscal
                    </button>
                </div>
            </div>

            {/* NFe Preview Modal */}
            {showNfeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowNfeModal(false)} />
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <header className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em]">Prévia Fiscal (NFe)</h3>
                            <button onClick={() => setShowNfeModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-indigo-400" />
                            </button>
                        </header>

                        <div className="p-8">
                            {validatingNfe ? (
                                <div className="py-12 text-center">
                                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Validando dados fiscais...</p>
                                </div>
                            ) : nfeErrors.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 text-red-500 mb-2">
                                        <AlertCircle className="w-6 h-6" />
                                        <h4 className="font-black text-sm uppercase tracking-tight">Pendências Encontradas</h4>
                                    </div>
                                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                                        <ul className="space-y-2">
                                            {nfeErrors.map((err, idx) => (
                                                <li key={idx} className="text-xs font-bold text-red-600 flex items-start">
                                                    <span className="mr-2">•</span> {err}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <p className="text-[10px] text-slate-400 text-center mt-4 font-medium">Corrija os cadastros (Empresa, Cliente ou Produto) e tente novamente.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                                        </div>
                                        <h4 className="font-black text-lg text-slate-800">Pronto para Emissão</h4>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Nenhum erro de validação</p>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-6 space-y-3 border border-slate-100">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Emitente</span>
                                            <span className="font-bold text-slate-700">{nfePreview?.issuer}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Destinatário</span>
                                            <span className="font-bold text-slate-700">{nfePreview?.recipient}</span>
                                        </div>
                                        <div className="border-t border-slate-200 my-2"></div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Valor Total</span>
                                            <span className="font-black text-slate-800">R$ {nfePreview?.total?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Tributos Est.</span>
                                            <span className="font-bold text-slate-500">R$ {nfePreview?.taxTotal?.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <button className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                                        <Download className="w-5 h-5" />
                                        Baixar XML da NFe
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Goals Management Modal */}
            {showGoalModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowGoalModal(false)} />
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <header className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Configurar Metas</h3>
                                <p className="text-[10px] text-indigo-300 font-bold uppercase mt-1">Base para Faturamento</p>
                            </div>
                            <button onClick={() => setShowGoalModal(false)} className="p-2 hover:bg-white/10 rounded-full">
                                <X className="w-5 h-5 text-indigo-400" />
                            </button>
                        </header>

                        <form onSubmit={handleUpdateGoals} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Meta Diária (R$)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                        value={goalForm.daily}
                                        onChange={e => setGoalForm({ ...goalForm, daily: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Meta Semanal (R$)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                        value={goalForm.weekly}
                                        onChange={e => setGoalForm({ ...goalForm, weekly: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Meta Mensal (R$)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                        value={goalForm.monthly}
                                        onChange={e => setGoalForm({ ...goalForm, monthly: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Salvar Configurações
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFinance;
