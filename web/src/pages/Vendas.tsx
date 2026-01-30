import React, { useState, useEffect } from 'react';
import {
    ShoppingCart,
    Search,
    Plus,
    Minus,
    Trash2,
    CreditCard,
    Banknote,
    ChevronRight,
    Package,
    Tag,
    User,
    CheckCircle2,
    X,
    Bath,
    Scissors
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

interface Product {
    id: number;
    name: string;
    description: string | null;
    sku: string | null;
    category: string | null;
    stock: number;
    salePrice: number;
}

interface CartItem {
    id: string; // Dynamic ID to allow both products and services
    originalId: number;
    type: 'product' | 'service';
    name: string;
    price: number;
    qty: number;
    stock?: number;
}

const Vendas = () => {
    const { user } = useAuth();
    const location = useLocation(); // Hook for state
    const [products, setProducts] = useState<Product[]>([]);
    const [billableServices, setBillableServices] = useState<any[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Tutor selection
    const [tutorSearch, setTutorSearch] = useState('');
    const [tutors, setTutors] = useState<any[]>([]);
    const [selectedTutor, setSelectedTutor] = useState<any | null>(null);

    useEffect(() => {
        fetchProducts();
        fetchBillableServices();
    }, []);

    // Effect to handle Auto-Add from Petshop
    useEffect(() => {
        if (location.state?.appointmentId && billableServices.length > 0) {
            const apptId = location.state.appointmentId;
            const targetService = billableServices.find(s => s.id === apptId);

            if (targetService) {
                // Check if already in cart to avoid duplicates on re-renders
                const cartId = `serv-${targetService.id}`;
                if (!cart.some(c => c.id === cartId)) {
                    addServiceToCart(targetService);

                    // Optional: Clear state to prevent adding again on refresh (requires history manipulation, but simple check works for now)
                    window.history.replaceState({}, document.title);
                }
            }
        }
    }, [billableServices, location.state]);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/products`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchBillableServices = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/petshop/billable-services`);
            if (res.ok) {
                const data = await res.json();
                setBillableServices(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const searchTutors = async (q: string) => {
        setTutorSearch(q);
        if (q.length < 2) {
            setTutors([]);
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/search?q=${q}`);
            if (res.ok) {
                const data = await res.json();
                setTutors(data.filter((r: any) => r.type === 'tutor'));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const addProductToCart = (product: Product) => {
        setCart(prev => {
            const cartId = `prod-${product.id}`;
            const existing = prev.find(item => item.id === cartId);
            if (existing) {
                return prev.map(item => item.id === cartId ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, {
                id: cartId,
                originalId: product.id,
                type: 'product',
                name: product.name,
                price: product.salePrice,
                qty: 1,
                stock: product.stock
            }];
        });
    };

    const addServiceToCart = (serviceItem: any) => {
        const cartId = `serv-${serviceItem.id}`;
        if (cart.find(c => c.id === cartId)) return; // Already in cart

        setCart(prev => [
            ...prev,
            {
                id: cartId,
                originalId: serviceItem.id,
                type: 'service',
                name: `${serviceItem.service} - ${serviceItem.pet?.name}`,
                price: serviceItem.price || 0,
                qty: 1
            }
        ]);

        // Auto-select tutor if associated
        if (serviceItem.pet?.tutor) {
            setSelectedTutor({
                id: serviceItem.pet.tutor.id,
                title: serviceItem.pet.tutor.name,
                subtitle: `CPF: ${serviceItem.pet.tutor.cpf}`
            });
        }
    };

    const updateQty = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }).filter(item => item.qty > 0));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    const handleFinalize = async () => {
        if (cart.length === 0 || !paymentMethod) return;

        setLoading(true);
        try {
            // Process Sale
            const res = await fetch(`${API_BASE_URL}/api/sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        productId: item.type === 'product' ? item.originalId : null,
                        serviceId: item.type === 'service' ? item.originalId : null,
                        quantity: item.qty,
                        price: item.price,
                        name: item.name
                    })),
                    paymentMethod,
                    tutorId: selectedTutor?.id,
                    userId: user?.id
                })
            });

            if (res.ok) {
                // If there are services in the cart, mark them as completed in the database
                const serviceItems = cart.filter(c => c.type === 'service');
                for (const si of serviceItems) {
                    await fetch(`${API_BASE_URL}/api/appointments/${si.originalId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'COMPLETED' })
                    });
                }

                setSuccess(true);
                setCart([]);
                setPaymentMethod(null);
                setSelectedTutor(null);
                fetchProducts();
                fetchBillableServices();
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex flex-col lg:flex-row h-full gap-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Catalog & Services */}
            <div className="flex-1 flex flex-col gap-8">
                {/* Catalog */}
                <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col overflow-hidden relative">
                    {success && (
                        <div className="absolute inset-x-0 top-0 bg-emerald-500 text-white p-4 text-center text-[10px] font-black uppercase tracking-[0.2em] z-10 animate-in slide-in-from-top duration-300">
                            Venda realizada com sucesso!
                        </div>
                    )}

                    <div className="p-8 border-b border-slate-50 bg-slate-50/20">
                        <div className="relative group">
                            <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar produto por nome ou SKU..."
                                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:ring-8 focus:ring-slate-900/5 focus:border-slate-900/20 shadow-sm transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 custom-scrollbar">
                        {filteredProducts.map(prod => (
                            <div
                                key={prod.id}
                                onClick={() => prod.stock > 0 && addProductToCart(prod)}
                                className={`bg-slate-50/50 p-5 rounded-3xl border border-transparent transition-all cursor-pointer group relative ${prod.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-200 hover:bg-white hover:shadow-xl'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-white px-2 py-1 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">{prod.category || 'Geral'}</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${prod.stock <= 5 ? 'text-red-500' : 'text-emerald-500'}`}>Estoque: {prod.stock}</span>
                                </div>
                                <h4 className="font-black text-slate-700 text-sm leading-tight mb-4 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{prod.name}</h4>
                                <div className="flex justify-between items-end">
                                    <p className="text-xl font-black text-slate-800 tracking-tighter">R$ {prod.salePrice.toFixed(2)}</p>
                                    <button className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all ${prod.stock <= 0 ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800 active:scale-90'
                                        }`}>
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Services */}
                <div className="h-64 bg-white rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col overflow-hidden">
                    <header className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-pink-50/20">
                        <div className="flex items-center space-x-3">
                            <Bath className="w-4 h-4 text-pink-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Serviços Aguardando Pagamento</span>
                        </div>
                        <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded-lg text-[9px] font-black">{billableServices.length} pendentes</span>
                    </header>
                    <div className="flex-1 overflow-x-auto p-6 flex gap-4 custom-scrollbar">
                        {billableServices.map(service => (
                            <button
                                key={service.id}
                                onClick={() => addServiceToCart(service)}
                                className="min-w-[200px] max-w-[200px] flex-shrink-0 bg-slate-50 p-4 rounded-2xl border border-transparent hover:border-pink-200 hover:bg-white transition-all text-left group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-300">
                                        <Scissors className="w-4 h-4" />
                                    </div>
                                    <span className="text-[11px] font-black text-slate-800 tabular-nums">R$ {service.price?.toFixed(2)}</span>
                                </div>
                                <h5 className="text-[11px] font-black text-slate-700 uppercase tracking-tight truncate">{service.pet?.name}</h5>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{service.service}</p>
                            </button>
                        ))}
                        {billableServices.length === 0 && (
                            <div className="flex-1 flex items-center justify-center text-slate-200">
                                <span className="text-[9px] font-black uppercase tracking-widest">Nenhum serviço pendente de cobrança</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cart & Checkout */}
            <aside className="w-full lg:w-96 bg-white rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col overflow-hidden">
                <header className="p-6 bg-slate-900 text-white flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <ShoppingCart className="w-5 h-5 text-indigo-400" />
                        <span className="font-black text-[11px] uppercase tracking-[0.2em]">PDV / Checkout</span>
                    </div>
                    <span className="bg-white/10 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none">{cart.length} itens</span>
                </header>

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Tutor Selector */}
                    <div className="p-4 border-b border-slate-50 relative">
                        {selectedTutor ? (
                            <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 p-3 rounded-2xl animate-in fade-in duration-300">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
                                        <User className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-900 uppercase tracking-tight">{selectedTutor.title}</p>
                                        <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest leading-none">{selectedTutor.subtitle}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedTutor(null)} className="p-1 hover:bg-white rounded-lg transition-colors">
                                    <X className="w-3.5 h-3.5 text-indigo-400" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="text"
                                    placeholder="Vincular Tutor (opcional)..."
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-[11px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-slate-200 transition-all"
                                    value={tutorSearch}
                                    onChange={e => searchTutors(e.target.value)}
                                />
                                {tutors.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden py-2 animate-in slide-in-from-top-2 duration-200">
                                        {tutors.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => { setSelectedTutor(t); setTutors([]); setTutorSearch(''); }}
                                                className="w-full px-4 py-3 flex flex-col items-start hover:bg-slate-50 transition-colors"
                                            >
                                                <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{t.title}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.subtitle}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                        {cart.map(item => (
                            <div key={item.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50 flex gap-4 animate-in slide-in-from-right-4 duration-300">
                                <div className={`w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center ${item.type === 'service' ? 'text-pink-400' : 'text-slate-300'}`}>
                                    {item.type === 'service' ? <Scissors className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h5 className="text-[11px] font-black text-slate-800 leading-tight uppercase tracking-tight truncate flex-1">{item.name}</h5>
                                        <button onClick={() => removeFromCart(item.id)} className="ml-2 text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="flex items-center bg-white border border-slate-100 rounded-xl p-0.5 shadow-sm">
                                            {item.type === 'product' ? (
                                                <>
                                                    <button onClick={() => updateQty(item.id, -1)} className="p-1 px-2 text-slate-400 hover:text-slate-900 transition-colors"><Minus className="w-3 h-3" /></button>
                                                    <span className="px-1 text-[11px] font-black tabular-nums">{item.qty}</span>
                                                    <button
                                                        onClick={() => item.stock && item.qty < item.stock && updateQty(item.id, 1)}
                                                        className={`p-1 px-2 transition-colors ${item.stock && item.qty < item.stock ? 'text-slate-400 hover:text-slate-900' : 'text-slate-200 cursor-not-allowed'}`}
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-pink-500">Serviço</span>
                                            )}
                                        </div>
                                        <p className="text-[11px] font-black text-slate-800 tabular-nums">R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <footer className="p-8 bg-slate-50/50 border-t border-slate-100 space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Subtotal</span>
                            <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-black text-slate-900 tracking-tighter border-t border-slate-200/50 pt-3">
                            <span>TOTAL</span>
                            <span className="text-slate-900">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'Credit', label: 'Cartão', icon: CreditCard },
                            { id: 'Cash', label: 'Dinheiro', icon: Banknote },
                        ].map(method => (
                            <button
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id)}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all group ${paymentMethod === method.id
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                                    : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300'
                                    }`}
                            >
                                <method.icon className={`w-6 h-6 mb-2 transition-transform ${paymentMethod === method.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">{method.label}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleFinalize}
                        disabled={cart.length === 0 || !paymentMethod || loading}
                        className={`w-full rounded-[1.5rem] py-4 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl transition-all flex items-center justify-center gap-2 ${cart.length === 0 || !paymentMethod || loading
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            : 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-800 active:scale-[0.98]'
                            }`}
                    >
                        {loading ? 'Processando...' : (
                            <>Confirmar Venda <ChevronRight className="w-4 h-4" /></>
                        )}
                    </button>
                </footer>
            </aside>
        </div>
    );
};

export default Vendas;
