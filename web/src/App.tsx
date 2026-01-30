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
import Vendas from './pages/Vendas';
import Clientes from './pages/Clientes';
import PetshopDashboard from './pages/PetshopDashboard';
import PetshopInventory from './pages/PetshopInventory';
import AdminServices from './pages/AdminServices';
import PetshopQueue from './pages/PetshopQueue';
import AdminFinance from './pages/AdminFinance';

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

                {/* Clinical / Medical Routes */}
                <Route path="/clinical" element={<Clinical />} />

                {/* Admin Routes */}
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

                {/* Calendar Integration - Replaces old Agenda or accessed via specific route */}
                <Route
                    path="/agenda"
                    element={
                        <ProtectedRoute roles={['vet', 'receptionist', 'admin_business']}>
                            <CalendarService />
                        </ProtectedRoute>
                    }
                />

                {/* Financial Routes */}
                <Route
                    path="/finance"
                    element={
                        <ProtectedRoute roles={['receptionist', 'admin_business']}>
                            <CashierModule />
                        </ProtectedRoute>
                    }
                />

                {/* Other Routes */}
                <Route path="/petshop" element={<Petshop />} />
                <Route path="/petshop/monitor" element={<PetshopQueue />} />
                <Route path="/internation" element={<Internation />} />
                <Route path="/vendas" element={<Vendas />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/estoque" element={<PetshopInventory />} />
                <Route
                    path="/admin/services"
                    element={
                        <ProtectedRoute roles={['admin_business', 'admin_vet']}>
                            <AdminServices />
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
