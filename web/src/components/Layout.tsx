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
    Package,
    Tag,
    Clock,
    Banknote
} from 'lucide-react';

interface NavItem {
    path?: string;
    icon?: any;
    label: string;
    color?: string;
    roles?: string[];
    type?: 'header';
}


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, workspace, switchWorkspace } = useAuth();
    const [isOnline, setIsOnline] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024); // Auto-collapse on tablet/mobile initially

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setIsCollapsed(true);
            else setIsCollapsed(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const clinicNav: any[] = [
        { type: 'header', label: 'Operacional' },
        { path: '/', icon: Home, label: 'Painel', color: 'text-slate-400' },
        { path: '/agenda', icon: Calendar, label: 'Agenda', color: 'text-indigo-500' },
        { path: '/clinical', icon: Stethoscope, label: 'Clínica', color: 'text-emerald-500' },
        { path: '/internation', icon: Activity, label: 'Internação', color: 'text-cyan-500' },
        { path: '/finance', icon: Banknote, label: 'Caixa / Checkout', color: 'text-purple-600' },

        { type: 'header', label: 'Cadastros' },
        { path: '/clientes', icon: Users, label: 'Clientes & Pets', color: 'text-blue-500' },
        { path: '/estoque', icon: Package, label: 'Estoque / Produtos', color: 'text-emerald-500' },
        { path: '/admin/services', icon: Tag, label: 'Serviços / Preços', color: 'text-pink-500' },
    ];

    const petshopNav: any[] = [
        { type: 'header', label: 'Operacional' },
        { path: '/', icon: Store, label: 'Dashboard', color: 'text-orange-500' },
        { path: '/agenda', icon: Calendar, label: 'Agenda', color: 'text-indigo-500' },
        { path: '/petshop/monitor', icon: Scissors, label: 'Monitor / Banho', color: 'text-pink-500' },
        { path: '/finance', icon: Banknote, label: 'Caixa / PDV', color: 'text-purple-600' },

        { type: 'header', label: 'Gestão & Cadastros' },
        { path: '/clientes', icon: Users, label: 'Clientes & Pets', color: 'text-blue-500' },
        { path: '/estoque', icon: Package, label: 'Estoque / Produtos', color: 'text-emerald-500', roles: ['admin_business', 'admin_vet'] },
        { path: '/admin/services', icon: Tag, label: 'Serviços / Preços', color: 'text-pink-500', roles: ['admin_business', 'admin_vet'] },
        { label: 'Relatórios', path: '/admin/finance', icon: Grid, color: 'text-green-600', roles: ['admin_business'] },
        { label: 'Config Fiscal', path: '/admin/fiscal', icon: Settings, color: 'text-slate-600', roles: ['admin_business'] }
    ];

    const filterNavByRole = (items: NavItem[]) => {
        if (user.role === 'admin_business' || user.role === 'admin_vet') return items;

        const roleRestrictions: Record<string, string[]> = {
            vet: ['/finance', '/petshop'],
            receptionist: ['/internation', '/estoque', '/admin/finance', '/admin/fiscal', '/admin/services'],
        };

        const restricted = roleRestrictions[user.role as keyof typeof roleRestrictions] || [];
        return items.filter(item => !item.path || !restricted.includes(item.path));
    };

    // FORCE PETSHOP NAV for this phase
    const navItems = filterNavByRole(petshopNav);

    return (
        <div className="flex h-screen bg-[#FDFDFD] text-slate-600 font-sans overflow-hidden">
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-slate-900/60 z-40 transition-opacity duration-300 md:hidden backdrop-blur-sm
                    ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}
                `}
                onClick={() => setIsCollapsed(true)}
            />

            {/* Sidebar */}
            <aside
                className={`fixed md:static inset-y-0 left-0 bg-white border-r border-slate-100 flex-shrink-0 flex flex-col z-50 transition-transform duration-300 ease-out shadow-2xl md:shadow-none
                    ${isCollapsed ? '-translate-x-full md:translate-x-0 md:w-16' : 'translate-x-0 w-[85vw] max-w-[300px] md:w-52'}
                `}
            >
                {/* Brand Header */}
                <div className={`flex items-center justify-between px-4 sm:px-6 border-b border-slate-50 transition-all duration-300 ${isCollapsed ? 'md:h-16' : 'h-24 md:h-28'}`}>
                    <div className={`relative transition-all duration-300 ${isCollapsed ? 'md:w-12 md:h-12' : 'w-32 sm:w-40 h-16'}`}>
                        <img src="/Logo.png" alt="Logo" className="w-full h-full object-contain filter drop-shadow-sm transition-transform hover:scale-105" />
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="md:hidden p-2 -mr-2 text-slate-400 hover:text-slate-600 active:scale-95 transition-transform"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                </div>

                <nav className="mt-4 flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
                    {navItems.map((item, idx) => {
                        if (item.type === 'header') {
                            return !isCollapsed && (
                                <div key={`header-${idx}`} className="px-2 py-4 mt-2 first:mt-0">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-350 block">{item.label}</span>
                                </div>
                            );
                        }

                        return item.path && item.icon && (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 768 && setIsCollapsed(true)}
                                className={`flex items-center rounded-2xl text-[13px] md:text-[11px] font-bold transition-all duration-200 group relative overflow-hidden ${location.pathname === item.path
                                    ? `${theme.primaryBg} ${theme.primary} shadow-sm`
                                    : 'hover:bg-slate-50 text-slate-500 hover:text-slate-800'
                                    } ${isCollapsed ? 'justify-center py-3 px-0 mb-2' : 'px-4 py-3.5 md:py-2.5'}`}
                            >
                                <item.icon className={`w-5 h-5 md:w-4 md:h-4 flex-shrink-0 transition-transform ${location.pathname === item.path ? theme.primary : 'opacity-60 group-hover:opacity-100'
                                    } ${isCollapsed ? 'm-0' : 'mr-4 md:mr-3'}`} />
                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-50 bg-slate-50/30">
                    <button
                        onClick={logout}
                        className={`flex items-center text-[11px] font-bold text-slate-400 hover:text-red-500 transition-all w-full rounded-2xl hover:bg-red-50 ${isCollapsed ? 'justify-center py-3' : 'px-4 py-3'
                            }`}
                    >
                        <LogOut className={`w-5 h-5 md:w-4 md:h-4 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                        {!isCollapsed && <span>Sair com segurança</span>}
                    </button>
                    {!isCollapsed && (
                        <div className="mt-4 flex items-center justify-center pt-2">
                            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'} mr-2 shadow-sm animate-pulse`}></div>
                            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                                {isOnline ? 'Online' : 'Offline'}
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
                        {/* Workspace Switcher HIDDEN for Fluidity Phase */}
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

                <div className="p-3 sm:p-4 md:p-6 h-full max-w-full lg:max-w-[1600px] w-full mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
