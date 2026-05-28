import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { updateUserProfile } from '@/lib/auth';
import { UpdateProfileSchema } from '@/lib/schemas';

// ─────────────────────────────────────────────
// GET /api/profile
// ─────────────────────────────────────────────
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, full_name, phone, avatar_url, role, is_verified, created_at, updated_at')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[Profile GET] Error fetching profile:', profileError.message);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch profile';
    console.error('[Profile GET] Unexpected error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// PUT /api/profile
// Body: { full_name?, phone?, avatar_url? }
// ─────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const validation = UpdateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { full_name, phone, avatar_url } = validation.data;

    // null → undefined: updateUserProfile acepta string | undefined, no null.
    // El schema puede devolver null cuando el campo viene vacío desde el cliente,
    // así que normalizamos aquí en la frontera del handler.
    const updatedUser = await updateUserProfile(user.id, {
      fullName: full_name ?? undefined,
      phone: phone ?? undefined,
      avatarUrl: avatar_url ?? undefined,
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    console.error('[Profile PUT] Error:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
