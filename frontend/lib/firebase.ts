import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
    getAuth,
    Auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    User,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCTTKOhzVYzhxiRLwpic64YFFc_-wYG6tg",
    authDomain: "codegensis.firebaseapp.com",
    projectId: "codegensis",
    storageBucket: "codegensis.firebasestorage.app",
    messagingSenderId: "108108098689",
    appId: "1:108108098689:web:9e2b41361e961aa523b180",
    measurementId: "G-RB9ZKZ960Y"
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let auth: Auth;

if (typeof window !== 'undefined') {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
}

// Google Provider
const googleProvider = new GoogleAuthProvider();

// Auth Functions
export const firebaseAuth = {
    // Sign up with email/password
    signUp: async (email: string, password: string, displayName?: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (displayName && userCredential.user) {
                await updateProfile(userCredential.user, { displayName });
            }
            return { user: userCredential.user, error: null };
        } catch (error: any) {
            return { user: null, error: error.message };
        }
    },

    // Sign in with email/password
    signIn: async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { user: userCredential.user, error: null };
        } catch (error: any) {
            return { user: null, error: error.message };
        }
    },

    // Sign in with Google
    signInWithGoogle: async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return { user: result.user, error: null };
        } catch (error: any) {
            return { user: null, error: error.message };
        }
    },

    // Sign out
    signOut: async () => {
        try {
            await signOut(auth);
            return { error: null };
        } catch (error: any) {
            return { error: error.message };
        }
    },

    // Reset password
    resetPassword: async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { error: null };
        } catch (error: any) {
            return { error: error.message };
        }
    },

    // Get current user
    getCurrentUser: () => {
        return auth?.currentUser;
    },

    // Listen to auth state changes
    onAuthStateChanged: (callback: (user: User | null) => void) => {
        if (typeof window !== 'undefined') {
            return onAuthStateChanged(auth, callback);
        }
        return () => { };
    }
};

export { auth };
export type { User };
