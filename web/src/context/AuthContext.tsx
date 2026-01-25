import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
// import { loginUser } from '../utils/api'; // Commented out until API is ready

// Types
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
    const [workspace, setWorkspace] = useState<'clinical' | 'petshop'>('clinical');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        // Mock Login for now - will be replaced by API call later
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        let mockUser: User;

        if (email === 'admin@mimado.com') {
            mockUser = { id: '1', name: 'Administrador', email, role: 'admin_business' };
        } else if (email === 'vet@mimado.com') {
            mockUser = { id: '2', name: 'Dr. Veterinário', email, role: 'vet' };
        } else if (email === 'recepcao@mimado.com') {
            mockUser = { id: '3', name: 'Recepção', email, role: 'receptionist' };
        } else {
            throw new Error('Credenciais inválidas');
        }

        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));

        // Workspace logic
        if (mockUser.role === 'admin_business' || mockUser.role === 'admin_vet') {
            setWorkspace('clinical');
        } else {
            setWorkspace('clinical');
        }

        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        setWorkspace('clinical');
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
