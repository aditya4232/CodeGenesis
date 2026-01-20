import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/firebase-admin';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
    try {
        const { userId, error } = await requireAuth(req);

        if (error) {
            return error;
        }

        const { data: profile, error: dbError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (dbError) {
            console.error('Supabase error fetching profile:', dbError);
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }

        return NextResponse.json(profile);
    } catch (error: any) {
        console.error('Internal error in GET /api/profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId, error } = await requireAuth(req);

        if (error) {
            return error;
        }

        const body = await req.json();

        // Ensure we only update the current user's profile
        const { data: profile, error: dbError } = await supabaseAdmin
            .from('profiles')
            .upsert({ ...body, id: userId })
            .select()
            .single();

        if (dbError) {
            console.error('Supabase error creating/updating profile:', dbError);
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }

        return NextResponse.json(profile);
    } catch (error: any) {
        console.error('Internal error in POST /api/profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
