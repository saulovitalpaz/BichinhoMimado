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
    Barcode,
    Tag
} from 'lucide-react';

const Vendas = () => {
    const [cart, setCart] = useState([
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
    const total = subtotal;

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">

            {/* Left: Product Selection */}
            <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-purple-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Pesquisar produto pelo nome ou código de barras..."
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50 focus:bg-white transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex gap-2 mt-4 overflow-x-auto pb-1 custom-scrollbar">
                        {['Todos', 'Alimento', 'Farma', 'Higiene', 'Acessório', 'Serviço'].map((cat, i) => (
                            <button key={i} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${cat === 'Todos' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 custom-scrollbar">
                    {products.map(prod => (
                        <div key={prod.id} className="bg-slate-50/50 border-2 border-transparent hover:border-purple-100 hover:bg-white p-4 rounded-3xl transition-all cursor-pointer group shadow-sm hover:shadow-xl">
                            <div className="flex justify-between items-start mb-3">
                                <div className="bg-white px-2 py-1 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                                    {prod.category}
                                </div>
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Stock: {prod.stock}</span>
                            </div>
                            <h5 className="font-black text-slate-700 text-sm leading-tight mb-2 group-hover:text-purple-600 transition-colors">{prod.name}</h5>
                            <div className="flex justify-between items-end">
                                <p className="text-lg font-black text-slate-800 tabular-nums">R$ {prod.price.toFixed(2)}</p>
                                <button className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-100 hover:bg-purple-700 active:scale-90 transition-all">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Checkout / Cart */}
            <div className="w-full lg:w-96 bg-white rounded-[32px] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-purple-600 text-white shadow-lg">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 stroke-[2.5px]" />
                        <span className="font-black text-sm uppercase tracking-widest">Venda Atual</span>
                    </div>
                    <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter">{cart.length} itens</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {cart.map(item => (
                        <div key={item.id} className="p-3 bg-slate-50/50 rounded-2xl border border-slate-50 flex gap-3 group">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-300">
                                <Package className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h6 className="text-xs font-black text-slate-700 truncate leading-tight">{item.name}</h6>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center bg-white border border-slate-100 rounded-lg p-0.5">
                                        <button className="p-1 hover:text-purple-600 transition-colors"><Minus className="w-3 h-3" /></button>
                                        <span className="px-2 text-xs font-black tabular-nums">{item.qty}</span>
                                        <button className="p-1 hover:text-purple-600 transition-colors"><Plus className="w-3 h-3" /></button>
                                    </div>
                                    <p className="text-xs font-black text-slate-800 tabular-nums">R$ {(item.price * item.qty).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20 opacity-40">
                            <ShoppingCart className="w-12 h-12 mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">Carrinho Vazio</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100 space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                            <span>Subtotal</span>
                            <span className="tabular-nums">R$ {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-black text-slate-800 tracking-tighter border-t border-slate-200 pt-2">
                            <span>TOTAL</span>
                            <span className="tabular-nums text-purple-600">R$ {total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-slate-100 text-slate-400 hover:border-purple-600 hover:text-purple-600 hover:bg-white transition-all group">
                            <CreditCard className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-black uppercase tracking-tighter">Cartão</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-slate-100 text-slate-400 hover:border-emerald-600 hover:text-emerald-600 hover:bg-white transition-all group">
                            <Banknote className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-black uppercase tracking-tighter">Dinheiro</span>
                        </button>
                    </div>

                    <button className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-3xl py-4 font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                        Finalizar Venda <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Vendas;
