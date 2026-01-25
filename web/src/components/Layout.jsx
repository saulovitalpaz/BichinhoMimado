import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Home,
    Stethoscope,
    Users,
    Settings,
    Calendar,
    Grid,
    ShoppingBag,
    DollarSign,
    Activity,
    Menu,
    Bell,
    Search,
    HelpCircle,
    Wifi,
    WifiOff,
    LogOut,
    ChevronLeft,
    Briefcase,
    Store,
    Scissors,
    Package
} from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, workspace, switchWorkspace } = useAuth();
    const [isOnline, setIsOnline] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        const checkStatus = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/health');
                if (res.ok) setIsOnline(true);
                else setIsOnline(false);
            } catch (e) {
                setIsOnline(false);
            }
        };
        checkStatus();
        const interval = setInterval(checkStatus, 10000);
        return () => clearInterval(interval);
    }, [user, navigate]);

    if (!user) return null;

    // Workspace Configurations
    const isPetshopMode = workspace === 'petshop';

    // Theme Configuration
    const theme = isPetshopMode ? {
        gradient: 'from-[#FF6B6B] to-[#FF8E53]', // Orange/Pink
        primary: 'text-orange-500',
        primaryBg: 'bg-orange-50',
        border: 'border-orange-500',
        logoBorder: 'border-orange-200'
    } : {
        gradient: 'from-[#702FD3] to-[#E55D87]', // Purple/Pink
        primary: 'text-purple-600',
        primaryBg: 'bg-purple-50',
        border: 'border-purple-600',
        logoBorder: 'border-purple-200'
    };

    const clinicNavRequest = [
        { path: '/', icon: Home, label: 'Painel de controle', color: 'text-slate-500' },
        { path: '/clinical', icon: Stethoscope, label: 'Atendimento clínico', color: 'text-emerald-500' },
        { path: '/clientes', icon: Users, label: 'Clientes', color: 'text-blue-500' },
        { path: '/agenda', icon: Calendar, label: 'Agenda', color: 'text-indigo-500' },
        { path: '/vendas', icon: ShoppingBag, label: 'Vendas', color: 'text-purple-500' },
        { path: '/finance', icon: DollarSign, label: 'Financeiro', color: 'text-green-600' },
        { path: '/internation', icon: Activity, label: 'Internação', color: 'text-cyan-500' },
    ];

    const petshopNavRequest = [
        { path: '/', icon: Store, label: 'Painel Petshop', color: 'text-orange-500' },
        { path: '/petshop', icon: Scissors, label: 'Banho & Tosa', color: 'text-pink-500' },
        { path: '/vendas', icon: ShoppingBag, label: 'PDV & Caixa', color: 'text-purple-500' },
        { path: '/agenda', icon: Calendar, label: 'Agenda', color: 'text-indigo-500' },
        { path: '/clientes', icon: Users, label: 'Clientes', color: 'text-blue-500' },
        { path: '/estoque', icon: Package, label: 'Estoque', color: 'text-emerald-500' },
    ];

    // Role-Based Navigation Filtering
    const filterNavByRole = (items) => {
        if (user.role.startsWith('admin')) return items; // Admins see everything

        // Defined restrictions
        const blockedForNonAdmin = ['/finance'];

        return items.filter(item => {
            // Block Finance for everyone except Admins
            if (blockedForNonAdmin.includes(item.path)) return false;

            // Specific Reception Restrictions (if any specific logic needed)
            if (user.role === 'reception') {
                // Reception doesn't need 'Internation' deep view? Keeping it for now as per request "acessa clínica".
                return true;
            }

            if (user.role === 'vet') {
                // Vets don't need 'Petshop' grid if in clinic mode
                if (item.path === '/petshop') return false;
            }

            return true;
        });
    };

    const navItems = filterNavByRole(isPetshopMode ? petshopNavRequest : clinicNavRequest);

    return (
        <div className="flex h-screen bg-[#F8FAFC] text-slate-600 font-sans overflow-hidden transition-colors duration-500">

            {/* Sidebar */}
            <aside
                className={`bg-white border-r border-slate-200 flex-shrink-0 flex flex-col z-30 transition-all duration-300 ease-in-out relative ${isCollapsed ? 'w-16' : 'w-48'
                    }`}
            >
                {/* Artistic Brand Header */}
                <div className={`relative overflow-hidden group border-b border-slate-100 transition-all duration-300 ${isCollapsed ? 'h-16' : 'h-28'} flex flex-col items-center justify-center`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-700`}></div>

                    <div className={`relative transition-all duration-500 transform ${isCollapsed ? 'scale-75' : 'scale-75'}`}>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md relative z-10 bg-white ${isPetshopMode ? 'grayscale-0' : ''}`}>
                            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <div className={`mt-1 text-center transition-all duration-300 overflow-hidden ${isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'}`}>
                        <h1 className="text-[10px] font-black text-slate-800 tracking-tighter uppercase leading-none">Bichinho</h1>
                        <p className={`text-[8px] font-bold text-transparent bg-clip-text bg-gradient-to-r ${theme.gradient} uppercase tracking-[0.2em]`}>
                            {isPetshopMode ? 'Petshop' : 'Mimado'}
                        </p>
                    </div>
                </div>

                <nav className="mt-2 flex-1 overflow-y-auto custom-scrollbar px-2 space-y-0.5">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center rounded-lg text-xs font-bold transition-all duration-200 group relative ${location.pathname === item.path
                                ? `${theme.primaryBg} ${theme.primary}`
                                : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
                                } ${isCollapsed ? 'justify-center py-3 px-0' : 'px-3 py-2'}`}
                            title={isCollapsed ? item.label : ''}
                        >
                            <item.icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${location.pathname === item.path ? theme.primary : item.color
                                } ${isCollapsed ? 'm-0' : 'mr-3'}`} />

                            <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                                }`}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>

                <div className={`p-2 border-t border-slate-100 transition-all duration-300 ${isCollapsed ? 'items-center' : ''}`}>
                    <button
                        onClick={logout}
                        className={`flex items-center text-xs font-bold text-slate-400 hover:text-red-500 transition-all w-full rounded-lg hover:bg-red-50 ${isCollapsed ? 'justify-center py-3' : 'px-3 py-2'}`}
                    >
                        <LogOut className={`w-4 h-4 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                        {!isCollapsed && <span>Sair</span>}
                    </button>

                    {!isCollapsed && (
                        <div className="mt-2 px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                            <span>API</span>
                            {isOnline ? <Wifi className="w-3 h-3 text-emerald-500" /> : <WifiOff className="w-3 h-3 text-red-500" />}
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto flex flex-col relative w-full bg-[#F8FAFC]">
                {/* Header - Dynamic Gradient */}
                <header className={`bg-gradient-to-r ${theme.gradient} text-white shadow-lg sticky top-0 z-20 h-14 flex justify-between items-center px-4 transition-all duration-500 backdrop-blur-md bg-opacity-90`}>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Workspace Switcher (Only for Admin Business) */}
                        {(user.role === 'admin_business' || user.role === 'admin_vet') && (
                            <div className="hidden md:flex bg-black/20 rounded-lg p-0.5 backdrop-blur-sm">
                                <button
                                    onClick={() => switchWorkspace('clinical')}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${!isPetshopMode ? 'bg-white text-purple-600 shadow-sm' : 'text-white/70 hover:text-white'}`}
                                >
                                    Clínica
                                </button>
                                <button
                                    onClick={() => switchWorkspace('petshop')}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${isPetshopMode ? 'bg-white text-orange-500 shadow-sm' : 'text-white/70 hover:text-white'}`}
                                >
                                    Petshop
                                </button>
                            </div>
                        )}

                        <div className="flex items-center bg-white/20 px-3 py-1.5 rounded-lg text-xs min-w-[200px] hover:bg-white/30 focus-within:bg-white/30 border border-transparent focus-within:border-white/40 transition-all backdrop-blur-sm">
                            <Search className="w-3.5 h-3.5 text-white/70 mr-2" />
                            <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-white placeholder-white/60 w-full font-medium" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-5">
                        <div className="flex flex-col items-end text-[10px] leading-tight font-bold text-white uppercase tracking-widest">
                            <span className="text-white">{user.name}</span>
                            <span className="opacity-80">{user.role}</span>
                        </div>
                        <div className="relative group cursor-pointer">
                            <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-xs font-black text-white shadow-inner ring-2 ring-white/30 group-hover:ring-white transition-all">
                                {user.name[0]}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 max-w-[1600px] w-full mx-auto animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
