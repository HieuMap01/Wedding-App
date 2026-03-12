'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, AuthResponse } from '@/lib/api';

interface User {
    email: string;
    fullName: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { email: string; password: string; fullName: string; phone?: string; address?: string }) => Promise<void>;
    logout: () => void;
    isAdmin: boolean;
    isCouple: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const saveAuth = (data: AuthResponse) => {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        const u: User = { email: data.email, fullName: data.fullName, role: data.role };
        localStorage.setItem('user', JSON.stringify(u));
        setUser(u);
    };

    const login = useCallback(async (email: string, password: string) => {
        const res = await authApi.login({ email, password });
        saveAuth(res.data);
    }, []);

    const register = useCallback(async (data: { email: string; password: string; fullName: string; phone?: string; address?: string }) => {
        const res = await authApi.register(data);
        saveAuth(res.data);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            isAdmin: user?.role === 'SUPER_ADMIN',
            isCouple: user?.role === 'COUPLE',
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
