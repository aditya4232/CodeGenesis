'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, firebaseAuth, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { onIdTokenChanged } from 'firebase/auth';
import Cookies from 'js-cookie';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
    signUp: (email: string, password: string, displayName?: string) => Promise<{ user: User | null; error: string | null }>;
    signInWithGoogle: () => Promise<{ user: User | null; error: string | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const setAuthCookie = async (user: User) => {
        try {
            const token = await user.getIdToken();
            Cookies.set('firebase-token', token, {
                expires: 1 / 24, // 1 hour
                sameSite: 'strict',
                secure: window.location.protocol === 'https:'
            });
        } catch (error) {
            console.error('Error setting auth cookie:', error);
        }
    };

    useEffect(() => {
        // Listen for token changes to keep cookie fresh
        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            if (user) {
                await setAuthCookie(user);
                setUser(user);
            } else {
                Cookies.remove('firebase-token');
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const result = await firebaseAuth.signIn(email, password);
        if (result.user) {
            // Explicitly set cookie to await it before returning
            // This prevents race condition where router.push happens before cookie is set
            await setAuthCookie(result.user);
            setUser(result.user);
        }
        return result;
    };

    const signUp = async (email: string, password: string, displayName?: string) => {
        const result = await firebaseAuth.signUp(email, password, displayName);
        if (result.user) {
            await setAuthCookie(result.user);
            setUser(result.user);
        }
        return result;
    };

    const signInWithGoogle = async () => {
        const result = await firebaseAuth.signInWithGoogle();
        if (result.user) {
            await setAuthCookie(result.user);
            setUser(result.user);
        }
        return result;
    };

    const signOut = async () => {
        await firebaseAuth.signOut();
        Cookies.remove('firebase-token');
        setUser(null);
        router.push('/');
    };

    const resetPassword = async (email: string) => {
        return await firebaseAuth.resetPassword(email);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signIn,
                signUp,
                signInWithGoogle,
                signOut,
                resetPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
