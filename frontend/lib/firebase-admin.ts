import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Helper to get Firebase user ID from request
export async function getFirebaseUserId(req: NextRequest): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('firebase-token');

        if (!token) {
            return null;
        }

        // In a real implementation, you would verify the Firebase ID token here
        // For now, we'll decode it client-side and trust it (not recommended for production)
        // You should use Firebase Admin SDK to verify tokens server-side

        // For development, we'll extract the user ID from the Authorization header
        const authHeader = req.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            const idToken = authHeader.substring(7);
            // This is a simplified version - in production, verify with Firebase Admin SDK
            return idToken;
        }

        return null;
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
