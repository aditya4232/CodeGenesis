import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
    req: Request,
    { params }: { params: any }
) {
    try {
        console.log('🚀 GET /api/projects/[id]: Route hit with params:', params);
        const { userId } = await auth();
        if (!userId) {
            console.log('GET /api/projects/[id]: Unauthorized');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('GET /api/projects/[id]: Auth successful, resolving params');
        let resolvedParams;
        if (params instanceof Promise) {
            try {
                resolvedParams = await params;
            } catch (paramError) {
                console.error('Error resolving params Promise:', paramError);
                return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
            }
        } else {
            resolvedParams = params;
        }
        console.log('GET /api/projects/[id]: Resolved params:', resolvedParams);
        const { id } = resolvedParams;
        console.log(`GET /api/projects/${id}: Fetching for user ${userId}`);

        // Fetch project
        console.log(`GET /api/projects/${id}: Querying database with id:`, id);
        const { data: project, error: projectError } = await supabaseAdmin
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (projectError) {
            console.error(`GET /api/projects/${id}: Supabase error:`, projectError);
            console.error('Error details:', {
                message: projectError.message,
                details: projectError.details,
                hint: projectError.hint,
                code: projectError.code
            });
            if (projectError.message?.includes('fetch failed') || projectError.message?.includes('ConnectTimeoutError')) {
                return NextResponse.json({
                    error: 'Database connection failed',
                    details: 'Cannot connect to Supabase. Check your internet connection and try again.',
                    suggestion: 'This appears to be a network connectivity issue.'
                }, { status: 503 });
            }

            return NextResponse.json({
                error: 'Database error',
                details: projectError.message,
                code: projectError.code
            }, { status: 500 });
        }

        console.log(`GET /api/projects/${id}: Project found:`, !!project);

        if (!project) {
            console.log(`GET /api/projects/${id}: Project not found`);
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (project.user_id !== userId) {
            console.log(`GET /api/projects/${id}: Forbidden (Owner: ${project.user_id}, Requester: ${userId})`);
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch generations for chat history
        const { data: generations, error: generationsError } = await supabaseAdmin
            .from('generations')
            .select('*')
            .eq('project_id', id)
            .order('created_at', { ascending: true });

        if (generationsError) {
            console.error('Error fetching generations:', generationsError);
        }

        return NextResponse.json({
            ...project,
            generations: generations || []
        });
    } catch (error) {
        console.error('Internal error in GET /api/projects/[id]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: any }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let resolvedParams;
        if (params instanceof Promise) {
            resolvedParams = await params;
        } else {
            resolvedParams = params;
        }
        const { id } = resolvedParams;
        const updates = await req.json();

        // Verify ownership
        const { data: existingProject, error: fetchError } = await supabaseAdmin
            .from('projects')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existingProject) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (existingProject.user_id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Update project
        const { data: updatedProject, error: updateError } = await supabaseAdmin
            .from('projects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error('Internal error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: any }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            console.log('DELETE /api/projects/[id]: Unauthorized');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let resolvedParams;
        if (params instanceof Promise) {
            resolvedParams = await params;
        } else {
            resolvedParams = params;
        }
        const { id } = resolvedParams;
        console.log(`DELETE /api/projects/${id}: Request from user ${userId}`);

        // Verify ownership
        const { data: existingProject, error: fetchError } = await supabaseAdmin
            .from('projects')
            .select('user_id, name')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error(`DELETE /api/projects/${id}: Fetch error:`, fetchError);
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (!existingProject) {
            console.log(`DELETE /api/projects/${id}: Project not found`);
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (existingProject.user_id !== userId) {
            console.log(`DELETE /api/projects/${id}: Forbidden (Owner: ${existingProject.user_id}, Requester: ${userId})`);
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        console.log(`DELETE /api/projects/${id}: Deleting project "${existingProject.name}"`);

        // Delete generations first (even though CASCADE should handle it)
        const { error: generationsDeleteError } = await supabaseAdmin
            .from('generations')
            .delete()
            .eq('project_id', id);

        if (generationsDeleteError) {
            console.error(`DELETE /api/projects/${id}: Error deleting generations:`, generationsDeleteError);
            // Continue anyway, CASCADE should handle it
        } else {
            console.log(`DELETE /api/projects/${id}: Deleted associated generations`);
        }

        // Delete project
        const { error: deleteError } = await supabaseAdmin
            .from('projects')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error(`DELETE /api/projects/${id}: Delete error:`, deleteError);
            return NextResponse.json({
                error: 'Failed to delete project',
                details: deleteError.message
            }, { status: 500 });
        }

        console.log(`DELETE /api/projects/${id}: Successfully deleted`);
        return NextResponse.json({ success: true, message: 'Project deleted successfully' });
    } catch (error: any) {
        console.error('DELETE /api/projects/[id]: Internal error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
