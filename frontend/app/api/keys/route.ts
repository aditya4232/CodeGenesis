import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/firebase-admin';
import {
    storeEncryptedApiKey,
    getDecryptedApiKey,
    deleteApiKey,
    listConfiguredProviders,
    storeModelPreference,
    getModelPreference
} from '@/lib/secure-keys';

/**
 * GET /api/keys - List all configured providers
 */
export async function GET(req: NextRequest) {
    try {
        const { userId, error } = await requireAuth(req);

        if (error) { return error; }

        const result = await listConfiguredProviders(userId);

        if (!result.success) {
            return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
        }

        return NextResponse.json({ providers: result.providers });
    } catch (error: any) {
        console.error('Error in GET /api/keys:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/keys - Store an encrypted API key
 * Body: { provider, apiKey, keyName?, modelId?, isCustomModel? }
 */
export async function POST(req: NextRequest) {
    try {
        const { userId, error } = await requireAuth(req);

        if (error) { return error; }

        const body = await req.json();
        const { provider, apiKey, keyName, modelId, isCustomModel } = body;

        if (!provider || !apiKey) {
            return NextResponse.json(
                { error: 'Provider and API key are required' },
                { status: 400 }
            );
        }

        // Validate provider
        const validProviders = ['openai', 'anthropic', 'openrouter', 'groq', 'stability'];
        if (!validProviders.includes(provider)) {
            return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
        }

        // Store the encrypted key
        const result = await storeEncryptedApiKey(userId, provider, apiKey, keyName);

        if (!result.success) {
            return NextResponse.json({ error: 'Failed to store API key' }, { status: 500 });
        }

        // If model preference is provided, store it
        if (modelId) {
            await storeModelPreference(userId, provider, modelId, isCustomModel || false);
        }

        return NextResponse.json({
            success: true,
            message: 'API key stored securely',
            provider
        });
    } catch (error: any) {
        console.error('Error in POST /api/keys:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * DELETE /api/keys?provider=openai - Delete an API key
 */
export async function DELETE(req: NextRequest) {
    try {
        const { userId, error } = await requireAuth(req);

        if (error) { return error; }

        const { searchParams } = new URL(req.url);
        const provider = searchParams.get('provider');

        if (!provider) {
            return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
        }

        const result = await deleteApiKey(userId, provider as any);

        if (!result.success) {
            return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'API key deleted' });
    } catch (error: any) {
        console.error('Error in DELETE /api/keys:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
