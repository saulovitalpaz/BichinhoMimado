import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, ArrowRight, Dog } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Credenciais inválidas. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl opacity-50"></div>
            </div>

            <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in-95 duration-1000">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-600 p-1 mb-4 shadow-2xl shadow-indigo-600/30 transform rotate-12 transition-transform hover:rotate-0 duration-500">
                        <div className="w-full h-full rounded-[2.2rem] bg-white flex items-center justify-center overflow-hidden">
                            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Bichinho</h1>
                        <p className="text-sm font-bold text-indigo-600 uppercase tracking-[0.3em] mt-1 ml-1">Mimado</p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)]">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Portal Integrado</h2>
                        <p className="text-slate-400 text-xs font-semibold mt-1">Bem-vindo à nova gestão clínica e petshop.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Profissional</label>
                            <div className="relative group">
                                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/40 transition-all placeholder:text-slate-300"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                            <div className="relative group">
                                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/40 transition-all placeholder:text-slate-300"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3.5 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 text-white py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100 shadow-xl shadow-slate-900/10 flex items-center justify-center group"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <span>Acessar Painel</span>
                                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                            © 2026 Bichinho Mimado System
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
