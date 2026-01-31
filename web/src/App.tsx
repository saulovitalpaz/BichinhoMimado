import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';

// Import Old/Placeholder Pages
import Clinical from './pages/Clinical';
import Petshop from './pages/Petshop';
import Finance from './pages/Finance'; // Keeping for reference, but Financeiro nav will point to Cashier
import Internation from './pages/Internation';
import Agenda from './pages/Agenda'; // Keeping for reference, but Agenda nav will point to Calendar
import Clientes from './pages/Clientes';
import PetshopDashboard from './pages/PetshopDashboard';
import PetshopInventory from './pages/PetshopInventory';
import AdminServices from './pages/AdminServices';
import PetshopQueue from './pages/PetshopQueue';
import AdminFinance from './pages/AdminFinance';
import AdminFiscal from './pages/AdminFiscal';
import AdminProfessionals from './pages/admin/AdminProfessionals';
import AdminProfessionals from './pages/admin/AdminProfessionals';

// Import New Modules
import CalendarService from './modules/medical/CalendarService';
import CashierModule from './modules/financial/CashierModule';

// Protected Route Wrapper
const ProtectedRoute = ({ children, roles }: { children: JSX.Element, roles?: string[] }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="h-screen flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando...</div>;

    if (!user) return <Navigate to="/login" />;

    if (roles && !roles.includes(user.role) && !user.role.startsWith('admin')) {
        // Role not authorized
        return <Navigate to="/" />; // Or unauthorized page
    }

    return children;
};

// Layout Wrapper to access Context
const AppContent = () => {
    const { workspace } = useAuth();

    // Determine Home Page based on Workspace
    const Dashboard = workspace === 'petshop' ? PetshopDashboard : Home;

    return (
        <Layout>
            <Routes>
                {/* Dynamic Home Route */}
                <Route path="/" element={<Dashboard />} />

                {/* Main Application Routes */}
                <Route path="/clinical" element={<Clinical />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/estoque" element={<PetshopInventory />} />
                <Route path="/petshop/monitor" element={<PetshopQueue />} />
                <Route path="/internation" element={<Internation />} />

                {/* Protected Specialized Modules */}
                <Route
                    path="/agenda"
                    element={
                        <ProtectedRoute roles={['vet', 'receptionist', 'admin_business', 'admin_vet']}>
                            <Agenda />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/finance"
                    element={
                        <ProtectedRoute roles={['receptionist', 'admin_business', 'admin_vet']}>
                            <CashierModule />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Management */}
                <Route
                    path="/admin/services"
                    element={
                        <ProtectedRoute roles={['admin_business', 'admin_vet']}>
                            <AdminServices />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/finance"
                    element={
                        <ProtectedRoute roles={['admin_business']}>
                            <AdminFinance />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/fiscal"
                    element={
                        <ProtectedRoute roles={['admin_business']}>
                            <AdminFiscal />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Layout>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/*" element={
                        <ProtectedRoute>
                            <AppContent />
                        </ProtectedRoute>
                    } />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
