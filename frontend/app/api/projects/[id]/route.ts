import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/firebase-admin';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET /api/projects/[id] - Get single project
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId, error } = await requireAuth(req);
        if (error) return error;

        const { id: projectId } = await params;
        const { data: project, error: dbError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .eq('user_id', userId)
            .single();

        if (dbError || !project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json(project);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/projects/[id] - Update project
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId, error } = await requireAuth(req);
        if (error) return error;

        const { id: projectId } = await params;
        const body = await req.json();
        const { name, description, status, tech_stack, repository_url, deployment_url } = body;

        const updates: Record<string, any> = { updated_at: new Date().toISOString() };
        if (name) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (status) updates.status = status;
        if (tech_stack) updates.tech_stack = tech_stack;
        if (repository_url !== undefined) updates.repository_url = repository_url;
        if (deployment_url !== undefined) updates.deployment_url = deployment_url;

        const { data: project, error: dbError } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', projectId)
            .eq('user_id', userId)
            .select()
            .single();

        if (dbError) throw dbError;

        return NextResponse.json(project);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId, error } = await requireAuth(req);
        if (error) return error;

        const { id: projectId } = await params;
        // Verify ownership
        const { data: project } = await supabase
            .from('projects')
            .select('id')
            .eq('id', projectId)
            .eq('user_id', userId)
            .single();

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Delete related data first
        // Get chats to delete messages
        const { data: chats } = await supabase
            .from('project_chats')
            .select('id')
            .eq('project_id', projectId);

        if (chats && chats.length > 0) {
            for (const chat of chats) {
                await supabase.from('chat_messages').delete().eq('chat_id', chat.id);
            }
        }

        await supabase.from('project_chats').delete().eq('project_id', projectId);
        await supabase.from('project_files').delete().eq('project_id', projectId);

        // Delete project
        const { error: deleteError } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (deleteError) throw deleteError;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
