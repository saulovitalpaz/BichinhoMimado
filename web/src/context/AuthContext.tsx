import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
// import { loginUser } from '../utils/api'; // Commented out until API is ready

import { API_BASE_URL } from '../config';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin_business' | 'admin_vet' | 'vet' | 'receptionist' | 'groomer';
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    workspace: 'clinical' | 'petshop';
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    switchWorkspace: (mode: 'clinical' | 'petshop') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [workspace, setWorkspace] = useState<'clinical' | 'petshop'>('petshop');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        // ... existing login logic
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Credenciais inválidas');
            }

            const userData = await res.json();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            // Workspace logic based on new roles - FORCED PETSHOP DEFAULT FOR FLUIDITY PHASE
            if (userData.role === 'groomer' || userData.role === 'admin_business' || userData.role === 'receptionist') {
                setWorkspace('petshop');
            } else {
                setWorkspace('petshop'); // Defaulting everyone to Petshop for now as requested
            }

            return true;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        setWorkspace('clinical');
        navigate('/login');
    };

    const switchWorkspace = (mode: 'clinical' | 'petshop') => {
        setWorkspace(mode);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, workspace, switchWorkspace, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
