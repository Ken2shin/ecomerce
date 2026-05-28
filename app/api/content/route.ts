import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { getAllContent, updateContent, deleteContent } from '@/lib/content';

export async function GET(request: NextRequest) {
  try {
    const content = await getAllContent();
    return NextResponse.json(content, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener contenido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { sectionKey, title, content, imageUrl } = await request.json();
    const updated = await updateContent(sectionKey, { title, content, imageUrl });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar contenido';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
