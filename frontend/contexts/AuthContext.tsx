'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, firebaseAuth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

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

    useEffect(() => {
        const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const result = await firebaseAuth.signIn(email, password);
        if (result.user) {
            setUser(result.user);
        }
        return result;
    };

    const signUp = async (email: string, password: string, displayName?: string) => {
        const result = await firebaseAuth.signUp(email, password, displayName);
        if (result.user) {
            setUser(result.user);
        }
        return result;
    };

    const signInWithGoogle = async () => {
        const result = await firebaseAuth.signInWithGoogle();
        if (result.user) {
            setUser(result.user);
        }
        return result;
    };

    const signOut = async () => {
        await firebaseAuth.signOut();
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
