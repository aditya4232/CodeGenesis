import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/firebase-admin';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/agent/conversations
 * Get all conversations for the authenticated user
 */
export async function GET(request: NextRequest) {
    try {
        const { userId, error: authError } = await requireAuth(request);

        if (authError) { return authError; }

        const { data, error: dbError } = await supabase
            .from('agent_conversations')
            .select('*')
            .eq('user_id', userId)
            .order('last_message_at', { ascending: false });

        if (dbError) {
            console.error('Error fetching conversations:', dbError);
            return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error('GET /api/agent/conversations error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/agent/conversations
 * Create a new conversation
 */
export async function POST(request: NextRequest) {
    try {
        const { userId, error: authError } = await requireAuth(request);

        if (authError) { return authError; }

        const body = await request.json();
        const { title = 'New Conversation' } = body;

        const { data, error: dbError } = await supabase
            .from('agent_conversations')
            .insert([{
                user_id: userId,
                title,
            }])
            .select()
            .single();

        if (dbError) {
            console.error('Error creating conversation:', dbError);
            return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('POST /api/agent/conversations error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
