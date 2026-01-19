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
 * GET /api/agent/conversations/[id]
 * Get a single conversation with all messages
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Get conversation
        const { data: conversation, error: convError } = await supabase
            .from('agent_conversations')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (convError || !conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Get messages
        const { data: messages, error: msgError } = await supabase
            .from('agent_messages')
            .select('*')
            .eq('conversation_id', id)
            .order('created_at', { ascending: true });

        if (msgError) {
            console.error('Error fetching messages:', msgError);
            return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
        }

        return NextResponse.json({
            conversation,
            messages: messages || [],
        });
    } catch (error) {
        console.error('GET /api/agent/conversations/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PUT /api/agent/conversations/[id]
 * Update a conversation
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { title, is_archived } = body;

        const updates: any = {};
        if (title !== undefined) updates.title = title;
        if (is_archived !== undefined) updates.is_archived = is_archived;

        const { data, error } = await supabase
            .from('agent_conversations')
            .update(updates)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating conversation:', error);
            return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('PUT /api/agent/conversations/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/agent/conversations/[id]
 * Delete a conversation and all its messages
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Delete conversation (messages will cascade delete)
        const { error } = await supabase
            .from('agent_conversations')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            console.error('Error deleting conversation:', error);
            return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/agent/conversations/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
