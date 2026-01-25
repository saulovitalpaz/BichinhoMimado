import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ChevronRight, Dog } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Credenciais inválidas. Tente novamente.');
        }
    };

    const demoUsers = [
        { name: 'Maressa (Admin)', email: 'maressa@bichinhomimado.com' },
        { name: 'Giovana (Business)', email: 'giovana@bichinhomimado.com' },
        { name: 'Vet Saulo', email: 'saulo@bichinhomimado.com' },
        { name: 'Recepção', email: 'recepcao@bichinhomimado.com' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-w-4xl w-full border border-slate-100">

                {/* Left: Brand */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-[#702FD3] to-[#E55D87] p-12 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/20">
                            <Dog className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tight leading-none mb-2">Bichinho Mimado</h1>
                        <p className="text-white/80 font-medium">Sistema de Gestão Integrada</p>
                    </div>

                    <div className="relative z-10 mt-12 md:mt-0">
                        <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">Acesso Rápido (Demo)</p>
                        <div className="space-y-2">
                            {demoUsers.map(u => (
                                <button
                                    key={u.email}
                                    onClick={() => { setEmail(u.email); setPassword('123'); }}
                                    className="block w-full text-left px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs font-bold uppercase tracking-wide border border-white/5"
                                >
                                    {u.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-8">Acessar Sistema</h2>

                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-bold mb-6 border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-purple-500 transition-colors" />
                                <input
                                    type="email"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50 transition-all"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Senha</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-purple-500 transition-colors" />
                                <input
                                    type="password"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50 transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">
                            Entrar <ChevronRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Login;
