import React, { useState, useEffect } from 'react';
import { Wallet, User, Dog, CheckCircle, Search, Filter, Shield, ShieldOff, MoreHorizontal, ArrowUpRight, ArrowDownLeft, DollarSign, Plus, Trash2, ShoppingCart, Scissors, Package } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const CashierModule = () => {
    const [activeTab, setActiveTab] = useState<'SERVICES' | 'BILLS'>('SERVICES');
    const [bills, setBills] = useState<any[]>([]);
    const [pendingServices, setPendingServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [privacyMode, setPrivacyMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Checkout Modal State
    const [checkoutData, setCheckoutData] = useState<any | null>(null);
    const [cart, setCart] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [tutorSearch, setTutorSearch] = useState('');
    const [tutorResults, setTutorResults] = useState<any[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [installments, setInstallments] = useState(1);
    const [taxRate, setTaxRate] = useState(0); // Percentage
    const [isSearchingClient, setIsSearchingClient] = useState(false);

    useEffect(() => {
        fetchData();
        fetchProducts();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [billsRes, servicesRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/bills`),
                fetch(`${API_BASE_URL}/api/petshop/billable-services`)
            ]);

            if (billsRes.ok) setBills(await billsRes.json());
            if (servicesRes.ok) setPendingServices(await servicesRes.json());
        } catch (e) {
            console.error('Error fetching data:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/products`);
            if (res.ok) setProducts(await res.json());
        } catch (e) { console.error(e); }
    };

    const filteredBills = bills.filter(bill =>
        bill.tutor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearchTutor = async (q: string) => {
        setTutorSearch(q);
        if (q.length < 2) { setTutorResults([]); return; }
        try {
            const res = await fetch(`${API_BASE_URL}/api/search?q=${q}`);
            if (res.ok) {
                const data = await res.json();
                setTutorResults(data.filter((r: any) => r.type === 'tutor' || r.type === 'pet'));
            }
        } catch (e) { console.error(e); }
    };

    const startNewSale = () => {
        setCheckoutData({
            type: 'QUICK_SALE',
            tutor: { id: null, name: 'Cliente Avulso' },
            pet: null
        });
        setCart([]);
        setTutorSearch('');
        setIsSearchingClient(true);
    };

    const filteredServices = pendingServices.filter(svc =>
        (svc.pet?.tutor?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (svc.tutor?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (svc.pet?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (svc.service?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const openCheckout = (serviceItem: any) => {
        setCheckoutData({
            type: 'SERVICE',
            data: serviceItem,
            tutor: serviceItem.pet.tutor,
            pet: serviceItem.pet
        });
        setCart([{
            type: 'SERVICE',
            id: `svc-${serviceItem.id}`,
            name: `${serviceItem.service} - ${serviceItem.pet.name}`,
            price: serviceItem.price || 0,
            originalId: serviceItem.id,
            qty: 1
        }]);
    };

    const addProductToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === `prod-${product.id}`);
            if (existing) {
                return prev.map(p => p.id === existing.id ? { ...p, qty: p.qty + 1 } : p);
            }
            return [...prev, {
                type: 'PRODUCT',
                id: `prod-${product.id}`,
                name: product.name,
                price: product.salePrice,
                originalId: product.id,
                qty: 1
            }];
        });
        setProductSearch('');
    };

    const handleFinalize = async () => {
        if (!checkoutData || !paymentMethod) return;

        try {
            // Create Sale/Bill
            const res = await fetch(`${API_BASE_URL}/api/sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        productId: item.type === 'PRODUCT' ? item.originalId : null,
                        serviceId: item.type === 'SERVICE' ? item.originalId : null,
                        quantity: item.qty,
                        price: item.price,
                        name: item.name
                    })),
                    paymentMethod,
                    installments: (paymentMethod === 'Credit') ? installments : 1,
                    taxAmount: (paymentMethod === 'Credit' || paymentMethod === 'Debit') ? (cart.reduce((access, item) => access + (item.price * item.qty), 0) * (taxRate / 100)).toFixed(2) : 0,
                    tutorId: checkoutData.tutor.id,
                    userId: 1 // TODO: Context User
                })
            });

            if (res.ok) {
                // Determine if we need to close the appointment
                // Success (Status is auto-updated by backend now)
                console.log('Sale completed');

                setCheckoutData(null);
                setCart([]);
                setPaymentMethod(null);
                fetchData();
            }
        } catch (e) {
            console.error('Checkout failed', e);
            alert('Erro ao finalizar venda');
        }
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const pendingTotal = bills.filter(b => b.status === 'PENDING').reduce((acc, b) => acc + b.amount, 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Caixa & Checkout</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Gestão de comandas e pagamentos</p>
                </div>
                <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                    <button
                        onClick={startNewSale}
                        className="mr-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center"
                    >
                        <Plus className="w-3.5 h-3.5 mr-2" /> Nova Venda
                    </button>
                    <button
                        onClick={() => setActiveTab('SERVICES')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SERVICES' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Comandas (Serviços)
                    </button>
                    <button
                        onClick={() => setActiveTab('BILLS')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'BILLS' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Contas (Faturas)
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">A Receber (Faturas)</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-2">R$ {pendingTotal.toFixed(2)}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Serviços Pendentes</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-2">{pendingServices.length}</h3>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-3xl border border-slate-50 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-40 text-slate-300 font-black uppercase tracking-widest text-xs">Carregando...</div>
                ) : (
                    <>
                        {activeTab === 'SERVICES' && (
                            <div className="p-3 sm:p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {filteredServices.map(svc => (
                                    <div key={svc.id} onClick={() => openCheckout(svc)} className="group bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-indigo-100 p-6 rounded-3xl cursor-pointer transition-all hover:shadow-xl">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-fuchsia-500 shadow-sm">
                                                <Scissors className="w-5 h-5" />
                                            </div>
                                            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest">Aguardando</span>
                                        </div>
                                        <h4 className="font-black text-lg text-slate-800 uppercase tracking-tight">{svc.pet.name}</h4>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-4">{svc.service} • {svc.pet.tutor.name}</p>
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                            <span className="text-lg font-black text-indigo-600">R$ {svc.price?.toFixed(2)}</span>
                                            <span className="text-[10px] font-black text-slate-300 group-hover:text-indigo-400 uppercase tracking-widest transition-colors">Cobrar &rarr;</span>
                                        </div>
                                    </div>
                                ))}
                                {filteredServices.length === 0 && (
                                    <div className="col-span-full text-center py-20 text-slate-300 font-black uppercase tracking-widest text-xs">Nenhum serviço pendente</div>
                                )}
                            </div>
                        )}

                        {activeTab === 'BILLS' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <th className="px-8 py-6">ID</th>
                                            <th className="px-8 py-6">Cliente</th>
                                            <th className="px-8 py-6">Valor</th>
                                            <th className="px-8 py-6">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredBills.map(bill => (
                                            <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-4 text-[11px] font-black text-slate-400">#{bill.id}</td>
                                                <td className="px-8 py-4 text-[12px] font-bold text-slate-700">{bill.tutor?.name}</td>
                                                <td className="px-8 py-4 text-[12px] font-black text-slate-800">R$ {bill.amount.toFixed(2)}</td>
                                                <td className="px-8 py-4">
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${bill.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        {bill.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Checkout Modal */}
            {checkoutData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setCheckoutData(null)} />
                    <div className="bg-white w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-3xl shadow-2xl relative flex flex-col md:flex-row max-h-screen sm:max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
                        {/* Left: Cart */}
                        <div className="flex-1 bg-slate-50 p-8 flex flex-col border-r border-slate-100">
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6">Comanda</h3>
                            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.type === 'SERVICE' ? 'bg-fuchsia-50 text-fuchsia-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                {item.type === 'SERVICE' ? <Scissors className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{item.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400">x{item.qty}</p>
                                            </div>
                                        </div>
                                        <p className="text-[12px] font-black text-slate-800">R$ {(item.price * item.qty).toFixed(2)}</p>
                                    </div>
                                ))}

                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-200/50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Adicionar Produtos</p>
                                <div className="relative z-50">
                                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[12px] font-bold outline-none focus:border-fuchsia-500 transition-colors"
                                        placeholder="Buscar produto..."
                                        value={productSearch}
                                        onChange={e => setProductSearch(e.target.value)}
                                        autoComplete="off"
                                    />
                                    {productSearch.length > 0 && (
                                        <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto z-[60]">
                                            {products.filter(p =>
                                                p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                                                (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
                                            ).map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => addProductToCart(p)}
                                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex justify-between border-b border-slate-50 last:border-0 transition-colors"
                                                >
                                                    <div className="flex flex-col">
                                                        <span>{p.name}</span>
                                                        {p.sku && <span className="text-[8px] text-slate-400 font-black">{p.sku}</span>}
                                                    </div>
                                                    <span className="text-indigo-600">R$ {p.salePrice.toFixed(2)}</span>
                                                </button>
                                            ))}
                                            {products.filter(p =>
                                                p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                                                (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
                                            ).length === 0 && (
                                                    <div className="px-4 py-3 text-[10px] text-slate-400 text-center">Nenhum produto encontrado</div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Payment */}
                        <div className="flex-1 bg-white p-8 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">Pagamento</h3>
                                <div className="bg-indigo-50 p-4 rounded-2xl mb-6 relative">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Cliente</p>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-black text-indigo-900">{checkoutData.tutor.name}</p>
                                            <p className="text-[10px] text-indigo-500 font-bold">{checkoutData.tutor.cpf || ''}</p>
                                        </div>
                                        {checkoutData.type === 'QUICK_SALE' && (
                                            <button onClick={() => setIsSearchingClient(!isSearchingClient)} className="p-1 hover:bg-white rounded-lg transition-colors">
                                                <Search className="w-4 h-4 text-indigo-400" />
                                            </button>
                                        )}
                                    </div>

                                    {checkoutData.type === 'QUICK_SALE' && isSearchingClient && (
                                        <div className="absolute top-full left-0 right-0 mt-2 z-30">
                                            <input
                                                autoFocus
                                                placeholder="Trocar cliente..."
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-xl text-[12px] font-bold outline-none focus:border-indigo-500"
                                                onChange={e => handleSearchTutor(e.target.value)}
                                            />
                                            {tutorResults.length > 0 && (
                                                <div className="bg-white border border-slate-100 rounded-xl mt-1 shadow-2xl max-h-40 overflow-y-auto w-full">
                                                    {tutorResults.map(r => (
                                                        <button
                                                            key={`${r.type}-${r.id}`}
                                                            onClick={() => {
                                                                setCheckoutData({
                                                                    ...checkoutData,
                                                                    tutor: {
                                                                        id: r.type === 'pet' ? r.tutorId : r.id,
                                                                        name: r.type === 'pet' ? r.subtitle?.replace('Tutor: ', '') : r.title,
                                                                        cpf: r.type === 'tutor' ? r.subtitle : ''
                                                                    }
                                                                });
                                                                setTutorSearch(r.type === 'pet' ? r.subtitle?.replace('Tutor: ', '') : r.title);
                                                                setIsSearchingClient(false);
                                                            }}
                                                            className="w-full text-left px-4 py-2 hover:bg-slate-50 text-[11px] font-bold"
                                                        >
                                                            {r.title} <span className="text-slate-400 ml-2">({r.subtitle})</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Método</p>
                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    {['Credit', 'Debit', 'Cash', 'Pix'].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setPaymentMethod(m)}
                                            className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === m ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>


                                {/* Installments & Tax (Credit Card) */}
                                {paymentMethod === 'Credit' && (
                                    <div className="bg-slate-50 p-4 rounded-2xl mb-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Parcelamento</p>
                                            <select
                                                value={installments}
                                                onChange={e => setInstallments(parseInt(e.target.value))}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[12px] font-bold outline-none focus:border-indigo-500"
                                            >
                                                {[1, 2, 3, 4, 5, 6, 12].map(i => (
                                                    <option key={i} value={i}>{i}x {i === 1 ? '(À Vista)' : `sem juros`}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Taxa Maquininha (%)</p>
                                            <input
                                                type="number"
                                                value={taxRate}
                                                onChange={e => setTaxRate(parseFloat(e.target.value))}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[12px] font-bold outline-none focus:border-indigo-500"
                                                placeholder="Ex: 4.5"
                                            />
                                            <p className="text-[9px] text-slate-400 mt-1 text-right">
                                                Desconto estimado: R$ {(total * (taxRate / 100)).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Geral</span>
                                    <span className="text-4xl font-black text-slate-900 tracking-tighter">R$ {total.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={handleFinalize}
                                    disabled={!paymentMethod}
                                    className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all ${paymentMethod ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20 active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                                >
                                    Confirmar Recebimento
                                </button>
                                <button onClick={() => setCheckoutData(null)} className="w-full mt-3 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default CashierModule;
