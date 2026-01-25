import React, { useState } from 'react';
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
    Tag
} from 'lucide-react';

interface CartItem {
    id: number;
    name: string;
    price: number;
    qty: number;
    category: string;
}

const Vendas = () => {
    const [cart, setCart] = useState<CartItem[]>([
        { id: 1, name: 'Ração Royal Canin Puppy 2kg', price: 189.90, qty: 1, category: 'Alimento' },
        { id: 2, name: 'Shampoo Neutro Pet Society', price: 45.00, qty: 2, category: 'Higiene' }
    ]);

    const products = [
        { id: 3, name: 'Bravecto 10-20kg', price: 299.00, stock: 12, category: 'Farma' },
        { id: 4, name: 'Coleira Seresto P', price: 259.00, stock: 5, category: 'Acessório' },
        { id: 5, name: 'Brinquedo Mordedor Corda', price: 32.50, stock: 20, category: 'Brinquedo' },
        { id: 6, name: 'Simparic 5-10kg', price: 115.00, stock: 15, category: 'Farma' },
    ];

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    return (
        <div className="flex flex-col lg:flex-row h-full gap-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Catalog */}
            <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/20">
                    <div className="relative group">
                        <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar produto ou código de barras..."
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600/30 shadow-sm transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 custom-scrollbar">
                    {products.map(prod => (
                        <div key={prod.id} className="bg-slate-50/50 p-5 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-xl transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-white px-2 py-1 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">{prod.category}</span>
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Estoque: {prod.stock}</span>
                            </div>
                            <h4 className="font-black text-slate-700 text-sm leading-tight mb-4 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{prod.name}</h4>
                            <div className="flex justify-between items-end">
                                <p className="text-xl font-black text-slate-800 tracking-tighter">R$ {prod.price.toFixed(2)}</p>
                                <button className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-90 transition-all">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart & Checkout */}
            <aside className="w-full lg:w-96 bg-white rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col overflow-hidden">
                <header className="p-6 bg-slate-900 text-white flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <ShoppingCart className="w-5 h-5 text-indigo-400" />
                        <span className="font-black text-[11px] uppercase tracking-[0.2em]">Carrinho Atual</span>
                    </div>
                    <span className="bg-white/10 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none">{cart.length} itens</span>
                </header>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                    {cart.map(item => (
                        <div key={item.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50 flex gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-300">
                                <Package className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h5 className="text-[11px] font-black text-slate-800 leading-tight uppercase tracking-tight truncate">{item.name}</h5>
                                <div className="flex justify-between items-center mt-3">
                                    <div className="flex items-center bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
                                        <button className="p-1 px-2 text-slate-400 hover:text-indigo-600 transition-colors"><Minus className="w-3 h-3" /></button>
                                        <span className="px-1 text-[11px] font-black tabular-nums">{item.qty}</span>
                                        <button className="p-1 px-2 text-slate-400 hover:text-indigo-600 transition-colors"><Plus className="w-3 h-3" /></button>
                                    </div>
                                    <p className="text-[11px] font-black text-slate-800 tabular-nums">R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <footer className="p-8 bg-slate-50/50 border-t border-slate-100 space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Subtotal</span>
                            <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-black text-slate-900 tracking-tighter border-t border-slate-200/50 pt-3">
                            <span>TOTAL</span>
                            <span className="text-indigo-600">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-white text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all group">
                            <CreditCard className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Cartão</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-white text-slate-400 hover:border-emerald-600 hover:text-emerald-600 transition-all group">
                            <Banknote className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Dinheiro</span>
                        </button>
                    </div>

                    <button className="w-full bg-slate-900 text-white rounded-[1.5rem] py-4 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-900/10 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        Finalizar Venda <ChevronRight className="w-4 h-4" />
                    </button>
                </footer>
            </aside>
        </div>
    );
};

export default Vendas;
