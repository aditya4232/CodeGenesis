import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/agent/cleanup
 * Manually trigger cleanup of expired conversations
 * This should be called by a cron job (e.g., Vercel Cron)
 */
export async function POST(request: NextRequest) {
    try {
        // Verify cron secret for security
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET || 'dev-secret';
        
        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Call the database function to cleanup expired conversations
        const { data, error } = await supabase.rpc('cleanup_expired_conversations');

        if (error) {
            console.error('Error during cleanup:', error);
            return NextResponse.json({ 
                error: 'Cleanup failed', 
                details: error.message 
            }, { status: 500 });
        }

        const deletedCount = data || 0;

        console.log(`Cleanup complete: ${deletedCount} conversations deleted`);

        return NextResponse.json({
            success: true,
            deleted_count: deletedCount,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('POST /api/agent/cleanup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * GET /api/agent/cleanup
 * Get cleanup statistics (optional, for monitoring)
 */
export async function GET(request: NextRequest) {
    try {
        // Count conversations that will be cleaned up
        const { count, error } = await supabase
            .from('agent_conversations')
            .select('*', { count: 'exact', head: true })
            .lt('expires_at', new Date().toISOString())
            .eq('is_archived', false);

        if (error) {
            console.error('Error getting cleanup stats:', error);
            return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
        }

        return NextResponse.json({
            pending_cleanup: count || 0,
            next_cleanup: 'Daily at midnight UTC',
        });
    } catch (error) {
        console.error('GET /api/agent/cleanup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
