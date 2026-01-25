import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Wallet,
    CreditCard,
    Banknote,
    FileText,
    PieChart,
    BarChart2,
    Download
} from 'lucide-react';
import { fetchDailyFinance } from '../utils/api';

const Finance = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFinance = async () => {
            try {
                const financeData = await fetchDailyFinance();
                setData(financeData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching finance:', error);
                setLoading(false);
            }
        };
        loadFinance();
    }, []);

    if (loading) return <div className="p-10 text-center text-xs text-gray-400">Carregando módulos financeiros...</div>;
    if (!data) return <div className="p-10 text-center text-xs text-red-400">Erro de conexão financeira.</div>;

    const { cashFlow, transactions } = data;
    const totalIn = transactions.reduce((acc, t) => t.type === 'Receivable' ? acc + t.amount : acc, 0);
    const totalOut = transactions.reduce((acc, t) => t.type === 'Payable' ? acc + t.amount : acc, 0);
    const currentBalance = (cashFlow?.openingBalance || 0) + totalIn - totalOut;

    // Mock Data for Charts (Simple CSS Bars)
    const incomePercent = totalIn > 0 ? Math.min((totalIn / (totalIn + totalOut)) * 100, 100) : 0;
    const expensePercent = totalOut > 0 ? Math.min((totalOut / (totalIn + totalOut)) * 100, 100) : 0;

    return (
        <div className="space-y-4 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex justify-between items-end pb-2 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                        Gestão Financeira
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">Controle de caixa, faturamento e emissão fiscal (NF-e)</p>
                </div>
                <div className="flex space-x-2">
                    <button className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-600 hover:bg-gray-50 shadow-sm">
                        <Download className="w-3 h-3 mr-2" /> Exportar
                    </button>
                    <button className="flex items-center px-3 py-1.5 bg-blue-600 border border-blue-600 rounded text-xs font-bold text-white hover:bg-blue-700 shadow-sm">
                        <FileText className="w-3 h-3 mr-2" /> Emitir NF-e
                    </button>
                </div>
            </div>

            {/* KPI Cards - Compact */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col justify-between h-24">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saldo Inicial</p>
                    <p className="text-xl font-bold text-gray-600">R$ {cashFlow?.openingBalance?.toFixed(2) || '0.00'}</p>
                </div>

                <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col justify-between h-24 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1 bg-green-500"></div>
                    <div className="flex justify-between">
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Entradas</p>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-xl font-bold text-green-600">+R$ {totalIn.toFixed(2)}</p>
                </div>

                <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col justify-between h-24 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1 bg-red-500"></div>
                    <div className="flex justify-between">
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Saídas</p>
                        <TrendingDown className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-xl font-bold text-red-500">-R$ {totalOut.toFixed(2)}</p>
                </div>

                <div className="bg-gradient-to-tr from-gray-800 to-gray-700 text-white p-4 rounded shadow-md flex flex-col justify-between h-24">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Saldo Atual</p>
                    <p className="text-2xl font-black">R$ {currentBalance.toFixed(2)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Transactions Table (High Density) */}
                <div className="lg:col-span-2 bg-white rounded border border-gray-200 shadow-sm flex flex-col">
                    <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Extrato Diário</h3>
                        <div className="flex space-x-2">
                            <span className="text-[10px] font-bold text-gray-400 self-center">{transactions.length} lançamentos</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 text-[9px] uppercase tracking-widest text-gray-500 font-bold border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-2">Descrição</th>
                                    <th className="px-4 py-2">Categoria</th>
                                    <th className="px-4 py-2">Doc / NF</th>
                                    <th className="px-4 py-2 text-right">Valor</th>
                                    <th className="px-4 py-2 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.length > 0 ? transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-blue-50/30 transition-colors group text-xs">
                                        <td className="px-4 py-2 font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                            {t.description || 'Venda de Balcão'}
                                            <div className="text-[9px] text-gray-400 font-normal">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {t.paymentMethod || 'Dinheiro'}</div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                                {t.category || 'Geral'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-gray-400 font-mono text-[10px]">
                                            {t.docNumber || '---'}
                                        </td>
                                        <td className={`px-4 py-2 text-right font-bold ${t.type === 'Receivable' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'Receivable' ? '+' : '-'} {t.amount.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <CheckCircle2 className="w-3 h-3 text-green-500 mx-auto" />
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-xs text-gray-400 italic">
                                            Caixa sem movimentação.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Analytics Column */}
                <div className="space-y-4">

                    {/* Simple Visual Chart */}
                    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center">
                            <PieChart className="w-4 h-4 mr-2" /> Balanceamento
                        </h3>
                        <div className="flex h-4 rounded-full overflow-hidden bg-gray-100 mb-2">
                            <div style={{ width: `${incomePercent}%` }} className="bg-green-500 h-full"></div>
                            <div style={{ width: `${expensePercent}%` }} className="bg-red-500 h-full"></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-500">
                            <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div> Receitas ({incomePercent.toFixed(0)}%)</span>
                            <span className="flex items-center"><div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div> Despesas ({expensePercent.toFixed(0)}%)</span>
                        </div>
                    </div>

                    {/* Tax Info / NF-e Placeholder */}
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded shadow-sm">
                        <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2 flex items-center">
                            <FileText className="w-4 h-4 mr-2" /> Módulo Fiscal (NF-e)
                        </h3>
                        <p className="text-[10px] text-blue-700 mb-3 leading-relaxed">
                            Sua assinatura digital está ativa. As notas fiscais de serviço estão sendo processadas em lote a cada 2 horas.
                        </p>
                        <div className="w-full bg-blue-100 rounded-full h-1.5 mb-1 overflow-hidden">
                            <div className="bg-blue-500 h-full w-3/4"></div>
                        </div>
                        <div className="text-[9px] text-blue-600 text-right">Lote 0942 processando...</div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// Start Check Icon Helper
const CheckCircle2 = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
);

export default Finance;
