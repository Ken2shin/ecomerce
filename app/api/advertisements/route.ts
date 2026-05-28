import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { getActiveAdvertisements, getAllAdvertisements, createAdvertisement, updateAdvertisement, deleteAdvertisement } from '@/lib/advertisements';

export async function GET(request: NextRequest) {
  try {
    // Validate that Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[Ads API] Supabase configuration missing');
      return NextResponse.json(
        { error: 'Base de datos no configurada', data: [] },
        { status: 200 }
      );
    }

    // Check if admin is requesting all ads or just active ones
    let userIsAdmin = false;
    try {
      const user = await getCurrentUser();
      userIsAdmin = user ? await isAdmin(user.id) : false;
    } catch (authError) {
      console.warn('[Ads API] Auth check failed:', authError);
      userIsAdmin = false;
    }

    const ads = userIsAdmin ? await getAllAdvertisements() : await getActiveAdvertisements();

    return NextResponse.json(ads, { status: 200 });
  } catch (error) {
    console.error('[Ads API] GET error:', error);
    const message = error instanceof Error ? error.message : 'Error al obtener publicidades';
    return NextResponse.json({ error: message, data: [] }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate that Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Ads API] Supabase configuration missing for POST');
      return NextResponse.json(
        { error: 'Base de datos no configurada' },
        { status: 503 }
      );
    }

    const user = await getCurrentUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { title, imageUrl, linkUrl, description, position } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: 'Título e imagen son requeridos' },
        { status: 400 }
      );
    }

    const ad = await createAdvertisement({
      title,
      imageUrl,
      linkUrl,
      description,
      position,
    });

    // Revalidate home page and admin pages to show new ads
    revalidatePath('/');
    revalidatePath('/admin/publicidades');

    return NextResponse.json(ad, { status: 201 });
  } catch (error) {
    console.error('[Ads API] POST error:', error);
    const message = error instanceof Error ? error.message : 'Error al crear publicidad';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Validate that Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Ads API] Supabase configuration missing for PUT');
      return NextResponse.json(
        { error: 'Base de datos no configurada' },
        { status: 503 }
      );
    }

    const user = await getCurrentUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, imageUrl, linkUrl, description, position, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de publicidad es requerido' },
        { status: 400 }
      );
    }

    const ad = await updateAdvertisement(id, {
      title,
      imageUrl,
      linkUrl,
      description,
      position,
      isActive,
    });

    // Revalidate home page and admin pages to reflect updates
    revalidatePath('/');
    revalidatePath('/admin/publicidades');

    return NextResponse.json(ad, { status: 200 });
  } catch (error) {
    console.error('[Ads API] PUT error:', error);
    const message = error instanceof Error ? error.message : 'Error al actualizar publicidad';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Validate that Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Ads API] Supabase configuration missing for DELETE');
      return NextResponse.json(
        { error: 'Base de datos no configurada' },
        { status: 503 }
      );
    }

    const user = await getCurrentUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de publicidad es requerido' },
        { status: 400 }
      );
    }

    await deleteAdvertisement(id);

    // Revalidate home page and admin pages to reflect deletion
    revalidatePath('/');
    revalidatePath('/admin/publicidades');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Ads API] DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Error al eliminar publicidad';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
