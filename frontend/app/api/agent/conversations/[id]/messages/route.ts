import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

/**
 * GET /api/agent/conversations/[id]/messages
 * Get all messages for a conversation
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify conversation belongs to user
        const { data: conversation } = await supabase
            .from('agent_conversations')
            .select('id')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Get messages
        const { data: messages, error } = await supabase
            .from('agent_messages')
            .select('*')
            .eq('conversation_id', id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
        }

        return NextResponse.json(messages || []);
    } catch (error) {
        console.error('GET /api/agent/conversations/[id]/messages error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/agent/conversations/[id]/messages
 * Add a new message to a conversation
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { role, content, message_type = 'text', artifact_data } = body;

        // Verify conversation belongs to user
        const { data: conversation } = await supabase
            .from('agent_conversations')
            .select('id')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Insert message
        const { data, error } = await supabase
            .from('agent_messages')
            .insert([{
                conversation_id: id,
                user_id: userId,
                role,
                content,
                message_type,
                artifact_data,
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding message:', error);
            return NextResponse.json({ error: 'Failed to add message' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('POST /api/agent/conversations/[id]/messages error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
