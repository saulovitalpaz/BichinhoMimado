import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [workspace, setWorkspace] = useState('clinical'); // 'clinical' or 'petshop'

    useEffect(() => {
        // Check local storage for session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const userData = await loginUser(email, password);
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            // Default workspace logic
            if (userData.role === 'admin_business') {
                // Giovana defaults to Petshop? Or Clinic? Let's default to Clinic but allow switch
                setWorkspace('clinical');
            } else {
                setWorkspace('clinical');
            }
            return true;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        setWorkspace('clinical');
    };

    const switchWorkspace = (mode) => {
        setWorkspace(mode);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, workspace, switchWorkspace, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
