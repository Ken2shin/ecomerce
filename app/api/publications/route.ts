import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import {
  getActivePublications,
  getAllPublications,
  createPublication,
  updatePublication,
  deletePublication,
} from '@/lib/publications';

// GET: Obtener publicaciones
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const adminParam = searchParams.get('admin');

    if (adminParam === 'true') {
      const user = await getCurrentUser();
      if (!user || !(await isAdmin(user.id))) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 403 }
        );
      }
      const publications = await getAllPublications();
      return NextResponse.json(publications);
    }

    const publications = await getActivePublications();
    return NextResponse.json(publications);
  } catch (error) {
    console.error('[API] Error en GET publicaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener publicaciones' },
      { status: 500 }
    );
  }
}

// POST: Crear publicación
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const publication = await createPublication(body);

    return NextResponse.json(publication, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear publicación';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
