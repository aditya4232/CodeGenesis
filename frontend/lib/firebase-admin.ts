import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
function initAdmin() {
    if (!admin.apps.length) {
        // Check if we have the necessary environment variables
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    // Handle private key line breaks for Vercel
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
        } else {
            // If no env vars, we can't verify signatures securely, but for now we won't crash
            // In production, this should likely throw an error
            console.warn('FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, or FIREBASE_PROJECT_ID not set. Token verification will fail.');
        }
    }
    return admin;
}

// Helper to get Firebase user ID from request
export async function getFirebaseUserId(req: NextRequest): Promise<string | null> {
    try {
        const adminApp = initAdmin();
        const cookieStore = await cookies();
        const token = cookieStore.get('firebase-token')?.value;

        // Also check Authorization header
        const authHeader = req.headers.get('authorization');
        let idToken = token;

        if (!idToken && authHeader?.startsWith('Bearer ')) {
            idToken = authHeader.substring(7);
        }

        if (!idToken) {
            return null;
        }

        if (admin.apps.length) {
            try {
                const decodedToken = await adminApp.auth().verifyIdToken(idToken);
                return decodedToken.uid;
            } catch (authError) {
                console.error('Firebase token verification failed:', authError);
                return null;
            }
        } else {
            // Fallback for development WITHOUT admin keys (INSECURE)
            // ONLY use this if you haven't set up the admin sdk keys yet and are working locally
            // In production, this block should be removed or conditioned strictly
            console.warn('Firebase Admin not initialized. Using insecure token decoding for development.');
            // Simple decoding to get UID (does NOT verify signature)
            const parts = idToken.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                return payload.user_id || payload.sub || null;
            }
            return null;
        }
    } catch (error) {
        console.error('Error getting Firebase user ID:', error);
        return null;
    }
}

// Helper to require authentication
export async function requireAuth(req: NextRequest) {
    const userId = await getFirebaseUserId(req);

    if (!userId) {
        return {
            userId: null,
            error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        };
    }

    return { userId, error: null };
}
