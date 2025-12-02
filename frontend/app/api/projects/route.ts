import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: projects, error } = await supabaseAdmin
            .from('projects')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error fetching projects:', error);
            return NextResponse.json({
                error: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            }, { status: 500 });
        }

        return NextResponse.json(projects || []);
    } catch (error: any) {
        console.error('Internal error in GET /api/projects:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error?.message || 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, tech_stack, status } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Ensure profile exists (optional, but good practice)
        // We could check if profile exists, if not create it.
        // For now, we assume profile creation is handled by webhook or lazy creation.
        // Let's try to insert project.

        const { data: project, error } = await supabaseAdmin
            .from('projects')
            .insert([
                {
                    user_id: userId,
                    name,
                    description,
                    tech_stack: tech_stack || [],
                    status: status || 'planning'
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Supabase error creating project:', error);
            return NextResponse.json({
                error: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            }, { status: 500 });
        }

        return NextResponse.json(project);
    } catch (error: any) {
        console.error('Internal error in POST /api/projects:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error?.message || 'Unknown error'
        }, { status: 500 });
    }
}
