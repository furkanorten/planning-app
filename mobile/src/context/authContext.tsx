import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import tokenService from '../services/tokenService';
import { logout as logoutApi } from '../services/authService';

interface AuthContextProps {
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const loggedIn = await tokenService.isLoggedIn();
                setIsLoggedIn(loggedIn);
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsLoggedIn(false);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const login = async (token: string) => {
        try {
            await tokenService.saveToken(token);
            setIsLoggedIn(true);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch (error) {
            console.warn('Logout API call failed:', error);
        } finally {
            await tokenService.removeToken();
            setIsLoggedIn(false);
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};