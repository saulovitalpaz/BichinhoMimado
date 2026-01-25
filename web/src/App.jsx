import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Clinical from './pages/Clinical';
import Petshop from './pages/Petshop';
import Finance from './pages/Finance';
import Internation from './pages/Internation';
import Agenda from './pages/Agenda';
import Vendas from './pages/Vendas';
import Clientes from './pages/Clientes';
import PetshopDashboard from './pages/PetshopDashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando...</div>;
  if (!user) return <Navigate to="/login" />;

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

        {/* Common Routes */}
        <Route path="/clinical" element={<Clinical />} />
        <Route path="/petshop" element={<Petshop />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/internation" element={<Internation />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/vendas" element={<Vendas />} />
        <Route path="/clientes" element={<Clientes />} />
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
