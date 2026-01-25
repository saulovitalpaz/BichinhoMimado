import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import GlobalSearch from './GlobalSearch';
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

interface NavItem {
    path: string;
    icon: any;
    label: string;
    color: string;
}


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
                const res = await fetch(`${API_BASE_URL}/api/health`);
                if (res.ok) setIsOnline(true);
                else setIsOnline(false);
            } catch (e) {
                setIsOnline(false);
            }
        };
        checkStatus();
        const interval = setInterval(checkStatus, 15000);
        return () => clearInterval(interval);
    }, [user, navigate]);

    if (!user) return null;

    const isPetshopMode = workspace === 'petshop';

    const theme = isPetshopMode ? {
        gradient: 'from-[#FF6B6B] to-[#FF8E53]',
        primary: 'text-orange-500',
        primaryBg: 'bg-orange-50/50',
        border: 'border-orange-500',
        logoBorder: 'border-orange-200'
    } : {
        gradient: 'from-[#702FD3] to-[#E55D87]',
        primary: 'text-purple-600',
        primaryBg: 'bg-purple-50/50',
        border: 'border-purple-600',
        logoBorder: 'border-purple-200'
    };

    const clinicNav: NavItem[] = [
        { path: '/', icon: Home, label: 'Painel', color: 'text-slate-400' },
        { path: '/clinical', icon: Stethoscope, label: 'Clínica', color: 'text-emerald-500' },
        { path: '/clientes', icon: Users, label: 'Clientes', color: 'text-blue-500' },
        { path: '/agenda', icon: Calendar, label: 'Agenda', color: 'text-indigo-500' },
        { path: '/vendas', icon: ShoppingBag, label: 'Vendas', color: 'text-purple-500' },
        { path: '/finance', icon: DollarSign, label: 'Financeiro', color: 'text-green-600' },
        { path: '/internation', icon: Activity, label: 'Internação', color: 'text-cyan-500' },
    ];

    const petshopNav: NavItem[] = [
        { path: '/', icon: Store, label: 'Dashboard', color: 'text-orange-500' },
        { path: '/petshop', icon: Scissors, label: 'Estética', color: 'text-pink-500' },
        { path: '/vendas', icon: ShoppingBag, label: 'PDV', color: 'text-purple-500' },
        { path: '/agenda', icon: Calendar, label: 'Agenda', color: 'text-indigo-500' },
        { path: '/clientes', icon: Users, label: 'Clientes', color: 'text-blue-500' },
        { path: '/estoque', icon: Package, label: 'Estoque', color: 'text-emerald-500' },
    ];

    const filterNavByRole = (items: NavItem[]) => {
        if (user.role === 'admin_business' || user.role === 'admin_vet') return items;

        const roleRestrictions: Record<string, string[]> = {
            VETERINARIAN: ['/finance', '/petshop', '/vendas'],
            RECEPTIONIST: ['/internation'],
        };

        const restricted = roleRestrictions[user.role as keyof typeof roleRestrictions] || [];
        return items.filter(item => !restricted.includes(item.path));
    };

    const navItems = filterNavByRole(isPetshopMode ? petshopNav : clinicNav);

    return (
        <div className="flex h-screen bg-[#FDFDFD] text-slate-600 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`bg-white border-r border-slate-100 flex-shrink-0 flex flex-col z-30 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-44 md:w-52'
                    } ${isCollapsed ? '' : 'hidden md:flex'} md:flex`}
            >
                {/* Brand Header */}
                <div className={`flex flex-col items-center justify-center border-b border-slate-50 transition-all duration-300 ${isCollapsed ? 'h-14' : 'h-24'
                    }`}>
                    <div className="relative transform scale-90">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm bg-white p-0.5">
                            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-xl" />
                        </div>
                    </div>
                    {!isCollapsed && (
                        <div className="mt-1 text-center animate-in fade-in slide-in-from-top-1">
                            <h1 className="text-[10px] font-black text-slate-800 tracking-tighter uppercase leading-none">Bichinho</h1>
                            <p className={`text-[8px] font-bold text-transparent bg-clip-text bg-gradient-to-r ${theme.gradient} uppercase tracking-[0.2em]`}>
                                {isPetshopMode ? 'Petshop' : 'Mimado'}
                            </p>
                        </div>
                    )}
                </div>

                <nav className="mt-3 flex-1 overflow-y-auto px-2 space-y-0.5 custom-scrollbar">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center rounded-xl text-[11px] font-semibold transition-all duration-200 group ${location.pathname === item.path
                                ? `${theme.primaryBg} ${theme.primary}`
                                : 'hover:bg-slate-50/80 text-slate-400 hover:text-slate-600'
                                } ${isCollapsed ? 'justify-center py-2.5 px-0' : 'px-3 py-2'}`}
                        >
                            <item.icon className={`w-4 h-4 flex-shrink-0 transition-transform ${location.pathname === item.path ? theme.primary : 'opacity-70 group-hover:opacity-100'
                                } ${isCollapsed ? 'm-0' : 'mr-2.5'}`} />
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="p-2 border-t border-slate-50">
                    <button
                        onClick={logout}
                        className={`flex items-center text-[11px] font-bold text-slate-350 hover:text-red-500 transition-all w-full rounded-xl hover:bg-red-50/50 ${isCollapsed ? 'justify-center py-2.5' : 'px-3 py-2'
                            }`}
                    >
                        <LogOut className={`w-4 h-4 flex-shrink-0 ${isCollapsed ? '' : 'mr-2.5'}`} />
                        {!isCollapsed && <span>Sair</span>}
                    </button>
                    {!isCollapsed && (
                        <div className="mt-2 flex items-center justify-center">
                            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'} mr-2 shadow-sm animate-pulse`}></div>
                            <span className="text-[9px] text-slate-300 font-bold tracking-widest uppercase">
                                {isOnline ? 'Conectado' : 'Offline'}
                            </span>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto flex flex-col relative w-full">
                <header className={`backdrop-blur-md bg-white/80 border-b border-slate-50 sticky top-0 z-20 h-14 md:h-16 flex justify-between items-center px-4 md:px-6`}>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 active:scale-95"
                        >
                            <Menu className="w-4 h-4" />
                        </button>

                        {/* Workspace Switcher */}
                        {(user.role === 'admin_business' || user.role === 'admin_vet') && (
                            <div className="hidden md:flex bg-slate-50/80 p-1 rounded-xl border border-slate-100/50">
                                <button
                                    onClick={() => switchWorkspace('clinical')}
                                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!isPetshopMode ? 'bg-white text-purple-600 shadow-sm border border-purple-50' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    Clínica
                                </button>
                                <button
                                    onClick={() => switchWorkspace('petshop')}
                                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isPetshopMode ? 'bg-white text-orange-500 shadow-sm border border-orange-50' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    Petshop
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="hidden lg:block">
                        <GlobalSearch />
                    </div>

                    <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${user.role.includes('admin') ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                    user.role === 'vet' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        'bg-slate-50 text-slate-500 border-slate-100'
                                    }`}>
                                    {user.role === 'admin_business' ? 'Admin / Gestor' :
                                        user.role === 'admin_vet' ? 'Admin / Diretor' :
                                            user.role === 'vet' ? 'Veterinário' :
                                                user.role === 'receptionist' ? 'Recepção' : user.role}
                                </span>
                                <span className="text-[10px] font-black text-slate-800 uppercase leading-none tracking-tight">{user.name}</span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Sessão Ativa</span>
                        </div>
                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[11px] font-black text-slate-400 shadow-sm">
                            {user.name[0]}
                        </div>
                    </div>
                </header>

                <div className="p-4 sm:p-6 md:p-8 h-full max-w-[1600px] w-full mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
