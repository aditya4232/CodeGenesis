import { supabaseAdmin, isSupabaseConfigured } from './supabase-server';
import crypto from 'crypto';

// Encryption key from environment
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_SECRET || 'default-dev-key-change-in-production';

// Simple AES-256 encryption (no custom RPC needed)
function encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText: string): string {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

type Provider = 'openai' | 'anthropic' | 'openrouter' | 'groq' | 'stability';

/**
 * Store an encrypted API key for a user
 */
export async function storeEncryptedApiKey(
    userId: string,
    provider: Provider,
    apiKey: string,
    keyName?: string
) {
    if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase not configured' };
    }

    try {
        // Deactivate existing keys
        await supabaseAdmin
            .from('encrypted_api_keys')
            .update({ is_active: false })
            .eq('user_id', userId)
            .eq('provider', provider);

        // Encrypt with our own function
        const encryptedKey = encrypt(apiKey);

        // Store the encrypted key
        const { data, error } = await supabaseAdmin
            .from('encrypted_api_keys')
            .insert({
                user_id: userId,
                provider,
                encrypted_key: encryptedKey,
                key_name: keyName,
                is_active: true
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error storing encrypted API key:', error);
        return { success: false, error };
    }
}

/**
 * Retrieve and decrypt an API key for a user
 */
export async function getDecryptedApiKey(userId: string, provider: Provider) {
    if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase not configured' };
    }

    try {
        const { data: keyData, error: fetchError } = await supabaseAdmin
            .from('encrypted_api_keys')
            .select('encrypted_key, id')
            .eq('user_id', userId)
            .eq('provider', provider)
            .eq('is_active', true)
            .single();

        if (fetchError || !keyData) {
            return { success: false, error: 'API key not found' };
        }

        // Decrypt with our function
        const decryptedKey = decrypt(keyData.encrypted_key);

        // Update last_used_at
        await supabaseAdmin
            .from('encrypted_api_keys')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', keyData.id);

        return { success: true, apiKey: decryptedKey };
    } catch (error) {
        console.error('Error retrieving decrypted API key:', error);
        return { success: false, error };
    }
}

/**
 * Delete an API key
 */
export async function deleteApiKey(userId: string, provider: Provider) {
    if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase not configured' };
    }

    try {
        const { error } = await supabaseAdmin
            .from('encrypted_api_keys')
            .delete()
            .eq('user_id', userId)
            .eq('provider', provider);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting API key:', error);
        return { success: false, error };
    }
}

/**
 * List all providers with configured keys for a user
 */
export async function listConfiguredProviders(userId: string) {
    if (!isSupabaseConfigured) {
        return { success: true, providers: [] }; // Return empty on missing config
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('encrypted_api_keys')
            .select('provider, key_name, is_active, last_used_at, created_at')
            .eq('user_id', userId)
            .eq('is_active', true);

        if (error) throw error;
        return { success: true, providers: data || [] };
    } catch (error) {
        console.error('Error listing configured providers:', error);
        return { success: true, providers: [] };
    }
}

/**
 * Store model preference
 */
export async function storeModelPreference(
    userId: string,
    provider: string,
    modelId: string,
    isCustom: boolean = false
) {
    if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('model_preferences')
            .upsert({
                user_id: userId,
                provider,
                model_id: modelId,
                is_custom: isCustom
            }, {
                onConflict: 'user_id,provider'
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error storing model preference:', error);
        return { success: false, error };
    }
}

/**
 * Get model preference
 */
export async function getModelPreference(userId: string, provider: string) {
    if (!isSupabaseConfigured) {
        return { success: true, preference: null };
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('model_preferences')
            .select('*')
            .eq('user_id', userId)
            .eq('provider', provider)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return { success: true, preference: data };
    } catch (error) {
        console.error('Error getting model preference:', error);
        return { success: false, error };
    }
}
