import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/firebase-admin';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET - Load project with all data
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId, error } = await requireAuth(req);
        if (error) return error;

        const { id: projectId } = await params;

        // Get project
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .eq('user_id', userId)
            .single();

        if (projectError || !project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Get files
        const { data: files } = await supabase
            .from('project_files')
            .select('*')
            .eq('project_id', projectId)
            .order('name');

        // Get chat sessions with messages
        const { data: chats } = await supabase
            .from('project_chats')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at');

        const chatsWithMessages = await Promise.all((chats || []).map(async (chat) => {
            const { data: messages } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('chat_id', chat.id)
                .order('created_at');
            return { ...chat, messages: messages || [] };
        }));

        // Update last accessed
        await supabase
            .from('projects')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', projectId);

        return NextResponse.json({
            project,
            files: files || [],
            chats: chatsWithMessages
        });

    } catch (error: any) {
        console.error('Error loading project:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Save project data
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId, error } = await requireAuth(req);
        if (error) return error;

        const { id: projectId } = await params;
        const body = await req.json();
        const { files, chats, projectName, framework, config } = body;

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

        // Update project metadata
        const updates: Record<string, any> = { updated_at: new Date().toISOString() };
        if (projectName) updates.name = projectName;
        if (framework) updates.framework = framework;
        if (config) updates.config = config;

        await supabase.from('projects').update(updates).eq('id', projectId);

        // Save files (upsert pattern)
        if (files && Array.isArray(files)) {
            // Get existing file names
            const { data: existingFiles } = await supabase
                .from('project_files')
                .select('id, name')
                .eq('project_id', projectId);

            const existingNames = new Set(existingFiles?.map(f => f.name) || []);
            const newNames = new Set(files.map((f: any) => f.name));

            // Delete removed files
            const toDelete = existingFiles?.filter(f => !newNames.has(f.name)) || [];
            for (const file of toDelete) {
                await supabase.from('project_files').delete().eq('id', file.id);
            }

            // Upsert files
            for (const file of files) {
                if (existingNames.has(file.name)) {
                    await supabase
                        .from('project_files')
                        .update({ content: file.content, language: file.language || 'plaintext' })
                        .eq('project_id', projectId)
                        .eq('name', file.name);
                } else {
                    await supabase.from('project_files').insert({
                        project_id: projectId,
                        name: file.name,
                        content: file.content,
                        language: file.language || 'plaintext'
                    });
                }
            }
        }

        // Save chats and messages
        if (chats && Array.isArray(chats)) {
            for (const chat of chats) {
                // Check if chat exists
                const { data: existingChat } = await supabase
                    .from('project_chats')
                    .select('id')
                    .eq('id', chat.id)
                    .single();

                let chatId = chat.id;

                if (!existingChat) {
                    const { data: newChat } = await supabase
                        .from('project_chats')
                        .insert({
                            id: chat.id,
                            project_id: projectId,
                            name: chat.name || 'Chat',
                            created_at: chat.createdAt || new Date().toISOString()
                        })
                        .select()
                        .single();
                    if (newChat) chatId = newChat.id;
                } else {
                    await supabase
                        .from('project_chats')
                        .update({ name: chat.name })
                        .eq('id', chat.id);
                }

                // Save messages
                if (chat.messages && Array.isArray(chat.messages)) {
                    // Clear existing messages and re-insert
                    await supabase.from('chat_messages').delete().eq('chat_id', chatId);

                    const messages = chat.messages.map((m: any, idx: number) => ({
                        chat_id: chatId,
                        role: m.role,
                        content: m.content,
                        files_changed: m.filesChanged || [],
                        created_at: m.timestamp || new Date(Date.now() + idx).toISOString()
                    }));

                    if (messages.length > 0) {
                        await supabase.from('chat_messages').insert(messages);
                    }
                }
            }
        }

        return NextResponse.json({ success: true, savedAt: new Date().toISOString() });

    } catch (error: any) {
        console.error('Error saving project:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete project
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

        // Delete in order: messages -> chats -> files -> project
        const { data: chats } = await supabase
            .from('project_chats')
            .select('id')
            .eq('project_id', projectId);

        for (const chat of chats || []) {
            await supabase.from('chat_messages').delete().eq('chat_id', chat.id);
        }

        await supabase.from('project_chats').delete().eq('project_id', projectId);
        await supabase.from('project_files').delete().eq('project_id', projectId);
        await supabase.from('projects').delete().eq('id', projectId);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error deleting project:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
