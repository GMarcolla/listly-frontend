import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

interface User {
    id: string;
    name?: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    signIn: (token: string, user: User) => void;
    signOut: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const signIn = (token: string, user: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
    };

    const signOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        api.defaults.headers.common['Authorization'] = '';
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
